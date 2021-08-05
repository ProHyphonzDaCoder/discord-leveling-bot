// Importing Packages
const Discord = require("discord.js")
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')
const { join } = require("path")
const fs = require("fs");
const { readdirSync } = require("fs");

const client = new Discord.Client()

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const talkedRecently = new Map();

// Token, Prefix, and Owner ID
const config = require("./config.json")

// Events
client.login(config.token)
/*
<<<<<<< HEAD
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(f => {
        if (!f.endsWith(".js")) return;
        const event = require(`./events/${f}`);
        let eventName = f.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
=======
*/
client.on("ready", () => {
	client.user.setActivity("!help | Official FA Leveling Bot!", { type: "PLAYING" }).catch(console.error)
	
    // Check if the table "points" exists.
    const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
    if (!levelTable['count(*)']) {
        sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
    }

    client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
    client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");

    // Check if the table "backgrounds" exists.
    const bgTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'background';").get();
    if (!bgTable['count(*)']) {
        sql.prepare("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)").run();
    }

    client.getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?");
    client.setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

    // Role table for levels
    const roleTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
    if (!roleTable['count(*)']) {
        sql.prepare("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);").run();
    }

    // Prefix table
    const prefixTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefix';").get();
    if (!prefixTable['count(*)']) {
        sql.prepare("CREATE TABLE prefix (serverprefix TEXT, guild TEXT PRIMARY KEY);").run();
    }

    // Blacklist table
    const blacklistTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'blacklistTable';").get();
    if (!blacklistTable['count(*)']) {
        sql.prepare("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);").run();
    }

    // Settings table
    const settingsTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'settings';").get();
    if (!settingsTable['count(*)']) {
        sql.prepare("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);").run();
    }

    const channelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'channel';").get();
    if (!channelTable['count(*)']) {
        sql.prepare("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);").run();
    }


    // RankCard table (WORK IN PROGRESS, STILL IN THE WORKS)
    // const rankCardTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'rankCardTable';").get();
    // if (!rankCardTable['count(*)']) {
    // sql.prepare("CREATE TABLE rankCardTable (id TEXT PRIMARY KEY, user TEXT, guild TEXT, image BLOB, fontColor TEXT, barColor TEXT, overlay TEXT);").run();
    // }

    console.log(`Logged in as ${client.user.username}`)
});

// Command Handler
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${file}`));
    client.commands.set(command.name, command);
}

// Message Events
client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const currentPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);
    const Prefix = config.prefix;
    var getPrefix;
    if (!currentPrefix) {
        sql.prepare("INSERT OR REPLACE INTO prefix (serverprefix, guild) VALUES (?,?);").run(Prefix, message.guild.id)
        getPrefix = Prefix.toString();
    } else {
        getPrefix = currentPrefix.serverprefix.toString();
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(getPrefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("There was an error executing that command.").catch(console.error);
    }
//>>>>>>> parent of b1b1286 (Fix formatting issue)
});

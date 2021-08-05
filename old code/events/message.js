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

const config = require("../config.json");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    var recentMessages = [];
	var cancelCommand = false;

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
    if (!prefixRegex.test(message.content)) { cancelCommand = true; }

if(!cancelCommand) {
    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

	if(!cancelCommand)  {
    // Command Handler
    const commandFiles = readdirSync(join(__dirname, "../commands")).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "../commands", `${file}`));
        client.commands.set(command.name, command);
    }
	}


    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
		

    if (!command) cancelCommand = true;

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
                `Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command.`
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
if(!cancelCommand) {
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("There was an error executing that command.").catch(console.error);
    }
}

    // Settings table
    const settingsTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'settings';").get();
    if (!settingsTable['count(*)']) {
        sql.prepare("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);").run();
    }
	
    // Check if the table "points" exists.
    const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();

    if (!levelTable['count(*)']) {
        sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
    }

    client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
    client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");
    var level = client.getLevel.get(message.author.id, message.guild.id);
    // get level and set level
    if (!level) {
        let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
        insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
        return;
    }
    let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
    if (blacklist.get(`${message.guild.id}-${message.author.id}`) || blacklist.get(`${message.guild.id}-${message.channel.id}`)) return;

    let customSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?").get(message.guild.id);
    let channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?").get(message.guild.id);

    let getXpfromDB;
    let getCooldownfromDB;

    if (!customSettings) {
        getXpfromDB = 16; // Default
        getCooldownfromDB = 1000;
    } else {
        getXpfromDB = customSettings.customXP;
        getCooldownfromDB = customSettings.customCooldown;
    }

    // xp system
    const generatedXp = Math.floor(Math.random() * getXpfromDB);
    const nextXP = level.level * 2 * 250 + 250
    // Anti-spam to prevent users from posting spam in the hopes of leveling up
    if (recentMessages.includes(message.content) || message.content.startsWith("!")) {
        return console.log('yes');
    } else { // cooldown is 10 seconds
	        recentMessages.push(message.content);

        level.xp += generatedXp;
        level.totalXP += generatedXp;


        // level up!
        if (level.xp >= nextXP) {
            level.xp = 0;
            level.level += 1;

            let levelUpMsg;

                function antonymsLevelUp(string) {
                    return string
                        .replace(/{member}/i, `${message.member}`)
                        .replace(/{xp}/i, `${level.xp}`)
                        .replace(/{level}/i, `${level.level}`)
                }
                message.channel.send(antonymsLevelUp(customSettings.levelUpMessage.toString()));
            

            }
        };
        client.setLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, level.xp, level.level, level.totalXP);
        // add cooldown to user
        setTimeout(function() {
            recentMessages = [];
        }, 5000);
    }
    // level up, time to add level roles
    const member = message.member;
    let Roles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?")

    let roles = Roles.get(message.guild.id, client.getLevel.get(message.author.id, message.guild.id).level)
    if (!roles) return;
    if (client.getLevel.get(message.author.id, message.guild.id).level >= roles.level) {
        if (roles) {
            if (member.roles.cache.get(roles.roleID)) {
                return;
            }
            if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
                return
            }
            member.roles.add(roles.roleID);
        }
    }
}

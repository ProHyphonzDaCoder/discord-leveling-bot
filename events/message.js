// Importing Packages
const Discord = require("discord.js")
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')
const {
    join
} = require("path")
const fs = require("fs");
const {
    readdirSync
} = require("fs");

const client = new Discord.Client()

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const talkedRecently = new Map();

const config = require("../config.json");

module.exports = async (client, message) => {
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

    // Command Handler
    const commandFiles = readdirSync(join(__dirname, "../commands")).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "../commands", `${file}`));
        client.commands.set(command.name, command);
    }


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
                `Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command.`
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

    let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
    if (blacklist.get(`${message.guild.id}-${message.author.id}`) || blacklist.get(`${message.guild.id}-${message.channel.id}`)) return;

    // get level and set level
    const level = client.getLevel.get(message.author.id, message.guild.id)
    if (!level) {
        let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
        insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
        return;
    }

    let customSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?").get(message.guild.id);
    let channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?").get(message.guild.id);

    const lvl = level.level;

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
    // message content or characters length has to be more than 4 characters also cooldown
    if (talkedRecently.get(message.author.id) || message.content.length < 3 || message.content.startsWith(config.prefix)) {
        return;
    } else { // cooldown is 10 seconds
        level.xp += generatedXp;
        level.totalXP += generatedXp;


        // level up!
        if (level.xp >= nextXP) {
            level.xp = 0;
            level.level += 1;

            let levelUpMsg;
            let embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("RANDOM")
                .setThumbnail(message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setTimestamp();

            if (!customSettings) {
                embed.setDescription(`**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`);
                levelUpMsg = `**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`;
            } else {
                function antonymsLevelUp(string) {
                    return string
                        .replace(/{member}/i, `${message.member}`)
                        .replace(/{xp}/i, `${level.xp}`)
                        .replace(/{level}/i, `${level.level}`)
                }
                embed.setDescription(antonymsLevelUp(customSettings.levelUpMessage.toString()));
                levelUpMsg = antonymsLevelUp(customSettings.levelUpMessage.toString());
            }
            // using try catch if bot have perms to send EMBED_LINKS      
            try {
                if (!channelLevel || channelLevel.channel == "Default") {
                    message.channel.send(embed);
                } else {
                    let channel = message.guild.channels.cache.get(channelLevel.channel)
                    const permissionFlags = channel.permissionsFor(message.guild.me);
                    if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
                    channel.send(embed);
                }
            } catch (err) {
                if (!channelLevel || channelLevel.channel == "Default") {
                    message.channel.send(levelUpMsg);
                } else {
                    let channel = message.guild.channels.cache.get(channelLevel.channel)
                    const permissionFlags = channel.permissionsFor(message.guild.me);
                    if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
                    channel.send(levelUpMsg);
                }
            }
        };
        client.setLevel.run(level);
        // add cooldown to user
        talkedRecently.set(message.author.id, Date.now() + getCooldownfromDB);
        setTimeout(() => talkedRecently.delete(message.author.id, Date.now() + getCooldownfromDB))
    }
    // level up, time to add level roles
    const member = message.member;
    let Roles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?")

    let roles = Roles.get(message.guild.id, lvl)
    if (!roles) return;
    if (lvl >= roles.level) {
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
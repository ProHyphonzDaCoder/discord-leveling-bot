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

    // Check if the table "points" exists.
    const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();

    if (!levelTable['count(*)']) {
        sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
    }

    client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
    client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");
    level = client.getLevel.get(message.author.id, message.guild.id);
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
    // Anti-spam to prevent users from posting spam in the hopes of leveling up
    if (recentMessages.includes(message.content) || message.content.startsWith("!")) {
        return;
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

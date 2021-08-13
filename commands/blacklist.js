const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES],
});

module.exports = {
    name: 'blacklist',
    aliases: ['blacklist'],
    category: "Leveling",
    description: "Blacklist user from gaining XP",
    cooldown: 3,
    "options": [
        {
            "name": "user",
            "description": "The user of whom to blacklist",
            "type": 6,
            "required": true
        }
    ],  
    async execute (interaction) {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        let ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);

            let user = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(1).join(" ") ||x.user.username === args[1])
            if(!args[1])
                return message.reply(`Please mention an user!`);
            if(!user)
                return message.reply(`Cannot find user!`);
            if(args[2] && args[2].toLowerCase() == "remove")
                {
                    if(!ifExists.get(`${message.guild.id}-${user.id}`))
                        return message.reply(`This user is not blacklisted!`);
                    else 
                        sql.prepare("DELETE FROM blacklistTable WHERE id = ?").run(`${message.guild.id}-${user.id}`);
                        return message.reply(`Successfully removed user from blacklist`);
                }
            if(ifExists.get(`${message.guild.id}-${user.id}`))
                    return message.reply(`This user is already blacklisted!`);
            else 
                    sql.prepare("INSERT OR REPLACE INTO blacklistTable (guild, typeId, type, id) VALUES (?, ?, ?, ?);").run(message.guild.id, user.id, "User", `${message.guild.id}-${user.id}`);
                    return message.reply(`User ${user} has been blacklisted!`);
            }

}
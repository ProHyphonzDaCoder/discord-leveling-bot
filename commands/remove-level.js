const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES],
});
module.exports = {
    name: 'remove-level',
    aliases: ['removelevel'],
    category: "Leveling",
    description: "Remove or decrease level to specified user",
    cooldown: 3,
    "options": [
        {
            "name": "user",
            "description": "The user of whom to remove level (defaults to you)",
            "type": 6,
            "required": false
        },        
        {
            "name": "level",
            "description": "The level to take from the user",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 4,
            "required": true,
        }
    ],    
    async execute (message, args) {
        let user = interaction.options.getUser("user", false) || interaction.user;

        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        const levelArgs = interaction.getInteger("level");

        client.getScore = sql.prepare("SELECT * FROM  WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
        if(!user) {
            return interaction.reply(`Please mention an user!`)
        } else {
            if(isNaN(levelArgs) || levelArgs < 1) {
                return interaction.reply(`Please provide a valid number!`)
            } else {
                let score = client.getScore.get(user.id, message.guild.id);
                if(!score) {
                    score = {
                        id: `${message.guild.id}-${user.id}`,
                        user: interaction.user.id,
                        guild: interaction.guild.id,
                        xp: 0,
                        level: 0,
                        totalXP: 0
                    }
                }
                if(score.level - levelArgs < 1) {
                    return interaction.reply(`You cannot remove levels from this user!`)
                }    
 		score.level -= levelArgs
                const newTotalXP = levelArgs - 1
                let embed = new Discord.MessageEmbed()
                    .setTitle(`Success!`)
                    .setDescription(`Successfully removed level ${levelArgs} from ${user.toString()}!`)
                    .setColor("#5AC0DE");
                
                score.totalXP -= newTotalXP * 2 * 250 + 250
                client.setScore.run(score);
                return message.channel.send(embed);
            }
        }
    }
}
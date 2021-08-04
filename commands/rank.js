const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();
const canvacord = require("canvacord");

module.exports = {
    name: 'rank',
    aliases: ['rank'],
    description: "Check users rank and xp",
    cooldown: 3,
    category: "Leveling",
    async execute (message, args) {

        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0]) || message.member;

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
		

		
        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP").all(message.guild.id);
        let score = client.getScore.get(user.id, message.guild.id);
        if (!score) {
        return message.reply(`This user does not have any XP yet!`)
        }
        const levelInfo = score.level
        const nextXP = levelInfo * 2 * 250 + 250
        const xpInfo = score.xp;
        const totalXP = score.totalXP
        let rank = top10.sort((a, b) => {
        return b.totalXP - a.totalXP
        });
        let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        if(!message.guild.me.hasPermission("ATTACH_FILES")) return message.reply(`**Missing Permission**: ATTACH_FILES or MESSAGE ATTACHMENTS`);
		
		try {
			var cardBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?").get(user.id, message.guild.id).bg;
			var bgType = "IMAGE";
			message.reply("Note: it appears that this user has a custom background set up. It may take slightly longer to load their profile.");
		} catch(e) {
			var cardBg = "#000000";
			var bgType = "COLOR";
		}	
 
    const rankCard = new canvacord.Rank()
        .setAvatar(user.user.displayAvatarURL({ format: "jpg" }))
		.setStatus(user.user.presence.status, true, 1)
        .setCurrentXP(xpInfo)
        .setRequiredXP(nextXP)
        .setProgressBar("#5AC0DE", "COLOR")
        .setUsername(user.user.username)
        .setDiscriminator(user.user.discriminator)
        .setRank(ranking)
        .setLevel(levelInfo)
		.setLevelColor("#5AC0DE")
		.renderEmojis(true)
		.setBackground(bgType, cardBg);
    
        rankCard.build()
    .then(data => {
        const attachment = new Discord.MessageAttachment(data, "RankCard.png");
        message.channel.send(attachment);
    });

    }

}

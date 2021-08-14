const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
const canvacord = require("canvacord");

module.exports = {
    name: 'rank',
    aliases: ['rank'],
    description: "Get your rank or another member's rank",
    cooldown: 3,
    category: "Leveling",
    async execute(interaction) {
        if(!interaction.isCommand()) return console.log("yes");

        await interaction.deferReply()
            .then(console.log("a"))
            .catch(console.error);

        await interaction.deferReply()
            .then(console.log("a"))
            .catch(console.error);

        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0]) || message.member;

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");



        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP").all(interaction.guild.id);
        let score = client.getScore.get(user.id, interaction.guild.id);
        if (!score) {
            return interaction.editReply(`This user does not have any XP yet!`)
        }
        const levelInfo = score.level
        const nextXP = levelInfo * 2 * 250 + 250
        const xpInfo = score.xp;
        const totalXP = score.totalXP
        let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
        });
        let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        //if (!interaction.guild.me.hasPermission("ATTACH_FILES")) return interaction.editReply(`**Missing Permission**: ATTACH_FILES or MESSAGE ATTACHMENTS`);

        try {
            var cardBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?").get(user.id, message.guild.id).bg;
            var bgType = "IMAGE";
        } catch (e) {
            var cardBg = "#000000";
            var bgType = "COLOR";
        }

console.log(interaction.member.presence);
        const rankCard = new canvacord.Rank()
            .setAvatar(user.displayAvatarURL({
                format: "jpg"
            }))
            .setStatus(interaction.member.presence.status, true, 1)
            .setCurrentXP(xpInfo)
            .setRequiredXP(nextXP)
            .setProgressBar("#5AC0DE", "COLOR")
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setRank(ranking)
            .setLevel(levelInfo)
            .setLevelColor("#5AC0DE")
            .renderEmojis(true)
            .setBackground(bgType, cardBg);

        rankCard.build()
            .then(data => {
                const attachment = new Discord.MessageAttachment(data, "RankCard.png");
                return interaction.editReply({attachments: [attachment]});
            });

    }

}

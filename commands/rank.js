const {
	MessageAttachment
} = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");
const {
	Rank
} = require("canvacord");

module.exports = {
	name: "rank",
	aliases: ["rank"],
	description: "Get your rank or another member's rank",
	cooldown: 3,
	options: [{
		name: "target",
		description: "The user's rank card to show",
		type: 6,
		required: false,
	}, ],
	category: "Leveling",
	async execute(interaction) {
		if (!interaction.isCommand()) return;
		await interaction.deferReply();

		const client = interaction.client;
		const user = interaction.options.getMember("target") || interaction.member;

		client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
		client.setScore = sql.prepare(
			"INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);"
		);

		const top10 = sql
			.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP")
			.all(interaction.guild.id);
		const score = client.getScore.get(user.id, interaction.guild.id);

		if (!score)
			return interaction.followUp(
				user === interaction.member ?
				"You do not have any XP yet! Chat and be active to get more XP." :
				`${user.user.username} does not have any XP yet!`
			);

		const levelInfo = score.level;
		const nextXP = levelInfo * 2 * 250 + 250;
		const xpInfo = score.xp;
		const totalXP = score.totalXP;

		const rank = top10.sort((a, b) => b.totalXP - a.totalXP);
		const ranking = rank.map((x) => x.totalXP).indexOf(totalXP) + 1;

		try {
			var cardBg = sql
				.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?")
				.get(user.id, interaction.guild.id).bg;
			var bgType = "IMAGE";
		} catch (e) {
			var cardBg = "#000000";
			var bgType = "COLOR";
		}

		const rankCard = new Rank()
			.setAvatar(
				user.user.displayAvatarURL({
					format: "jpg",
				})
			)
			.setStatus(user?.presence?.status ?? "offline", true, 1)
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

		const card = await rankCard.build();
		await interaction.followUp({
			files: [new MessageAttachment(card, "RankCard.png")],
		});
	},
};
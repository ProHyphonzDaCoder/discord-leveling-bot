const { MessageEmbed } = require("discord.js");
const SQlite = require("better-sqlite3");

const sql = new SQlite("./mainDB.sqlite");

module.exports = {
	name: "set-xp",
	aliases: [],
	category: "Leveling",
	description: "Set the xp to something of the specified user",
	cooldown: 3,
	options: [
		{
			name: "xp",
			description: "The xp to add",
			type: 4,
			required: true,
		},
		{
			name: "user",
			description: "The user of whom to add xp (defaults to you)",
			type: 6,
			required: false,
		},
	],
	async execute(interaction) {
		const { client } = interaction;
		const user = interaction.options.getUser("user") || interaction.user;

		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		await interaction.deferReply();

		const xpArgs = interaction.options.getInteger("xp");
		client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
		client.setScore = sql.prepare(
			"INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);"
		);

		if (!user) return interaction.reply("Please mention an user!");

		if (isNaN(xpArgs) || xpArgs < 0) return interaction.editReply("Please provide a valid number!");

		let score = client.getScore.get(user.id, interaction.guild.id);
		if (!score)
			score = {
				id: `${interaction.guild.id}-${user.id}`,
				user: user.id,
				guild: interaction.guild.id,
				xp: 0,
				level: 0,
				totalXP: 0,
			};

		const calculateLevel = () => {
			/*
				y = 175x + 175 = 25;
				y = 175x = -150;
				x = -1.16 -> return 0 using || 0;

        y = 175x + 175 = 175;
        y = 175x = 0;
        x = 0;

        y = 175x + 175 = 528;
        y = 175x = 358;
        x = 2.04 -> (Math.floor) 2;
      */

			const rest = xpArgs - 175;
			const level = Math.floor(rest / 175);

			return level < 0 ? 0 : level;
		};

		const level = calculateLevel();
		const requiredXP = level * 175 + 175;

		score.totalXP = xpArgs;
		score.xp = level ? xpArgs - requiredXP : xpArgs;
		score.level = level;

		const embed = new MessageEmbed()
			.setTitle("Success!")
			.setDescription(`Successfully set ${xpArgs} xp for ${user.toString()}!`)
			.setColor("#5AC0DE");

		client.setScore.run(score);

		return interaction.editReply({ embeds: [embed] });
	},
};

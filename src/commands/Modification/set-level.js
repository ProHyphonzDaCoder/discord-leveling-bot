const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class SetLevelCommand extends Command {
	constructor(context) {
		super(context, {
			name: "set-level",
			description: "Set user Level and XP",
			cooldown: 3,
			options: [
				{
					name: "level",
					description: "The level to set",
					type: 4,
					required: true,
				},
				{
					name: "user",
					description: "The user of whom to set level (defaults to you)",
					type: 6,
					required: false,
				},
			],
		});
	}

	async run(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");
		await interaction.deferReply();

		const user = interaction.options.getUser("user", false) || interaction.user;
		const levelArgs = interaction.options.getInteger("level");

		this.client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
		this.client.setScore = sql.prepare(
			"INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);"
		);

		if (!user) return interaction.reply("Please mention an user!");

		if (isNaN(levelArgs) || levelArgs < 1)
			return interaction.editReply("Please provide a valid number!");

		let score = this.client.getScore.get(user.id, interaction.guild.id);
		if (!score)
			score = {
				id: `${interaction.guild.id}-${user.id}`,
				user: user.id,
				guild: interaction.guild.id,
				xp: 0,
				level: 0,
				totalXP: 0,
			};

		score.level = levelArgs;
		const newTotalXP = levelArgs - 1;

		const embed = new Discord.MessageEmbed()
			.setTitle("Success!")
			.setDescription(`Successfully set ${levelArgs} level for ${user.toString()}!`)
			.setColor("#5AC0DE");

		score.totalXP = newTotalXP * 2 * 250 + 250;
		score.xp = 0;
		this.client.setScore.run(score);

		await interaction.editReply({ embeds: [embed] });
	}
};

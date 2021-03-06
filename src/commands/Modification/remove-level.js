const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class RemoveLevelCommand extends Command {
	constructor(context) {
		super(context, {
			name: "remove-level",
			description: "Remove or decrease level to specified user",
			cooldown: 3,
			options: [
				{
					name: "level",
					description: "The level to take from the user",
					type: 4,
					required: true,
				},
				{
					name: "user",
					description: "The user of whom to remove level (defaults to you)",
					type: 6,
					required: false,
				},
			],
		});
	}

	async run(interaction) {
		await interaction.deferReply();

		const user = interaction.options.getUser("user", false) || interaction.user;

		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		const levelArgs = interaction.options.getInteger("level");

		interaction.client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
		interaction.client.setScore = sql.prepare(
			"INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);"
		);

		if (!user) return interaction.reply("Please mention an user!");

		if (isNaN(levelArgs) || levelArgs < 1) {
			return interaction.editReply("Please provide a valid number!");
		} else {
			let score = interaction.client.getScore.get(user.id, interaction.guild.id);
			if (!score)
				score = {
					id: `${interaction.message.guild.id}-${interaction.user.id}`,
					user: interaction.user.id,
					guild: interaction.guild.id,
					xp: 0,
					level: 0,
					totalXP: 0,
				};

			if (score.level - levelArgs < 1)
				return interaction.editReply("You cannot remove levels from this user!");

			score.level -= levelArgs;
			const newTotalXP = levelArgs - 1;

			const embed = new Discord.MessageEmbed()
				.setTitle("Success!")
				.setDescription(`Successfully removed level ${levelArgs} from ${user.toString()}!`)
				.setColor("#5AC0DE");

			score.totalXP -= newTotalXP * 2 * 250 + 250;
			interaction.client.setScore.run(score);

			await interaction.editReply({ embeds: [embed] });
		}
	}
};

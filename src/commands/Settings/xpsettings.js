const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class XPSettingsCommand extends Command {
	constructor(context) {
		super(context, {
			name: "xpsettings",
			description: "Set custom XP and Cooldown",
			cooldown: 3,
			options: [
				{
					name: "xp",
					description: "The amount of XP is earned per a later specified amount of seconds",
					type: 10,
					required: true,
				},
				{
					name: "seconds",
					description: "How many seconds it takes to earn the aforementioned XP amount",
					type: 10,
					required: true,
				},
			],
		});
	}

	async rub(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		if (interaction.options.getNumber("xp") < 1)
			return interaction.reply("XP cannot be less than 0 XP!");

		if (interaction.options.getNumber("seconds") < 1)
			return interaction.reply("Cooldown cannot be less than 0 seconds!");

		const checkIf = sql
			.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?")
			.get(interaction.guild.id);
		if (checkIf) {
			sql
				.prepare("UPDATE settings SET customXP = ? WHERE guild = ?")
				.run(interaction.options.getNumber("xp"), interaction.guild.id);
			sql
				.prepare("UPDATE settings SET customCooldown = ? WHERE guild = ?")
				.run(interaction.options.getNumber("seconds") * 1000, interaction.guild.id);
		} else {
			sql
				.prepare(
					"INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)"
				)
				.run(
					interaction.guild.id,
					"**Congratulations** {member}! You have now leveled up to **level {level}**",
					interaction.options.getNumber("xp"),
					interaction.options.getNumber("seconds") * 1000
				);
		}

		await interaction.reply(
			`Users from now will gain  ${interaction.options.getNumber(
				"xp"
			)}XP/${interaction.options.getNumber("seconds")}s`
		);
	}
};

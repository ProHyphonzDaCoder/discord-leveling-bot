const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class DoubleXPRoleCommand extends Command {
	constructor(context) {
		super(context, {
			name: "double-xp-role",
			description: "Set specific channel to send level up message",
			options: [
				{
					name: "role",
					description: "The role that doubles XP",
					type: 8,
					required: true,
				},
			],
			cooldown: 3,
		});
	}

	async run(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		const role = interaction.options.getRole("role");

		sql
			.prepare("INSERT OR REPLACE INTO doubleXP (guild, role) VALUES (?, ?);")
			.run(interaction.guild.id, role.id);
		await interaction.reply(`Double XP role has been set to ${role.name}`);
	}
};

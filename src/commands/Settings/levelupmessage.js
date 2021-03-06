const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class LevelUpMessageCommand extends Command {
	constructor(context) {
		super(context, {
			name: "levelupmessage",
			description: "Set custom level up message!",
			cooldown: 3,
			options: [
				{
					name: "message",
					description: "The level up message to set",
					type: 3,
					required: true,
				},
			],
		});
	}

	async run(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		interaction.client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
		const level = interaction.client.getLevel.get(interaction.user.id, interaction.guild.id);
		if (!level) {
			const insertLevel = sql.prepare(
				"INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);"
			);
			insertLevel.run(
				`${interaction.user.id}-${interaction.guild.id}`,
				interaction.user.id,
				interaction.guild.id,
				0,
				0,
				0
			);
			return;
		}

		const antonymsLevelUp = (string) => {
			return string
				.replace(/{member}/i, `${interaction.member}`)
				.replace(/{xp}/i, `${level.xp}`)
				.replace(/{level}/i, `${level.level}`);
		};

		const checkIf = sql
			.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?")
			.get(interaction.guild.id);
		if (checkIf)
			sql
				.prepare("UPDATE settings SET levelUpMessage = ? WHERE guild = ?")
				.run(interaction.options.getString("message"), interaction.guild.id);
		else
			sql
				.prepare(
					"INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)"
				)
				.run(interaction.guild.id, interaction.options.getString("message"), 16, 1000);

		return interaction.reply(
			`Here is a preview of the level up message ${antonymsLevelUp(
				interaction.options.getString("message")
			)}`
		);
	}
};

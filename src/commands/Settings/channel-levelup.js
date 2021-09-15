const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class ChannelLevelUpCommand extends Command {
	constructor(context) {
		super(context, {
			name: "channel-levelup",
			description: "Set specific channel to send level up message",
			options: [
				{
					name: "channel",
					description: "The channel to send level up messages in",
					type: 7,
					required: true,
				},
			],
			cooldown: 3,
		});
	}

	async run(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		const channel = interaction.options.getChannel("channel");

		const permissionFlags = channel.permissionsFor(interaction.guild.me);
		if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL"))
			return interaction.reply(`I don't have permission to send/read messages in ${channel}!`);

		sql
			.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);")
			.run(interaction.guild.id, channel.id);
		await interaction.reply(`Level up channel has been set to ${channel}`);
	}
};

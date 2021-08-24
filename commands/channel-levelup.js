const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");

module.exports = {
	name: "channel-levelup",
	aliases: ["setchannel", "channelevelup"],
	category: "Leveling",
	description: "Set specific channel to send level up message",
	options: [
		{
			name: "channel",
			description: "The channel to send level up messages in",
			// Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
			type: 7,
			required: true,
		},
	],
	cooldown: 3,
	execute(interaction) {
		if (!interaction.member.permissions.has("MANAGE_GUILD"))
			return interaction.reply("You do not have permission to use this command!");

		const channel = interaction.options.getChannel("channel");

		//sql.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);").run(interaction.guild.id, "Default");
		const permissionFlags = channel.permissionsFor(interaction.guild.me);
		if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) {
			return interaction.reply(`I don't have permission to send/read messages in ${channel}!`);
		}

		sql
			.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);")
			.run(interaction.guild.id, channel.id);
		return interaction.reply(`Level up channel has been set to ${channel}`);
	},
};

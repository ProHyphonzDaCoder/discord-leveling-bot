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
			name: "level",
			description: "The level(s) to add",
			type: 4,
			required: true,
		},
		{
			name: "user",
			description: "The user of whom to add level(s) (defaults to you)",
			type: 6,
			required: false,
		},
	],
	execute(interaction) {
		// 	const { client } = interaction;
		// 	const user = interaction.options.getUser("user") || interaction.user;
		// 	if (!interaction.member.permissions.has("MANAGE_GUILD"))
		// 		return interaction.reply("You do not have permission to use this command!");
	},
};

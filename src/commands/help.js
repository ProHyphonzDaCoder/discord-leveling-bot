const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "help",
	aliases: ["h"],
	category: "Utility",
	cooldown: 3,
	description: "List bot commands",
	options: [{
		"name": "command",
		"description": "The command you want to see help for (optional, only for specific help)",
		// Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
		"type": 3,
		"required": false,
	}],
	async execute(interaction) {

		if (!interaction.guild.me.permissions.has("EMBED_LINKS")) return interaction.channel.send("Missing Permission: `EMBED_LINKS`");

		const { commands } = interaction.client;

		if (!interaction.options.getString("command")) {

			const help = new MessageEmbed()
				.setColor("#2E294E")
				.setAuthor("Hyphonz")
				.setTitle("Command List")
				.setThumbnail("https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
				.addFields(
					{ name: "Leveling Commands", value: "<:reply:878354292845735937>`rank`\n<:reply:878354292845735937>`background` \n<:reply:878354292845735937>`leaderboard`", inline: true },
					{ name: "Configuration Commands (admin-only)", value: "<:reply:878354292845735937>`levelupmessage`\n<:reply:878354292845735937>`xpsettings`\n<:reply:878354292845735937>`channel-levelup`\n<:reply:878354292845735937>`role-level`\n<:reply:878354292845735937>`add-level`\n<:reply:878354292845735937>`doublexprole`", inline: true }
				)
				.addField("The Nexus", "\n[Support server](https://discord.gg/6SbwSCzehm)\n[Bot invite](https://discord.com/oauth2/authorize?client_id=837864244728692736&permissions=1593305202&scope=bot+applications.commands)", true)
				.setTimestamp();

			return interaction.reply({ embeds: [help] });

		}

		const name = interaction.options.getString("command").toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) return interaction.reply("That's not a valid command!");

		const embed = new MessageEmbed()
			.setTitle(command.name.slice(0, 1) + command.name.slice(1))
			.setColor("#2E294E")
			.setThumbnail("https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
			.setDescription(`<:reply:878354292845735937> **Command Name**: ${command.name}\n<:reply:878354292845735937> **Description**: ${command.description ? command.description : "None"}\n<:reply:878354292845735937> **Category**: ${command.category ? command.category : "General" || "Misc"}\n<:reply:878354292845735937> **Aliases**: ${command.aliases ? command.aliases.join(", ") : "None"}\n<:reply:878354292845735937> **Cooldown**: ${command.cooldown ? command.cooldown : "None"}`);

		interaction.reply({ embeds: [embed] });
	}
};

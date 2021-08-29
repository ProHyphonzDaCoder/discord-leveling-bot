const { MessageEmbed } = require("discord.js");
const { commandStats } = require("../functions/sql");

module.exports = {
	name: "stats",
	category: "Exclusive",
	cooldown: 3,
	description: "List command statistics",
	options: [{
		"name": "command",
		"description": "Specify a command whose statistics must be retrieved.",
		// Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
		"type": 3,
		"required": true, // for now
	}],
	async execute(interaction) {

        if (!interaction.guild.me.permissions.has("EMBED_LINKS")) return interaction.channel.send("Missing Permission: `EMBED_LINKS`");

		if (interaction.options.getString("command")) {
            const name = interaction.options.getString("command").toLowerCase();
            const command = commandStats.get(name);

            if (!command) return interaction.reply('That\'s not a valid command!');

			const stat = new MessageEmbed()
				.setColor("#2E294E")
				.setAuthor(`Hyphonz`)
				.setTitle(`${name.charAt(0).toUpperCase() + name.slice(1)} Command Statistics`)
				.setThumbnail("https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
				.addFields(
					{ name: "Uses", value: JSON.stringify(command.frequency), inline: true }
				)
				.setTimestamp();
			return interaction.reply({ embeds: [stat] });
		} else {
            return interaction.reply('Please mention a command!');
        }
	}
};

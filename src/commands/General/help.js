const { MessageEmbed } = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class HelpCommand extends Command {
	constructor(context) {
		super(context, {
			name: "help",
			description: "List bot commands",
			cooldown: 3,
			options: [
				{
					name: "command",
					description: "The command you want to see help for (optional, only for specific help)",
					type: 3,
					required: false,
				},
			],
		});
	}

	async run(interaction) {
		if (!interaction.guild.me.permissions.has("EMBED_LINKS"))
			return interaction.channel.send("Missing Permission: `EMBED_LINKS`");

		const { commands } = this.client;
		const cmd = interaction.options.getString("command");
		if (!cmd) {
			const help = new MessageEmbed()
				.setColor("#2E294E")
				.setAuthor("Hyphonz")
				.setTitle("Command List")
				.setThumbnail(
					"https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png"
				)
				.addFields(
					{
						name: "Leveling Commands",
						value:
							"<:reply:878354292845735937>`rank`\n<:reply:878354292845735937>`background` \n<:reply:878354292845735937>`leaderboard`",
						inline: true,
					},
					{
						name: "Configuration Commands (admin-only)",
						value:
							"<:reply:878354292845735937>`levelupmessage`\n<:reply:878354292845735937>`xpsettings`\n<:reply:878354292845735937>`channel-levelup`\n<:reply:878354292845735937>`role-level`\n<:reply:878354292845735937>`add-level`\n<:reply:878354292845735937>`doublexprole`",
						inline: true,
					}
				)
				.addField(
					"The Nexus",
					"\n[Support server](https://discord.gg/6SbwSCzehm)\n[Bot invite](https://discord.com/oauth2/authorize?client_id=837864244728692736&permissions=1593305202&scope=bot+applications.commands)",
					true
				)
				.setTimestamp();

			return interaction.reply({ embeds: [help] });
		}

		const command =
			commands.get(cmd.toLowerCase()) ||
			commands.find((c) => c.aliases && c.aliases.includes(cmd.toLowerCase()));
		if (!command) return interaction.reply("That's not a valid command!");

		const embed = new MessageEmbed()
			.setTitle(command.name.slice(0, 1) + command.name.slice(1))
			.setColor("#2E294E")
			.setThumbnail(
				"https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png"
			)
			.setDescription(
				`<:reply:878354292845735937> **Command Name**: ${
					command.name
				}\n<:reply:878354292845735937> **Description**: ${
					command.description ? command.description : "None"
				}\n<:reply:878354292845735937> **Category**: ${
					command.category ? command.category : "General" || "Misc"
				}\n<:reply:878354292845735937> **Aliases**: ${
					command.aliases ? command.aliases.join(", ") : "None"
				}\n<:reply:878354292845735937> **Cooldown**: ${
					command.cooldown ? command.cooldown : "None"
				}`
			);

		await interaction.reply({ embeds: [embed] });
	}
};

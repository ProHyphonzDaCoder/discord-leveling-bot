const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const Command = require("../../structures/Command");

row = new MessageActionRow()
.addComponents(
	new MessageSelectMenu()
		.setCustomId('help')
		.addOptions([
			{
				label: 'General',
				description: 'Read general commands',
				value: 'general',
        emoji: '776176649891741725'
			},
			{
				label: 'Economy',
				description: 'Read economy commands',
				value: 'economy',
        emoji: '817475661697515590'
			},
			{
				label: 'Leveling',
				description: 'Read leveling commands',
				value: 'leveling',
        emoji: '852873942346891274'
			},
			{
				label: 'Modification',
				description: 'Read modification commands',
				value: 'modification',
        emoji: '835052958558978089'
			},
			{
				label: 'Settings',
				description: 'Read setting commands',
				value: 'settings',
        emoji: '691685511118716988'
			}
		])
);

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
		const { commands } = this.client;

		this.categoryEmbeds = [];

		const categories = this.sortCategory([...new Set(commands.map((c) => c.category))]);
		for (const category of categories) {
			const cmds = commands.filter((c) => c.category === category);
			const cmdEmbed = new MessageEmbed()
				.setColor("#2E294E")
				.setTitle(`Hyphonz - ${category}`)
				.setThumbnail(
					"https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png"
				)
				.addField(`• ${category}`, cmds.map(c => `╰ \`${c.name}\``).join("\n"), true)
				.addField(
					"The Nexus",
					"[Support server](https://discord.gg/6SbwSCzehm)\n[Bot invite](https://discord.com/oauth2/authorize?client_id=837864244728692736&permissions=1593305202&scope=bot+applications.commands)",
					true
				);

			this.categoryEmbeds.push(cmdEmbed);
		}

		if (!interaction.guild.me.permissions.has("EMBED_LINKS"))
			return interaction.channel.send("Missing Permission: `EMBED_LINKS`");

		const cmd = interaction.options.getString("command");
		if (!cmd) {
			const embed = new MessageEmbed()
				.setColor("#2E294E")
				.setTitle("Hyphonz - General")
				.setThumbnail(
					"https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png"
				)
				.addField(`• General`, "╰ `help`\n╰ `stats`")
				.addField(
					"The Nexus",
					"[Support server](https://discord.gg/6SbwSCzehm)\n[Bot invite](https://discord.com/oauth2/authorize?client_id=837864244728692736&permissions=1593305202&scope=bot+applications.commands)",
					true
				)
				.setTimestamp();

			return interaction.reply({ embeds: [embed], components: [row] });
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
				`<:reply:887825417694756895>  **Command Name**: ${
					command.name
				}\n<:reply:887825417694756895>  **Description**: ${
					command.description ? command.description : "None"
				}\n<:reply:887825417694756895>  **Category**: ${
					command.category ? command.category : "General" || "Misc"
				}\n<:reply:887825417694756895>  **Cooldown**: ${
					command.cooldown ? command.cooldown : "None"
				}`
			);

		await interaction.reply({ embeds: [embed] });
	}

	async edit(interaction) {
		const selectedCategory = interaction.values[0].toLowerCase();

		const updatedEmbed = this.categoryEmbeds.find(embed => 
			embed.title.toLowerCase().endsWith(selectedCategory)
		)
		updatedEmbed
			.setTimestamp();
		await interaction.update({ embeds: [updatedEmbed] });
	}

	sortCategory(categories) {
		const values = [];
		categories.forEach((c) => (c === "General" ? values.unshift(c) : values.push(c)));

		return values;
	}
};

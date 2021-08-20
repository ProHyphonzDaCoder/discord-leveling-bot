const {
    MessageEmbed
} = require("discord.js");
const config = require("../config.json");
const Discord = require("discord.js");
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_PRESENCES
    ],
});

module.exports = {
    name: "help",
    aliases: ["h"],
    category: "Utility",
    cooldown: 3,
    description: "List bot commands",
    "options": [{
        "name": "command",
        "description": "The command you want to see help for (optional, only for specific help)",
        // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
        "type": 3,
        "required": false,
    }],
    async execute(interaction) {
        const prefix = config.prefix
        if (!interaction.guild.me.permissions.has("EMBED_LINKS")) return interaction.channel.send("Missing Permission: `EMBED_LINKS`")

        const {
            commands
        } = interaction.client;

        if (!interaction.options.getString("command")) {

            let help = new MessageEmbed()
                .setColor("#2E294E")
                .setAuthor(`Hyphonz`)
                .setTitle("Command List")
                .setThumbnail("https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
                .addFields({
                    name: `Leveling Commands`,
                    value: `<:reply:878354292845735937>\`${prefix}rank\`
<:reply:878354292845735937>\`${prefix}background\`
<:reply:878354292845735937>\`${prefix}leaderboard\``,
                    inline: true
                }, {
                    name: `Configuration Commands (admin-only)`,
                    value: `<:reply:878354292845735937>\`${prefix}levelupmessage\`
<:reply:878354292845735937>\`${prefix}xpsettings\`
<:reply:878354292845735937>\`${prefix}channel-levelup\`
<:reply:878354292845735937>\`${prefix}role-level\`
<:reply:878354292845735937>\`${prefix}add-level\`
<:reply:878354292845735937>\`${prefix}doublexprole\``,
                    inline: true
                })
                .addField("The Nexus", `
[Support server](https://discord.gg/6SbwSCzehm)
[Bot invite](https://discord.com/oauth2/authorize?client_id=837864244728692736&permissions=1593305202&scope=bot+applications.commands)`, true)
                .setTimestamp();

            return interaction.reply({
                embeds: [help]
            });

        }

        const name = interaction.options.getString("command").toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

        if (!command) return interaction.reply('That\'s not a valid command!');

        let embed = new Discord.MessageEmbed()
        embed.setTitle(command.name.slice(0, 1) + command.name.slice(1));
        embed.setColor("#2E294E");
        embed.setThumbnail("https://media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
        embed.setDescription([
            `<:reply:878354292845735937> **Command Name**: ${command.name}`,
            `<:reply:878354292845735937> **Description**: ${command.description ? command.description : "None"}`,
            `<:reply:878354292845735937> **Category**: ${command.category ? command.category : "General" || "Misc"}`,
            `<:reply:878354292845735937> **Aliases**: ${command.aliases ? command.aliases.join(", ") : "None"}`,
            `<:reply:878354292845735937> **Cooldown**: ${command.cooldown ? command.cooldown : "None"}`
        ].join("\n"));


        interaction.reply({
            embeds: [embed]
        });
    }
};
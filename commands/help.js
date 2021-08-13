const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES],
});

module.exports = {
  name: "help",
  aliases: ["h"],
  category: "Utility",
  cooldown : 3,
  description: "Display Help Commands",
  "options": [{
    "name": "command",
    "description": "The command you want to see help for (optional, only for specific help)",
    // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
    "type": 3,
    "required": false,
}
],
  async execute(interaction) {
const prefix = config.prefix
    if (!interaction.guild.me.permissions.has("EMBED_LINKS")) return interaction.channel.send("Missing Permission: `EMBED_LINKS`")

    const { commands } = interaction.client;

    if (!interaction.options.getString("command")) {

    let help = new MessageEmbed()
      .setColor("#5AC0DE")
      .setAuthor(`${interaction.guild.name} Help Menu`)
      .addFields(
        { name: `Leveling Commands`, value: `\`${prefix}rank\`
\`${prefix}bg\`
\`${prefix}leaderboard\``},
      )
      .addFields(
        { name: `Configuration Commands (admin-only)`, value: `\`${prefix}prefix\`
\`${prefix}levelupmessage\`
\`${prefix}xpsettings\`
\`${prefix}channel-levelup\`
\`${prefix}role-level\`
\`${prefix}add-level\`
\`${prefix}blacklist\``},
      )
      .setTimestamp();

    return interaction.reply({embeds: [help]});
     
    }

    const name = interaction.options.getString("command").toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

    if (!command) {
      return interaction.reply('That\'s not a valid command!');
        }
    
        let embed = new Discord.MessageEmbed()
        embed.setTitle(command.name.slice(0, 1) + command.name.slice(1));
        embed.setColor("RANDOM");
        embed.setFooter('<> is mandatory, [] is optional');
        embed.setDescription([
            `**Command Name**: ${command.name}`,
            `**Description**: ${command.description ? command.description : "None"}`,
            `**Category**: ${command.category ? command.category : "General" || "Misc"}`,
            `**Aliases**: ${command.aliases ? command.aliases.join(", ") : "None"}`,
            `**Cooldown**: ${command.cooldown ? command.cooldown : "None"}`
        ].join("\n"));
    
    
    interaction.channel.send({embeds: [embed]});
  }
};
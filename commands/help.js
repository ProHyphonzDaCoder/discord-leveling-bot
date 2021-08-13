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
  async execute(message, args) {
const prefix = config.prefix
    if (!message.guild.me.hasPermission("EMBED_LINKS")) return message.channel.send(`Missing Permission: EMBED_LINKS`)

    const { commands } = message.client;

    if (!args.length) {

    let help = new MessageEmbed()
      .setColor("#5AC0DE")
      .setAuthor(`${message.guild.name} Help Menu`)
      .addFields(
        { name: `Leveling Commands`, value: `\`${prefix}rank\`
		\`${prefix}bg\`
		\`${prefix}leaderboard\`
		\`${prefix}role-level\`
		\`${prefix}add-level\`
		\`${prefix}blacklist\`
		\`${prefix}levelupmessage\`
		\`${prefix}xpsettings\`
		\`${prefix}channel-levelup\``},
      )
      .addFields(
        { name: `Configuration Commands (admin-only)`, value: `\`${prefix}prefix\``},
      )
      .setTimestamp();

    return message.channel.send(help);
     
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

    if (!command) {
      return message.reply('That\'s not a valid command!');
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
    
    
    message.channel.send(embed);
  }
};
const Discord = require("discord.js");
const client = new Discord.Client({
	intents: [ Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_PRESENCES ],
});

const { sql } = require("./functions/sql");
const config = require("./../config.json");

let commandsInDB = sql.prepare("SELECT * FROM commands").all();
commandsInDB = commandsInDB.map(command => command.name);
const addCommand = sql.prepare("INSERT INTO commands (name, frequency) VALUES (?, 0);");


const fs = require("fs");
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
	if (!commandsInDB.includes(command.name)) addCommand.run(command.name);

}

const eventFiles = fs.readdirSync(`${__dirname}/events`).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (file.once) client.once(event.name, event.execute);
	else client.on(event.name, event.execute);
}

client.login(config.token);
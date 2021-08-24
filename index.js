// Importing Packages
const Discord = require("discord.js");
const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_PRESENCES,
	],
});
client.commands = new Discord.Collection();

const SQLite = require("better-sqlite3");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));

// Token, Owner ID, and Application ID
const config = require("./config.json");

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (file.once) {
		client.once(event.name, event.execute);
	} else {
		client.on(event.name, event.execute);
	}
}

const commands = client.commands.map(({ execute, ...data }) => data);

const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(config.appID), { body: commands });

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

client.login(config.token);

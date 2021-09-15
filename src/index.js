const { Client, Intents, Collection } = require("discord.js");
const config = require("./../config.json");
const LoadFiles = require("./functions/LoadFiles");

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
	],
});

client.commands = new Collection();
LoadFiles(client);

client.login(config.token);

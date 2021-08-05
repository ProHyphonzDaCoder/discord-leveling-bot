// Importing Packages
const Discord = require("discord.js")
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')
const { join } = require("path")
const fs = require("fs");
const { readdirSync } = require("fs");

const client = new Discord.Client()

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const talkedRecently = new Map();

// Token, Prefix, and Owner ID
const config = require("./config.json")

// Events
client.login(config.token)

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(f => {
        if (!f.endsWith(".js")) return;
        const event = require(`./events/${f}`);
        let eventName = f.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

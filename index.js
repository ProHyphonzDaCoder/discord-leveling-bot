// Importing Packages
const Discord = require("discord.js")

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES],
});
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')
const {
  join
} = require("path")
const fs = require("fs");
const {
  readdirSync
} = require("fs");
const {
  REST
} = require('@discordjs/rest');
const {
  Routes
} = require('discord-api-types/v9');
const {
  token
} = require('./config.json');

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const talkedRecently = new Map();

// Token, Prefix, and Owner ID
const config = require("./config.json");


    client.on("ready", () => {
      const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
      }
    
    
    
    
      
      const rest = new REST({
        version: '9'
      }).setToken(token);
    
      (async () => {
        try {
          console.log('Started refreshing application (/) commands.');
    
          await rest.put(
            Routes.applicationGuildCommands(client.user.id, "874809270259052585"), {
              body: client.commands.map(({
                execute,
                ...data
              }) => data)
            },
          );
    
          console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
          console.error(error);
        }
        });
    
  // Check if the table "points" exists.
  const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
  if (!levelTable['count(*)']) {
    sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
  }

  client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
  client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");

  // Check if the table "backgrounds" exists.
  const bgTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'background';").get();
  if (!bgTable['count(*)']) {
    sql.prepare("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)").run();
  }

  client.getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?;");
  client.setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

  // Role table for levels
  const roleTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
  if (!roleTable['count(*)']) {
    sql.prepare("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);").run();
  }

  // Prefix table
  const prefixTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefix';").get();
  if (!prefixTable['count(*)']) {
    sql.prepare("CREATE TABLE prefix (serverprefix TEXT, guild TEXT PRIMARY KEY);").run();
  }

  // Blacklist table
  const blacklistTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'blacklistTable';").get();
  if (!blacklistTable['count(*)']) {
    sql.prepare("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);").run();
  }

    // 2X XP table
    const doubleXPTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'doubleXP';").get();
    if (!doubleXPTable['count(*)']) {
      sql.prepare("CREATE TABLE doubleXP (guild TEXT, role TEXT);").run();
    }

  // Settings table
  const settingsTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'settings';").get();
  if (!settingsTable['count(*)']) {
    sql.prepare("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);").run();
  }

  const channelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'channel';").get();
  if (!channelTable['count(*)']) {
    sql.prepare("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);").run();
  }

  console.log(`Logged in as ${client.user.username}`)
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (!client.commands.has(interaction.commandName)) return;

  try {
    await client.commands.get(interaction.commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    });
  }
});

// XP Messages 
client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (!message.guild) return;

      // 2X XP table
      const doubleXPTable = sql.prepare("SELECT role FROM 'doubleXP' WHERE guild = " + message.guild.id).get()["role"];      ;
      if (doubleXPTable['role'] && message.member.roles.has(doubleXPTable['role'])) {
        var xpMulti = 2;
      }  else {
        var xpMulti = 1;
      }

  let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
  if (blacklist.get(`${message.guild.id}-${message.author.id}`) || blacklist.get(`${message.guild.id}-${message.channel.id}`)) return;

  // get level and set level
  const level = client.getLevel.get(message.author.id, message.guild.id)
  if (!level) {
    let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
    insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
    return;
  }

  let customSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?").get(message.guild.id);
  let channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?").get(message.guild.id);

  const lvl = level.level;

  let getXpfromDB;
  let getCooldownfromDB;

  if (!customSettings) {
    getXpfromDB = 16; // Default
    getCooldownfromDB = 1000;
  } else {
    getXpfromDB = customSettings.customXP;
    getCooldownfromDB = customSettings.customCooldown;
  }

  // xp system
  const generatedXp = Math.floor(Math.random() * getXpfromDB);
  const nextXP = level.level * 2 * 250 + 250 * xpMulti;
  // message content or characters length has to be more than 4 characters also cooldown
  if (talkedRecently.get(message.author.id) || message.content.length < 3 || message.content.startsWith(config.prefix)) {
    return;
  } else { // cooldown is 10 seconds
    level.xp += generatedXp;
    level.totalXP += generatedXp;


    // level up!
    if (level.xp >= nextXP) {
      level.xp = 0;
      level.level += 1;

      let levelUpMsg;

      if (!customSettings) {

        levelUpMsg = `**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`;
      } else {
        function antonymsLevelUp(string) {
          return string
            .replace(/{member}/i, `${message.member}`)
            .replace(/{xp}/i, `${level.xp}`)
            .replace(/{level}/i, `${level.level}`)
        }

        levelUpMsg = antonymsLevelUp(customSettings.levelUpMessage.toString());
      }
      // using try catch if bot have perms to send EMBED_LINKS      
      try {
        if (!channelLevel || channelLevel.channel == "Default") {
          message.channel.send(levelUpMg);
        } else {
          let channel = message.guild.channels.cache.get(channelLevel.channel)
          const permissionFlags = channel.permissionsFor(message.guild.me);
          if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
          channel.send(levelUpMsg);
        }
      } catch (err) {
        if (!channelLevel || channelLevel.channel == "Default") {
          message.channel.send(levelUpMsg);
        } else {
          let channel = message.guild.channels.cache.get(channelLevel.channel)
          const permissionFlags = channel.permissionsFor(message.guild.me);
          if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
          channel.send(levelUpMsg);
        }
      }
    };
    client.setLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, level.xp, level.level, level.totalXP);
    // add cooldown to user
    talkedRecently.set(message.author.id, Date.now() + getCooldownfromDB);
    setTimeout(() => talkedRecently.delete(message.author.id, Date.now() + getCooldownfromDB))
  }
  // level up, time to add level roles
  const member = message.member;
  let Roles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?")

  let roles = Roles.get(message.guild.id, lvl)
  if (!roles) return;
  if (lvl >= roles.level) {
    if (roles) {
      if (member.roles.cache.get(roles.roleID)) {
        return;
      }
      if (!message.guild.me.permissions.has("MANAGE_ROLES")) {
        return
      }
      member.roles.add(roles.roleID);
    }
  }
});

client.login(config.token);

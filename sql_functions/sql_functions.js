const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite');

const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
if (!levelTable['count(*)']) {
    sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
}

// Check if the table "backgrounds" exists.
const bgTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'background';").get();
if (!bgTable['count(*)']) {
    sql.prepare("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)").run();
}

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

let getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
let setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");

let getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?;");
let setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

module.exports = {
    getLevel, setLevel,
    getBg, setBg
}
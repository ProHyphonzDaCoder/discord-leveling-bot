const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite');

const allTables = sql.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
if (!allTables.find(table => table.name == "levels")) sql.exec("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);");
if (!allTables.find(table => table.name == "background")) sql.exec("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)");
if (!allTables.find(table => table.name == "roles")) sql.exec("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);");
if (!allTables.find(table => table.name == "blacklistTable")) sql.exec("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);");
if (!allTables.find(table => table.name == "doubleXP")) sql.exec("CREATE TABLE doubleXP (guild TEXT, role TEXT);");
if (!allTables.find(table => table.name == "settings")) sql.exec("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);");
if (!allTables.find(table => table.name == "channel")) sql.exec("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);");

let getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
let setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");
let deleteLevel = sql.prepare("DELETE FROM levels WHERE user = ? AND guild = ?");

let getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?;");
let setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");

let serverSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?");
let channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?");

let serverRoles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?");
let doubleXPRole = sql.prepare("SELECT role FROM 'doubleXP' WHERE guild = ?");

module.exports = {
    sql, // SQLite object
    getLevel, setLevel, deleteLevel, // queries for levels
    getBg, setBg, // queries for backgrounds
    blacklist, insertLevel,
    serverSettings, channelLevel,
    serverRoles, doubleXPRole
}
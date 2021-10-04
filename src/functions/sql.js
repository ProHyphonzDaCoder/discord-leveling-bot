const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");

const allTables = sql
	.prepare("SELECT * FROM sqlite_master WHERE type='table'")
	.all();
if (!allTables.find((table) => table.name == "levels"))
	sql.exec("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);");

if (!allTables.find((table) => table.name == "background"))
	sql.exec("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)");

if (!allTables.find((table) => table.name == "roles"))
	sql.exec("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);");

if (!allTables.find((table) => table.name == "blacklistTable"))
	sql.exec("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);");

if (!allTables.find((table) => table.name == "doubleXP"))
	sql.exec("CREATE TABLE doubleXP (guild TEXT, role TEXT);");

if (!allTables.find((table) => table.name == "settings"))
	sql.exec("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);");

if (!allTables.find((table) => table.name == "channel"))
	sql.exec("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);");

if (!allTables.find((table) => table.name == "commands"))
	sql.exec("CREATE TABLE commands (name TEXT PRIMARY KEY, frequency INTEGER DEFAULT 0);");

if (!allTables.find((table) => table.name == "balance"))
	sql.exec("CREATE TABLE balance (user TEXT PRIMARY KEY, amount INTEGER DEFAULT 0);");

if (!allTables.find((table) => table.name == "recurringIncome"))
	sql.exec(`CREATE TABLE recurringIncome (user TEXT PRIMARY KEY, daily DATE DEFAULT (datetime('1970-01-01','localtime')), weekly DATE DEFAULT (datetime('1970-01-01','localtime')), monthly DATE DEFAULT (datetime('1970-01-01','localtime')), yearly DATE DEFAULT (datetime('1970-01-01','localtime')));`);

const getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
const setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?, ?, ?, ?, ?, ?);");
const deleteLevel = sql.prepare("DELETE FROM levels WHERE user = ? AND guild = ?");

const getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?;");
const setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

const blacklist = sql.prepare("SELECT id FROM blacklistTable WHERE id = ?");
const insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");

const serverSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?");
const channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?");

const serverRoles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?");
const doubleXPRole = sql.prepare("SELECT role FROM 'doubleXP' WHERE guild = ?");

const addFrequency = sql.prepare("UPDATE commands SET frequency = frequency + 1 WHERE name = ?;");
const commandStats = sql.prepare("SELECT * FROM commands WHERE name = ?;");

module.exports = {
	sql,
	getLevel,
	setLevel,
	deleteLevel,
	getBg,
	setBg,
	blacklist,
	insertLevel,
	serverSettings,
	channelLevel,
	serverRoles,
	doubleXPRole,
	addFrequency,
	commandStats
};

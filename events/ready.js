const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite');

module.exports = {
    name: "ready",
    execute: (client) => {
        // Check if the table "points" exists.
        console.log(`Logged in as ${client.user.username}`);
    }
}
const { sql, deleteLevel } = require("../sql_functions/sql_functions");

let getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = {
    name: "ready",
    execute: (client) => {
        client.guilds.cache.each((guild) => {
            let storedLevels = getLevels.all(guild.id);
            let storedUserIDs = storedLevels.map((level) => level.user);

            let memberIDs = guild.members.cache.map((member) => member.id);
            let unknownIDs = storedUserIDs.filter((userID) => !memberIDs.includes(userID));
            unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
        })

        // Output for when logged in
        console.log(`Logged in as ${client.user.username}`);
    }
}
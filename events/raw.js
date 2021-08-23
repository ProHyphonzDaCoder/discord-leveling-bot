const { sql, deleteLevel } = require("../sql_functions/sql_functions");

let getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = {
    name: "raw",
    execute: async (packet) => {
        if (!packet.t) return; // Ignores raw events without event names
        if (!packet.d) return; // Ignores raw events without data
        switch (packet.t) {
            case "GUILD_CREATE":
                let storedUserIDs = [];
                let storedLevels = getLevels.all(packet.d.id);
                storedLevels.forEach(level => storedUserIDs.push(level.user));

                let memberIDs = [];
                for (i in packet.d.members) {
                    memberIDs.push(packet.d.members[i].user.id);
                }

                let unknownIDs = storedUserIDs.filter(userID => !memberIDs.includes(userID));
                unknownIDs.forEach(userID => deleteLevel.run(userID, guild.id));
            break;
        }
    }
}
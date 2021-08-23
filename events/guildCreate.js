const { sql, deleteLevel } = require("../sql_functions/sql_functions");

let getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = {
	name: "guildCreate",
	execute: async (guild) => {
		let storedLevels = getLevels.all(guild.id);
		let storedUserIDs = storedLevels.map((level) => level.user);

		let memberIDs = guild.members.cache.map((m) => m.id);
		let unknownIDs = storedUserIDs.filter((userID) => !memberIDs.includes(userID));
		unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
	},
};

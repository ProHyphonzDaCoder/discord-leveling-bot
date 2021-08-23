const { sql, deleteLevel } = require("../sql_functions/sql_functions");

let getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = {
	name: "guildCreate",
	execute: async (guild) => {
		let storedUserIDs = [];
		let storedLevels = getLevels.all(guild.id);
		storedLevels.forEach((level) => storedUserIDs.push(level.user));

		let memberIDs = guild.member.cache.map((m) => m.id);
		let unknownIDs = storedUserIDs.filter((userID) => !memberIDs.includes(userID));
		unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
	},
};

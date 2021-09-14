const EventListener = require("../structures/EventListener");
const { sql, deleteLevel } = require("./../functions/sql");

const getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = class GuildCreate extends EventListener {
	constructor(context) {
		super(context, {
			name: "guildCreate",
		});
	}

	run(guild) {
		const storedLevels = getLevels.all(guild.id);
		const storedUserIDs = storedLevels.map((level) => level.user);

		const memberIDs = guild.members.cache.map((m) => m.id);
		const unknownIDs = storedUserIDs.filter((userID) => !memberIDs.includes(userID));
		unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
	}
};

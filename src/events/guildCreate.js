const EventListener = require("../structures/EventListener");
const config = require("../../config.json");
const { sql, deleteLevel } = require("./../functions/sql");

const getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

const greetText = `**Thank you for adding Hyphonz**

- Use /help to see my commands
- If you need more help, please visit my [support server](https://discord.gg/6SbwSCzehm)`

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

		const greetChannel = guild.channels.cache.find(channel => {
			return channel.isText() && channel.permissionsFor(config.appID).has("SEND_MESSAGES")
		});
		if (greetChannel) {
			greetChannel.send(greetText);
		}
	}
};

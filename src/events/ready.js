const EventListener = require("../structures/EventListener");
const { sql, deleteLevel } = require("./../functions/sql");
const getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = class Ready extends EventListener {
	constructor(context) {
		super(context, {
			name: "ready",
			once: true,
		});
	}

	run() {
		this.client.guilds.cache.each((guild) => {
			const storedLevels = getLevels.all(guild.id);
			const storedUserIDs = storedLevels.map((level) => level.user);

			const memberIDs = guild.members.cache.map((member) => member.id);
			const unknownIDs = storedUserIDs.filter((userID) => !memberIDs.includes(userID));
			unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
		});

		console.log(`Logged in as ${this.client.user.tag}!`);

		const commands = this.client.commands.map((cmd) => ({
			name: cmd.name,
			description: cmd.description,
			options: cmd.options,
		}));

		this.client.application.commands.set(commands);
	}
};

const fs = require("fs");

const { sql, deleteLevel } = require("./../functions/sql");
const getLevels = sql.prepare("SELECT user FROM levels WHERE guild = ?");

module.exports = {
	name: "ready",
	execute: (client) => {

		client.guilds.cache.each((guild) => {
			const storedLevels = getLevels.all(guild.id);
			const storedUserIDs = storedLevels.map((level) => level.user);

			const memberIDs = guild.members.cache.map((member) => member.id);
			const unknownIDs = storedUserIDs.filter(
				(userID) => !memberIDs.includes(userID)
			);
			unknownIDs.forEach((userID) => deleteLevel.run(userID, guild.id));
		});

		console.log(`Logged in as ${client.user.tag}!`);

		const data = [];
		const commandFiles = fs.readdirSync(`${__dirname}/../commands`).filter((file) => file.endsWith(".js"));
		for (const file of commandFiles) {

			const object = {};
			const command = require(`./../commands/${file}`);


			if(command.name) object.name = command.name;
			if(command.description) object.description = command.description;
			if(command.options) object.options = command.options;

			data.push(object);
		}
		client.application.commands.set(data);

	},
};
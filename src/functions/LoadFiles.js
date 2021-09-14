const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const Command = require("../structures/Command");
const EventListener = require("../structures/EventListener");
const { sql } = require("./sql");

let commandsInDB = sql.prepare("SELECT * FROM commands").all();
commandsInDB = commandsInDB.map((command) => command.name);

const addCommand = sql.prepare("INSERT INTO commands (name, frequency) VALUES (?, 0);");

function loadEvents(client) {
	const base = join(process.cwd(), "src", "events");
	const eventFiles = readdirSync(base).filter((file) => file.endsWith(".js"));

	for (const file of eventFiles) {
		const path = join(base, file);
		const Event = require(path);
		if (!(Event.prototype instanceof EventListener)) {
			console.error(
				`[${file}]: EventListener file does not export an extended EventListener class`
			);
			continue;
		}

		const context = {
			client,
			path,
		};

		const event = new Event(context);
		if (event.once) client.once(event.name, event.run.bind(event));
		else client.on(event.name, event.run.bind(event));
	}
}

function loadCommands(client) {
	const base = join(process.cwd(), "src", "commands");
	const commandDirs = readdirSync(base).filter((folder) =>
		statSync(join(base, folder)).isDirectory()
	);

	for (const dir of commandDirs) {
		const path = join(base, dir);
		const files = readdirSync(path).filter((file) => file.endsWith(".js"));

		for (const commandFile of files) {
			const commandPath = join(path, commandFile);
			const Cmd = require(commandPath);
			if (!(Cmd.prototype instanceof Command)) {
				console.error(`[${commandFile}]: Command file does not export an extended Command class`);
				continue;
			}

			const context = {
				client,
				path: commandPath,
			};

			const command = new Cmd(context);
			client.commands.set(command.name, command);
			if (!commandsInDB.includes(command.name)) addCommand.run(command.name);
		}
	}
}

module.exports = function load(client) {
	loadEvents(client);
	loadCommands(client);
};

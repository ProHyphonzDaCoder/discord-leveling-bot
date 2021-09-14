module.exports = class Command {
	constructor(options) {
		this.name = options.name;
		this.description = options.description;
		this.cooldown = options.cooldown;
		this.options = options.options;
	}

	async run(interaction) {
		console.log(`[${this.name}]: Command class is missing "run(interaction)" method!`);
		interaction.reply("Something went wrong, please try again later.");
	}
};

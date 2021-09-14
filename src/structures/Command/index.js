const { sep } = require("path");

module.exports = class Command {
	constructor(context, options) {
		this.name = options.name;
		this.description = options.description;
		this.cooldown = options.cooldown;
		this.options = options.options;

		const paths = context.path.split(sep);
		this.fullCategory = paths.slice(paths.indexOf("commands") + 1, -1);

		this.client = context.client;
	}

	get category() {
		return this.fullCategory?.length > 0 ? this.fullCategory[0] : "General";
	}

	async run(interaction) {
		console.log(`[${this.name}]: Command class is missing "run(interaction)" method!`);
		interaction.reply("Something went wrong, please try again later.");
	}
};

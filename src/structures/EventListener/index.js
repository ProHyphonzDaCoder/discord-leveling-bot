const { sep } = require("path");

module.exports = class EventListener {
	constructor(context, options) {
		this.name = options.name;
		this.once = options.once;

		const paths = context.path.split(sep);
		this.fullCategory = paths.slice(paths.indexOf("events") + 1, -1);

		this.client = context.client;
	}

	get category() {
		return this.fullCategory?.length > 0 ? this.fullCategory[0] : "General";
	}

	async run() {
		console.log(`[${this.name}]: EventListener class is missing "run(...args: any[])" method!`);
	}
};

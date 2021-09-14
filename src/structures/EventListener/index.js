module.exports = class EventListener {
	constructor(client, options) {
		this.name = options.name;
		this.once = options.once;

		this.client = client;
	}

	async run() {
		console.log(`[${this.name}]: EventListener class is missing "run(...args: any[])" method!`);
	}
};

const EventListener = require("../structures/EventListener");
const { addFrequency } = require("./../functions/sql");

module.exports = class InteractionCreate extends EventListener {
	constructor(context) {
		super(context, {
			name: "interactionCreate",
			once: false,
		});
	}

	async run(interaction) {
		if (interaction.isCommand()) {
			if (!this.client.commands.has(interaction.commandName)) return;

			try {
				await this.client.commands.get(interaction.commandName).run(interaction);
				addFrequency.run(interaction.commandName);
			} catch (error) {
				console.error(error);
				interaction.replied || interaction.deferred
					? interaction.followUp({
							content: "There was an error while executing this command!",
							ephemeral: true,
					  })
					: interaction.reply({
							content: "There was an error while executing this command!",
							ephemeral: true,
					  });
			}
		} else if (interaction.isSelectMenu()) {
			try {
				await this.client.commands.get(interaction.customId).edit(interaction);
			} catch (error) {
				console.error(error);
				interaction.replied || interaction.deferred
					? interaction.followUp({
							content: "There was an error while executing this selection!",
							ephemeral: true,
					  })
					: interaction.reply({
							content: "There was an error while executing this selection!",
							ephemeral: true,
					  });
			}
		}
	}
};

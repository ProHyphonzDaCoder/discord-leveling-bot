const { addFrequency } = require('./../functions/sql');

module.exports = {
	name: "interactionCreate",
	execute: async (interaction) => {

		const { client } = interaction;

		if (!interaction.isCommand()) return;
		if (!client.commands.has(interaction.commandName)) return;

		try {
			await client.commands.get(interaction.commandName).execute(interaction);
			addFrequency.run(interaction.commandName);
		}
		catch (error) {
			console.error(error);
			interaction.replied || interaction.deferred ?
				interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				}) :
				interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
		}
	},
};

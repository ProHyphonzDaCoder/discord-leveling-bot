module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
    if (!interaction.isCommand()) return;
  
	  if (interaction.commandName === 'ping') {
		  await interaction.reply('Pong.');
	  } else if (interaction.commandName === 'beep') {
  		await interaction.reply('Boop!');
	  }
  }
};

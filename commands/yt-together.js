const { DiscordTogether } = require('discord-together');

module.exports = {
    name: 'together',
    aliases: ['yt'],
    description: "Watch a YouTube video together.",
    cooldown: 3,
    options: [{
        name: 'channel',
        description: 'The channel where you want to watch YouTube',
        type: 7,
        required: true
    }],
    category: "Miscellaneous",
    async execute(interaction) {
        if (!interaction.options.getChannel("channel")) {
            return await interaction.editReply("You need to specify a channel for this command.");
        }

        let discordTogether = new DiscordTogether(interaction.client);

        discordTogether.createTogetherCode(interaction.options.getChannel("channel").id, 'youtube').then(async invite => {
            return await interaction.editReply(`${invite.code}`);
        });
    }
}

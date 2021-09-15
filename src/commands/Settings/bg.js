const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");

module.exports = {
	name: "background",
	aliases: ["bg"],
	description: "Set a card background",
	cooldown: 3,
	options: [{
		name: "bgurl",
		description: "The image URL for the background you wish to add (leave empty to reset)",
		type: 3,
		required: false,
	}],
	category: "Leveling",
	async execute(interaction) {

		await interaction.deferReply();
		const background = interaction.options.getString("bgurl");

		if (!background) {
			sql.prepare("DELETE FROM background WHERE user = (?);").run(interaction.user.id);
			return interaction.followUp("Your rank card background has been reset!");
		}
		const valid = /^(http|https):\/\/[^ "]+$/.test(background) && (background.endsWith(".png") || background.endsWith(".jpg") || background.endsWith("jpeg"));
		if (!valid)
			return interaction.followUp("Please enter a valid image URL. It must use HTTP or HTTPS and be a PNG, JPG, or JPEG image. It must not have a `?` or `&` at the end.");

		try {
			sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (?, ?, ?);")
				.run(interaction.member.id, interaction.guild.id, interaction.options.getString("bgurl"));
			return interaction.followUp("Background set!");
		} catch (e) {
			console.error(e);
			return interaction.followUp("An error occurred while setting the background.");
		}
	},
};

const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')

module.exports = {
    name: 'background',
    aliases: ['bg'],
    description: "Set a card background",
    cooldown: 3,
    category: "Leveling",
    async execute (message, args) {
		if(!args[0]) {
			sql.prepare("DELETE FROM background WHERE user = (?);").run(message.author.id);
			return message.reply("Your rank card background has been reset!");
		}
        var valid = /^(http|https):\/\/[^ "]+$/.test(args[0]) && (message.content.endsWith(".png") || message.content.endsWith(".jpg") || message.content.endsWith("jpeg"));
		if(!valid) return message.reply("Please enter a valid image URL. It must use HTTP or HTTPS and be a PNG, JPG, or JPEG image. It must not have a `?` or `&` at the end.");
		
		try {
			sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (?, ?, ?);").run(message.author.id, message.guild.id, args[0]);
			message.reply("Background set!");
		} catch (e) {
			message.reply("An error occurred while setting the background.");
			console.error(e);
		}
    }
}
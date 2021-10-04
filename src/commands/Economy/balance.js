const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class RankCommand extends Command {
	constructor(context) {
		super(context, {
			name: "balance",
			description: "Get your balance or another member's balance",
			cooldown: 3,
			options: [
				{
					name: "target",
					description: "The user's balance card to show",
					type: 6,
					required: false,
				},
			],
		});
	}

	async run(interaction) {
		if (!interaction.isCommand()) return;
		await interaction.deferReply();

		const user = interaction.options.getMember("target") || interaction.member;

		let getBalance = sql.prepare("SELECT * FROM balance WHERE user = ?");
		let setBalance = sql.prepare(
			"INSERT OR REPLACE INTO balance (user) VALUES (?);"
		);

        let balance = getBalance.get(user.id);
		if (!balance) {
            setBalance.run(user.id);
            balance = getBalance.get(user.id);
        }

		await interaction.editReply(`${user.displayName}'s balance is **${balance.amount}**.`);
	}
};

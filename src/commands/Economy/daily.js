const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");
const Command = require("../../structures/Command");

const getDaily = sql.prepare("SELECT daily FROM recurringIncome WHERE user = ?");
const setDaily = sql.prepare("INSERT OR REPLACE INTO recurringIncome (user, daily) VALUES (?, DATE('now','+1 day'));");
const updateDaily = sql.prepare("UPDATE recurringIncome SET daily = DATE('now','+1 day') WHERE user = ?;");

const getBalance = sql.prepare("SELECT amount FROM balance WHERE user = ?");
const setBalance = sql.prepare("INSERT OR REPLACE INTO balance (user) VALUES (?);");
const addBalance = sql.prepare("UPDATE balance SET amount = amount + 1000 WHERE user = ?");

module.exports = class RankCommand extends Command {
	constructor(context) {
		super(context, {
			name: "daily",
			description: "Get your daily income.",
			cooldown: 3,
			options: [],
		});
	}

	async run(interaction) {
		if (!interaction.isCommand()) return;
		await interaction.deferReply();

		const user = interaction.member;

		let balance = getBalance.get(user.id);
        let daily = getDaily.get(user.id);

		let dailyAccepted = false;
		if (!daily) {
			if (!balance) setBalance.run(user.id)

			setDaily.run(user.id);
			addBalance.run(user.id);
			dailyAccepted = true;

			balance = getBalance.get(user.id);
        } else {
			if (Date.parse(daily.daily) < Date.now()) {
				updateDaily.run(user.id);
				addBalance.run(user.id);
				dailyAccepted = true;

				balance = getBalance.get(user.id);
			}
		}

		if (dailyAccepted) {
			await interaction.editReply(`Your updated balance is **${balance.amount}**.`);
		} else {
			await interaction.editReply("You claimed your daily income today. Please try again tomorrow.");
		}
	}
};

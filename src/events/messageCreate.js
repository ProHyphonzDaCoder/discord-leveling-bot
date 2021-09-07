const sqlFunctions = require("./../functions/sql");
const msIn5Mins = 1000 * 60 * 5;

const talkedRecently = new Map();
const latestMessages = new Map();

setInterval(() => {
	latestMessages.forEach((value, key) => {
		if (latestMessages.get(key).time > Date.now() - msIn5Mins) latestMessages.delete(key);
	});
}, msIn5Mins);

module.exports = {
	name: "messageCreate",
	execute: (message) => {
		if (message.author.bot) return;
		if (!message.guild) return;
		if (!message.content) return;

		if (message.content.length < 5) return;
		if (!message.content.includes(" ")) return;

		if (latestMessages.has(`${message.author.id}-${message.guild.id}`)) {
			const lastMessage = latestMessages.get(`${message.author.id}-${message.guild.id}`);
			if (lastMessage.content == message.content) return;
		}

		latestMessages.set(`${message.author.id}-${message.guild.id}`, {
			content: message.content,
			time: Date.now(),
		});

		// 2X XP table
		let xpMulti;
		const doubleXPTable = sqlFunctions.doubleXPRole.get(message.guild.id);
		if (
			typeof doubleXPTable != "undefined" &&
			typeof doubleXPTable.role != "undefined" &&
			message.member.roles.cache.has(doubleXPTable["role"])
		)
			xpMulti = 2;
		else xpMulti = 1;

		if (
			sqlFunctions.blacklist.get(`${message.guild.id}-${message.author.id}`) ||
			sqlFunctions.blacklist.get(`${message.guild.id}-${message.channel.id}`)
		)
			return;

		const level = sqlFunctions.getLevel.get(message.author.id, message.guild.id);
		if (!level) {
			sqlFunctions.insertLevel.run(
				`${message.author.id}-${message.guild.id}`,
				message.author.id,
				message.guild.id,
				0,
				0,
				0
			);
			return;
		}

		const customSettings = sqlFunctions.serverSettings.get(message.guild.id);
		const channelLevel = sqlFunctions.channelLevel.get(message.guild.id);

		const lvl = level.level;

		let getXpfromDB;
		let getCooldownfromDB;

		if (!customSettings) {
			getXpfromDB = 16;
			getCooldownfromDB = 1000;
		} else {
			getXpfromDB = customSettings.customXP;
			getCooldownfromDB = customSettings.customCooldown;
		}

		// xp system
		const generatedXp = Math.floor(Math.random() * getXpfromDB);
		const nextXP = level.level * 2 * 250 + 250 * xpMulti;
		// message content or characters length has to be more than 4 characters also cooldown
		if (talkedRecently.get(message.author.id) || message.content.length < 3) {
			return;
		} else {
			level.xp += generatedXp;
			level.totalXP += generatedXp;

			// level up!
			if (level.xp >= nextXP) {
				level.xp = 0;
				level.level += 1;

				let levelUpMsg;

				if (!customSettings) {
					levelUpMsg = `**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`;
				} else {
					const antonymsLevelUp = (string) => {
						return string
							.replace(/{member}/i, `${message.member}`)
							.replace(/{xp}/i, `${level.xp}`)
							.replace(/{level}/i, `${level.level}`);
					};

					levelUpMsg = antonymsLevelUp(customSettings.levelUpMessage.toString());
				}

				// using try catch if bot have perms to send EMBED_LINKS
				try {
					if (!channelLevel || channelLevel.channel == "Default") {
						message.channel.send(levelUpMsg);
					} else {
						const channel = message.guild.channels.cache.get(channelLevel.channel);
						const permissionFlags = channel.permissionsFor(message.guild.me);
						if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL"))
							return;
						channel.send(levelUpMsg);
					}
				} catch (err) {
					if (!channelLevel || channelLevel.channel == "Default") {
						message.channel.send(levelUpMsg);
					} else {
						const channel = message.guild.channels.cache.get(channelLevel.channel);
						const permissionFlags = channel.permissionsFor(message.guild.me);
						if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL"))
							return;
						channel.send(levelUpMsg);
					}
				}
			}

			sqlFunctions.setLevel.run(
				`${message.author.id}-${message.guild.id}`,
				message.author.id,
				message.guild.id,
				level.xp,
				level.level,
				level.totalXP
			);
			// add cooldown to user
			talkedRecently.set(message.author.id, Date.now() + getCooldownfromDB);
			setTimeout(() => talkedRecently.delete(message.author.id), getCooldownfromDB);
		}

		// level up, time to add level roles
		const member = message.member;
		const roles = sqlFunctions.serverRoles.get(message.guild.id, lvl);
		if (!roles) return;
		if (lvl >= roles.level)
			if (roles) {
				if (
					member.roles.cache.get(roles.roleID) ||
					!message.guild.me.permissions.has("MANAGE_ROLES")
				)
					return;

				member.roles.add(roles.roleID);
			}
	},
};

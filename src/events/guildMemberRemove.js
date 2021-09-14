const EventListener = require("../structures/EventListener");
const { deleteLevel } = require("./../functions/sql");

module.exports = class GuildMemberRemove extends EventListener {
	constructor(context) {
		super(context, {
			name: "guildMemberRemove",
		});
	}

	run(member) {
		if (!member.id) return;
		if (!member.guild.id) return;

		deleteLevel.run(member.id, member.guild.id);
	}
};

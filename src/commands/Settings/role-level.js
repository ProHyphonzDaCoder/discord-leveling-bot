const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite("./mainDB.sqlite");
const Command = require("../../structures/Command");

module.exports = class RoleLevelCommand extends Command {
	constructor(context) {
		super(context, {
			name: "role-level",
			description: "Rewards role when user leveled up to a certain level",
			options: [
				{
					name: "level",
					description: "The level to tie a role to",
					type: 4,
					required: false,
				},
				{
					name: "role",
					description: "The role of which the aforementioned level is tied to",
					type: 8,
					required: false,
				},
			],
			cooldown: 3,
		});
	}

	async run(interaction) {
		await interaction.deferReply();

		if (!interaction.guild.me.permissions.has("MANAGE_ROLES"))
			interaction.editReply("I do not have permission to manage roles!");
		if (
			!interaction.member.permissions.has("MANAGE_ROLES") ||
			!interaction.member.permissions.has("MANAGE_GUILD")
		)
			return interaction.reply("You do not have permission to use this command!");

		if (!interaction.options.getInteger("level")) {
			const embed = new Discord.MessageEmbed()
				.setTitle("Leveling Roles Setup")
				.setDescription("Rewards role when user leveled up to a certain level")
				.addFields({
					name: "role-level add <level> <@role>",
					value: "Sets a role to be given to user when they leveled up to certain level.",
				})
				.addFields({
					name: "role-level remove <level>",
					value: "Removes the role set at the specified level.",
				})
				.addFields({ name: "role-level show", value: "Shows all roles set to levels." })
				.setColor("#5AC0DE");

			return interaction.channel.send({ embeds: [embed] });
		}

		let method;
		if (!interaction.options.getRole("role")) method = "show";
		else method = "add";

		const levelArgs = interaction.options.getInteger("level");
		const role = interaction.options.getRole("role");

		interaction.client.getRole = sql.prepare(
			"SELECT * FROM roles WHERE guildID = ? AND roleID = ? AND level = ?"
		);
		interaction.client.setRole = sql.prepare(
			"INSERT OR REPLACE INTO roles (guildID, roleID, level) VALUES (@guildID, @roleID, @level);"
		);

		if (method === "add") {
			if ((isNaN(levelArgs) && !levelArgs) || levelArgs < 1)
				return interaction.reply("Please provide a level to set.");

			if (!role) return interaction.reply("You did not provide a role to set!");

			let Role = interaction.client.getRole.get(interaction.guild.id, role.id, levelArgs);
			if (!Role) {
				Role = {
					guildID: interaction.guild.id,
					roleID: role.id,
					level: levelArgs,
				};
				interaction.client.setRole.run(Role);
				const embed = new Discord.MessageEmbed()
					.setTitle("Successfully set role!")
					.setDescription(`${role} has been set for level ${levelArgs}`)
					.setColor("#5AC0DE");
				return interaction.editReply({
					embeds: [embed],
				});
			} else if (Role) {
				interaction.client.deleteLevel = sql.prepare(
					"DELETE FROM roles WHERE guildID = ? AND roleID = ? AND level = ?"
				);
				interaction.client.deleteLevel.run(interaction.guild.id, role.id, levelArgs);
				interaction.client.updateLevel = sql.prepare(
					"INSERT INTO roles(guildID, roleID, level) VALUES(?,?,?)"
				);
				interaction.client.updateLevel.run(interaction.guild.id, role.id, levelArgs);

				const embed = new Discord.MessageEmbed()
					.setTitle("Successfully set role!")
					.setDescription(`${role} has been updated for level ${levelArgs}`)
					.setColor("#5AC0DE");

				return interaction.editReply({ embeds: [embed] });
			}
		}

		if (method === "show") {
			const allRoles = sql
				.prepare("SELECT * FROM roles WHERE guildID = ?")
				.all(interaction.guild.id);
			if (!allRoles) return interaction.reply("There is no roles set!");

			const embed = new Discord.MessageEmbed()
				.setTitle(`${interaction.guild.name} Roles Level`)
				.setDescription("`help role-level` for more information")
				.setColor("#5AC0DE");

			for (const data of allRoles) {
				const LevelSet = data.level;
				const RolesSet = data.roleID;
				embed.addFields({ name: "\u200b", value: `**Level ${LevelSet}**: <@&${RolesSet}>` });
			}

			return interaction.editReply({ embeds: [embed] });
		}

		interaction.client.getLevel = sql.prepare(
			"SELECT * FROM roles WHERE guildID = ? AND level = ?"
		);
		const levels = interaction.client.getLevel.get(interaction.guild.id, levelArgs);

		if (method === "remove" || method === "delete") {
			if ((isNaN(levelArgs) && !levelArgs) || levelArgs < 1)
				return interaction.editReply("Please provide a level to remove.");

			if (!levels) return interaction.editReply("That isn't a valid level!");

			interaction.client.deleteLevel = sql.prepare(
				"DELETE FROM roles WHERE guildID = ? AND level = ?"
			);
			interaction.client.deleteLevel.run(interaction.guild.id, levelArgs);

			const embed = new Discord.MessageEmbed()
				.setTitle("Successfully set role!")
				.setDescription(`Role rewards for level ${levelArgs} has been removed.`)
				.setColor("#5AC0DE");

			await interaction.editReply({ embeds: [embed] });
		}
	}
};

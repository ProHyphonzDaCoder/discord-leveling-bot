const {
    deleteLevel
} = require("../sql_functions/sql_functions");

module.exports = {
    name: "guildMemberRemove",
    execute: (member) => {
        if (!member.id) return;
        if (!member.guild.id) return;

        deleteLevel.run(member.id, member.guild.id);
    }
}
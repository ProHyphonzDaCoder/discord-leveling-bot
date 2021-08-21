const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const Canvas = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji');
const { joinImages } = require('join-images');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb'],
    description: "Check the top 10 users with the most XP",
    cooldown: 3,
    category: "Leveling",
    async execute(interaction) {
        await interaction.deferReply();

        //const currentPage = /*parseInt(args[0]) ||*/ 1;
        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;").all(interaction.guild.id);
        console.log(top10);
        /*if(parseFloat(args[0])  > Math.ceil(top10.length / 10)) {
          return message.reply(`Invalid page number! There are only ${Math.ceil(top10.length / 10)} pages`)
        }*/


        if (top10.length < 1) {
            return interaction.editReply(`There are no users in this server's leaderboard.`);
        }

        var state = {
            'querySet': top10,
            'page': 1,
            'rows': 10
        }

        let pagination = (querySet, page, rows) => {
            var trimStart = (page - 1) * rows
            var trimEnd = trimStart + rows

            var trimmedData = querySet.slice(trimStart, trimEnd)

            var pages = Math.ceil(querySet.length / rows)

            return {
                'querySet': trimmedData,
                'pages': pages
            }
        }

        let shorten = (text, len) => {
            if (typeof text !== "string") return "";
            if (text.length <= len) return text;
            return text.substr(0, len).trim() + "...";
        }

        let buildTable = async () => {
            var pagesData = pagination(state.querySet, state.page, state.rows);
            var myList = pagesData.querySet;
            const canvas = Canvas.createCanvas(559, myList.length * 55);
            const context = canvas.getContext('2d');
            for (var i = 1 in myList) {
                let nextXP = myList[i].level * 2 * 250 + 250
                let totalXP = myList[i].totalXP
                let rank = top10.sort((a, b) => {
                    return b.totalXP - a.totalXP
                });
                let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
                let users;

                const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/823984739526377532/874328086051717120/unknown.png');

                context.drawImage(background, 0, i * 55, canvas.width, 50);

                let specifiedUser = interaction.client.users.cache.find(user => user.id === myList[i].user);
                if (!specifiedUser) {
                    interaction.client.users.fetch(myList[i].user)
                        .then(cachedUser => specifiedUser = interaction.client.users.cache.find(user => user.id === myList[i].user))
                }
                const avatar = await Canvas.loadImage(specifiedUser.displayAvatarURL({
                    format: 'png'
                }));

                context.save();
                roundedImage(0,i * 55,50,50, 5, context);
                context.clip();
                //context.drawImage(avatar, 0, i * (39 *2), 102,77);
                context.drawImage(avatar, 0, i * 55, 50, 50);

                context.restore();

                context.font = '26px sans-serif';
                context.fillStyle = '#ffffff';
                context.textBaseline = "middle";

                if(Number(i) + 1 == 1) {
                    var rankText = "🥇";
                } else if(Number(i) + 1 == 2) {
                    var rankText = "🥈";
                } else if(Number(i) + 1 == 3) {
                    var rankText = "🥉";
                } else {
                    var rankText = `#${Number(i) + 1}`;
                }
                await fillTextWithTwemoji(
                    context,
                    shorten(`${rankText} • ${interaction.client.users.cache.find(user => user.id === myList[i].user).tag} • LVL ${myList[i].level}`, 30),
                    50,
                    (i * 55) + (50/2));
            }
            return canvas.toBuffer('image/png');
        }

        let roundedImage = (x,y,width,height,radius, context) => {
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
        }

        const attachment = new Discord.MessageAttachment(await buildTable(), "lb.png");
        //console.log(attachment);
        //console.log(images);

        const embed = new Discord.MessageEmbed()
            .setTitle(`${interaction.guild.name} Leaderboard`)
            .setDescription("Use `/rank` if a user's rank is cut off.")
            .setImage('attachment://lb.png')
            .setColor("#2E294E");

        return interaction.editReply(
            { 
                embeds: [embed],
                files: [attachment]
            }
        )
    }
}

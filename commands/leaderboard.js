const Discord = require("discord.js");
const {
    sql
} = require("../sql_functions/sql_functions");

const Canvas = require('canvas');
const {
    fillTextWithTwemoji
} = require('node-canvas-with-twemoji-and-discord-emoji');
const {
    joinImages
} = require('join-images');

// Pictures
let background; // variable for backgrond image
let saveBg = (image) => {
    background = image
} // assigns background image to variable
Canvas.loadImage(__dirname + '/../images/lb-background.png').then(image => saveBg(image)); // saves background image

// Canvas for testing length of strings
const testCanvas = Canvas.createCanvas(1, 1);
const testContext = testCanvas.getContext('2d');
testContext.font = '26px sans-serif';
testContext.fillStyle = '#ffffff';

// Constants for making fail embed attachment
const rankWidth = testContext.measureText("#10").width; // Maximum width of rank segment
const lvlWidth = testContext.measureText("LVL 9999").width; // X of the LVL assuming that tag is empty
const sorryBottomWidth = testContext.measureText("Please try running this command again.").width; // X of the LVL assuming that tag is empty
const sorryWidth = 20 + sorryBottomWidth + 20;

// SQLite query for getting top 10 most active users in guild
let top10Sql = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;");

module.exports = {
    name: 'leaderboard',
    description: "Check the top 10 users with the most XP",
    async execute(interaction) {
        let start = new Date().getTime();
        await interaction.deferReply();

        //const currentPage = /*parseInt(args[0]) ||*/ 1;
        const top10 = top10Sql.all(interaction.guild.id);
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

        let buildTable = async () => {
            var pagesData = pagination(state.querySet, state.page, state.rows);
            var myList = pagesData.querySet;

            let longestEntry = myList.reduce((accumulator, currentValue) => {
                let user = interaction.client.users.cache.find(user => user.id === currentValue.user);
                if (!user) {
                    interaction.client.users.fetch(currentValue.user)
                        .then(cachedUser => user = cachedUser);
                }
                let tagWidth = testContext.measureText(user.tag).width;
                return accumulator > tagWidth ? accumulator : tagWidth;
            }, 0);

            const canvas = Canvas.createCanvas(60 + rankWidth + 20 + longestEntry + 20 + lvlWidth + 20, myList.length * 55);
            const context = canvas.getContext('2d');

            context.font = '26px sans-serif';
            context.fillStyle = '#2E294E';
            context.textBaseline = "middle";

            for (var i = 1 in myList) {
                let nextXP = myList[i].level * 2 * 250 + 250
                let totalXP = myList[i].totalXP
                let rank = top10.sort((a, b) => {
                    return b.totalXP - a.totalXP
                });
                let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
                let users;

                context.drawImage(background, 0, i * 55, canvas.width, 50);

                let specifiedUser = interaction.client.users.cache.find(user => user.id === myList[i].user);
                if (!specifiedUser) {
                    interaction.client.users.fetch(myList[i].user)
                        .then(cachedUser => specifiedUser = cachedUser)
                }
                const avatar = await Canvas.loadImage(specifiedUser.displayAvatarURL({
                    format: 'png'
                }));

                context.save();
                roundedImage(0, i * 55, 50, 50, 5, context);
                context.clip();
                //context.drawImage(avatar, 0, i * (39 *2), 102,77);
                context.drawImage(avatar, 0, i * 55, 50, 50);

                context.restore();

                if (Number(i) + 1 == 1) {
                    var rankText = "🥇";
                } else if (Number(i) + 1 == 2) {
                    var rankText = "🥈";
                } else if (Number(i) + 1 == 3) {
                    var rankText = "🥉";
                } else {
                    var rankText = `#${Number(i) + 1}`;
                }
                await fillTextWithTwemoji(
                    context,
                    `${rankText}`,
                    60,
                    (i * 55) + (50 / 2));
                context.fillText(
                    `${specifiedUser.tag}`,
                    60 + rankWidth + 20,
                    (i * 55) + (50 / 2));
                context.fillText(
                    `LVL ${myList[i].level}`,
                    60 + rankWidth + 20 + longestEntry + 20,
                    (i * 55) + (50 / 2));
            }
            return canvas.toBuffer('image/png');
        }

        let failTable = async () => {
            const canvas = Canvas.createCanvas(sorryWidth, 2 * 55);
            const context = canvas.getContext('2d');

            context.font = '26px sans-serif';
            context.fillStyle = '#2E294E';
            context.textBaseline = "middle";
            context.textAlign = "center";

            context.drawImage(background, 0, 0 * 55, canvas.width, 50);
            context.drawImage(background, 0, 1 * 55, canvas.width, 50);

            context.fillText("Leaderboard creation failed.", sorryWidth / 2, (0 * 55) + (55 / 2));
            context.fillText("Please try running this command again.", sorryWidth / 2, (1 * 55) + (55 / 2));

            return canvas.toBuffer('image/png');
        }

        let roundedImage = (x, y, width, height, radius, context) => {
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

        let attachmentName;
        let attachment;
        try {
            attachment = new Discord.MessageAttachment(await buildTable(), "lb.png");
            attachmentName = "lb";
        } catch {
            attachment = attachment = new Discord.MessageAttachment(await failTable(), "fail.png");
            attachmentName = "fail";
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`${interaction.guild.name} Leaderboard`)
            .setDescription("Use `/rank` if a user's rank is cut off.")
            .setImage(`attachment://${attachmentName}.png`)
            .setThumbnail("https://images-ext-1.discordapp.net/external/1a271M1p5EN0yAXBPEtrsgDIhWxdkZj_R1J5fMlDx84/https/media.discordapp.net/attachments/876895206463635509/878355593881083914/Hyphonz_1.png")
            .setColor("#F46036");

        let end = new Date().getTime();
        console.log("Time taken to create Leaderboard in ms:", end - start);
        return interaction.editReply({
            embeds: [embed],
            files: [attachment]
        })
    }
}
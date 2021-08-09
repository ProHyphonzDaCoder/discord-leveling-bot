const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const Canvas = require('canvas');
const {
  joinImages
} = require('join-images');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb'],
  description: "Check the top 10 users with the most XP",
  cooldown: 3,
  category: "Leveling",
  async execute(interaction) {
    await interaction.deferReply();

    var images = [];

    const currentPage = /*parseInt(args[0]) ||*/ 1;
    const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;").all(interaction.guild.id);
    console.log(top10);
    /*if(parseFloat(args[0])  > Math.ceil(top10.length / 10)) {
      return message.reply(`Invalid page number! There are only ${Math.ceil(top10.length / 10)} pages`)
    }*/
    const embed = new Discord.MessageEmbed()
      .setTitle(`${interaction.guild.name} Ranking`)
      .setColor("#5AC0DE")
      .setTimestamp()
      .setDescription(`Top 10 Leaderboard`);


    if (top10.length < 1) {
      embed.setDescription(`There is no user in leaderboard!`)
    }
    var state = {
      'querySet': top10,
      'page': 1,
      'rows': 10
    }

    function pagination(querySet, page, rows) {
      var trimStart = (page - 1) * rows
      var trimEnd = trimStart + rows

      var trimmedData = querySet.slice(trimStart, trimEnd)

      var pages = Math.ceil(querySet.length / rows)

      return {
        'querySet': trimmedData,
        'pages': pages
      }
    }

    async function buildTable() {
      var pagesData = pagination(state.querySet, state.page, state.rows)
      var myList = pagesData.querySet
      for (var i = 1 in myList) {
        let nextXP = myList[i].level * 2 * 250 + 250
        let totalXP = myList[i].totalXP
        let rank = top10.sort((a, b) => {
          return b.totalXP - a.totalXP
        });
        let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        let users;
        const canvas = Canvas.createCanvas(500, 75);
        const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('https://media.discordapp.net/attachments/871891380291653673/873985919785504879/unknown.png');

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({
          format: 'jpg'
        }));

        context.drawImage(avatar, 12.5, 12.5, 50, 50);

        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText(myList[i].user, 65, 50);

        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        images.push(canvas.toBuffer());
      }
      embed.setFooter(`Page ${currentPage} / ${Math.ceil(top10.length / 10)}`)
    }

    buildTable();

    if (images.length > 1) {
      joinImages(images, {
        direction: "horizontal"
      }).then((img) => {
        image = new Discord.MessageAttachment(img, "lb.png");
        // Save image as file
        return interaction.editReply({
          files: [img]
        });
      });
    } else {
      const attachment = new Discord.MessageAttachment(images[0], "lb.png");
      console.log(attachment);
      console.log(images);
      return interaction.editReply({
        files: [attachment]
      });
    }
  }
}
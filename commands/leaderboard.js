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

    //const currentPage = /*parseInt(args[0]) ||*/ 1;
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
      embed.setDescription(`There are no users in this server's leaderboard.`)
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
      var pagesData = pagination(state.querySet, state.page, state.rows);
      var myList = pagesData.querySet;
      const canvas = Canvas.createCanvas(559, 570);
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

        context.drawImage(background, 0, i * 50, canvas.width, 57);

        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({
          format: 'jpg'
        }));


        context.save();
        roundedImage(i * 20.5,i * 20.5,58,58, 5, context);
        context.clip();
        context.drawImage(avatar,10,10,102,77);
        context.drawImage(avatar, i * 20.5, i * 20.5, 58, 58);

        context.restore();

        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText(`#${Number(i) + 1} • ${interaction.client.users.cache.find(user => user.id === myList[i].user).tag} • Level ${myList[i].level}`, 65, 35 + 4);


      }
      return canvas.toBuffer('image/png');
    }

    function roundedImage(x,y,width,height,radius, context){
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
      return interaction.editReply({
        files: [attachment]
      });
  }
}
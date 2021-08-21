const Canvas = require('canvas');

const testCanvas = Canvas.createCanvas(1, 1);
const testContext = testCanvas.getContext('2d');

const background = Canvas.loadImage('https://cdn.discordapp.com/attachments/823984739526377532/874328086051717120/unknown.png');

(async () => {
    // var start = new Date().getTime();

    testContext.fillStyle = '#ffffff';
    testContext.font = '26px sans-serif';
    testContext.textBaseline = "middle";

    // console.log(testContext.measureText("#10 • eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#0000 • LVL 1000"));
    // console.log(testContext.measureText("#10 • #0000 • LVL 1000").width + 50);
    console.log(testContext.measureText("#10 • #0000 • ").width + 50);

    // var end = new Date().getTime();
    // console.log(end-start);
})();
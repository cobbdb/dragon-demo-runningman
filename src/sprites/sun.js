var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'sun',
    strips: {
        sun: AnimationStrip({
            sheet: SpriteSheet({
                src: 'sun.png'
            }),
            size: Dimension(248, 248)
        })
    },
    startingStrip: 'sun',
    scale: 0.5,
    pos: Point(170, 50),
    depth: 10
}).extend({
    update: function () {
        if (runner.direction > 0) {
            this.speed.x = -0.2;
        } else {
            this.speed.x = 0.2;
        }
        this.base.update();
    }
});

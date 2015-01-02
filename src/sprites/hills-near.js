var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'hills-near',
    strips: {
        hills: AnimationStrip({
            sheet: SpriteSheet({
                src: 'parallaxHill1.png'
            }),
            size: Dimension(282, 59)
        })
    },
    startingStrip: 'hills',
    scale: 1.6,
    pos: Point(50, canvas.height - 170),
    depth: 8
}).extend({
    update: function () {
        if (runner.direction > 0) {
            if (this.pos.x < -this.trueSize().width) {
                this.pos.x = canvas.width;
            }
            this.speed.x = -2;
        } else {
            if (this.pos.x > canvas.width) {
                this.pos.x = -this.trueSize().width;
            }
            this.speed.x = 2;
        }
        this.base.update();
    }
});

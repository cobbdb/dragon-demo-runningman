var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'hills-far',
    strips: {
        hills: AnimationStrip({
            sheet: SpriteSheet({
                src: 'parallaxHill2.png'
            }),
            size: Dimension(282, 59)
        })
    },
    startingStrip: 'hills',
    scale: 5,
    pos: Point(100, canvas.height - 300),
    depth: 9
}).extend({
    update: function () {
        if (runner.direction > 0) {
            if (this.pos.x < -this.trueSize().width) {
                this.pos.x = canvas.width;
            }
            this.speed.x = -1;
        } else {
            if (this.pos.x > canvas.width) {
                this.pos.x = -this.trueSize().width;
            }
            this.speed.x = 1;
        }
        this.base.update();
    }
});

var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    KeyDown = Dragon.Keyboard,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

var runner = Sprite({
    name: 'runner',
    collisionSets: collisions,
    mask: Rect(
        Point(100, 100),
        Dimension(66, 115)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'runningGrant.png'
        }),
        start: Point(),
        size: Dimension(165, 288),
        frames: 12,
        speed: 5
    }),
    scale: 0.4,
    pos: Point(100, 100)
}).extend({
    update: function () {
        if (KeyDown.name(' ')) {
            console.log('Runner: Jumping!');
        }

        if (KeyDown.code(37)) {
            // Left arrow.
            this.speed.x = -4;
        } else if (KeyDown.code(39)) {
            // Right arrow.
            this.speed.x = 4;
        } else {
            this.speed.x = 0;
        }

        if (KeyDown.code(38)) {
            // Up arrow.
            this.speed.y = -4;
        } else if (KeyDown.code(40)) {
            // Down arrow.
            this.speed.y = 4;
        } else {
            this.speed.y = 0;
        }

        this.base.update();
    }
});

runner.on('collide/ground', function () {
    console.log('Runner: Colliding with ground!');
});

module.exports = runner;

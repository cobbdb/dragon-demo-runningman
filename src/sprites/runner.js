var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    KeyDown = Dragon.Keyboard,
    Mouse = Dragon.Mouse,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.screenTap
    ],
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
    pos: Point(100, 100),
    size: Dimension(66, 115),
    rotation: 0.4,
    depth: 2,
    on: {
        'collide/ground': function () {
            console.log('Runner: Collided with ground!');
        },
        'collide/screentap': function () {
            console.log('Runner: Tapped!');
        },
        'collide/screenhold': function () {
            console.log('Runner: Squished!');
        },
        'collide/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
        }
    }
}).extend({
    update: function () {
        if (KeyDown.name(' ')) {
            this.rotation += 0.3;
            this.rotation %= 2 * Math.PI;
        }

        if (KeyDown.arrow.left) {
            this.speed.x = -10;
        } else if (KeyDown.arrow.right) {
            // Right arrow.
            this.speed.x = 10;
        } else {
            this.speed.x = 0;
        }

        if (KeyDown.arrow.up) {
            this.speed.y = -10;
        } else if (KeyDown.arrow.down) {
            this.speed.y = 10;
        } else {
            this.speed.y = 0;
        }

        this.base.update();
    }
});

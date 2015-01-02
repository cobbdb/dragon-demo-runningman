var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Mouse = Dragon.Mouse,
    KeyDown = Dragon.Keyboard,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Polar = Dragon.Polar,
    collisions = require('../collisions/main.js'),
    walking = false;

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(64, 60)
    ),
    strips: {
        'walk-right': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(1, 11),
            size: Dimension(64, 64),
            frames: 8,
            speed: 10
        }),
        'walk-left': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(1, 9),
            size: Dimension(64, 64),
            frames: 8,
            speed: 10
        }),
        'jump': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(3, 2),
            size: Dimension(64, 64),
            frames: 3,
            sinusoid: true,
            speed: 10
        })
    },
    startingStrip: 'walk-right',
    pos: Point(100, 100),
    depth: 2,
    on: {
        'colliding/ground': function (other) {
            this.pos.y = other.pos.y - this.mask.height;
            this.speed.y = 0;
            this.speed.x = 0.7 * this.direction;
            this.base.update();
            if (this.direction > 0) {
                this.useStrip('walk-right');
            } else {
                this.useStrip('walk-left');
            }
            walking = true;
        },
        'colliding/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            this.speed.y = 0;
            this.useStrip('jump');
            this.strip.speed = 20;
        },
        'colliding/screentap': function () {
            this.jump();
        },
        'collide/screenedge/left': function () {
            this.direction = 1;
        },
        'collide/screenedge/right': function () {
            this.direction = -1;
        }
    }
}).extend({
    update: function () {
        this.speed.y += 3;
        this.speed.x = 0;
        this.base.update();
    },
    direction: 1,
    jump: function () {
        if (walking) {
            walking = false;
            this.speed.y = -30;
            this.useStrip('jump');
            this.strip.speed = 10;
        }
    }
});

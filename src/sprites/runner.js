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
    direction = 1;

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.collisions
    ],
    /**
     * Feels like size/Dimension is fine, but
     * start/Point is awkward. Should be an
     * offset/Point instead. Offset from the
     * Sprite's starting point and that offset
     * persists through calls to move() and shift().
     * This becomes: Point(0, 4)
     * Just add in Sprite's start to the masks
     * position:
     * mask.x += this.pos.x;
     * mask.y += this.pos.y;
     */
    mask: Rect(
        Point(100, 104),
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
            this.speed.x = 2 * direction;
            this.base.update();
            if (direction > 0) {
                this.useStrip('walk-right');
            } else {
                this.useStrip('walk-left');
            }
        },
        'collide/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            this.speed.y = 0;
            this.useStrip('jump');
            this.strip.speed = 20;
        },
        'collide/screentap': function () {
            this.speed.y = -30;
            this.useStrip('jump');
            this.strip.speed = 10;
        },
        'collide/screenedge/left': function () {
            direction = 1;
        },
        'collide/screenedge/right': function () {
            direction = -1;
        }
    }
}).extend({
    update: function () {
        this.speed.y += 3;
        this.speed.x = 0;
        this.base.update();
    }
});

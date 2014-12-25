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
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.screenTap
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
    strip: AnimationStrip({
        /**
         * Should be {Object} sheets and allow
         * useSheet(name) to swap between the
         * different sheets. ex) running, swimming, etc.
         * also maintain runner.sheet to fetch
         * current sheet.
         */
        sheet: SpriteSheet({
            src: 'orc-walk.png'
        }),
        start: Point(1, 11),
        size: Dimension(64, 64),
        /**
         * An option for sinusoid frame cycle would be
         * nice to have. Right now it assumes always
         * modulo, but sometimes sinusoid is wanted instead:
         * modulo: 0, 1, 2, 0, 1, 2, 0, 1, ...
         * sinusoid: 0, 1, 2, 1, 0, 1, 2, 1, ...
         */
        frames: 8,
        speed: 8
    }),
    pos: Point(100, 100),
    depth: 2,
    on: {
        'colliding/ground': function (other) {
            this.speed.y = 0;
            this.pos.y = other.pos.y - this.mask.height;
        },
        'collide/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            this.speed.y = 0;
        },
        'collide/screentap': function () {
            this.speed.y = -30;
        }
    }
}).extend({
    update: function () {
        this.speed.y += 3;
        this.base.update();
    }
});

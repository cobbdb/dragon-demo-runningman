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
    mask: Rect(
        Point(100, 104),
        Dimension(64, 60)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'orc-walk.png'
        }),
        start: Point(0, 704),
        size: Dimension(64, 64),
        frames: 9,
        speed: 8
    }),
    pos: Point(100, 100),
    depth: 2,
    on: {
        'colliding/ground': function (other) {
            this.speed.y = 0;
            this.pos.y = other.pos.y - this.mask.height;
        },
        'colliding/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            //this.speed.y = 0;
        }
    }
}).extend({
    update: function () {
        if (KeyDown.name(' ')) {
            blah = 'blah';
        }
        this.speed.y += 1.5;
        this.base.update();
        console.log(this.pos.y, this.speed.y);
    }
});

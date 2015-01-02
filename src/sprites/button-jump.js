var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'button-jump',
    collisionSets: [
        Game.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(88, 31)
    ),
    strips: {
        'button-jump': AnimationStrip({
            sheet: SpriteSheet({
                src: 'button.png'
            }),
            size: Dimension(88, 31)
        })
    },
    startingStrip: 'button-jump',
    pos: Point(10, 10),
    on: {
        'colliding/screentap': function () {
            this.strip.frame = 1;
            runner.jump();
        }
    }
}).extend({
    update: function () {
        this.strip.frame = 0;
        this.base.update();
    },
    draw: function (ctx) {
        this.base.draw(ctx);
        ctx.font = '30px Verdana';
        ctx.fillStyle = 'white';
        ctx.fillText(
            'JUMP',
            this.pos.x + 5,
            this.pos.y + 27
        );
    }
});

var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'button-pause',
    collisionSets: [
        Dragon.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(104, 31)
    ),
    strips: {
        'button-pause': AnimationStrip({
            sheet: SpriteSheet({
                src: 'button.png'
            }),
            size: Dimension(88, 31)
        })
    },
    startingStrip: 'button-pause',
    pos: Point(10, 10),
    size: Dimension(104, 31),
    on: {
        'colliding/screentap': function () {
            this.strip.frame = 1;
            Game.screen('main').pause();
            Game.screen('pause').start();
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
            'PAUSE',
            this.pos.x + 1,
            this.pos.y + 27
        );
    }
});

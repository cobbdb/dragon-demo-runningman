var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Circle = Dragon.Circle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    canvas = Dragon.Game.canvas;

module.exports = Sprite({
    name: 'pause-symbol',
    collisionSets: [
        Dragon.collisions
    ],
    mask: Circle(
        Point(50, 50),
        50
    ),
    strips: {
        'pause-symbol': AnimationStrip({
            sheet: SpriteSheet({
                src: 'pause.png'
            }),
            size: Dimension(256, 256)
        })
    },
    startingStrip: 'pause-symbol',
    pos: Point(
        canvas.width / 2 - 50,
        canvas.height / 2 - 50
    ),
    size: Dimension(100, 100),
    on: {
        'colliding/screentap': function () {
            Game.screen('pause').stop();
            Game.screen('main').start();
        }
    }
}).extend({
    draw: function (ctx) {
        ctx.fillStyle = 'rgba(112, 143, 138, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.base.draw(ctx);
    }
});

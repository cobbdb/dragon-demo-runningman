var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'ground',
    collisionSets: collisions,
    mask: Rect(
        Point(0, canvas.height - 115),
        Dimension(canvas.width, 100)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'ground.png'
        }),
        size: Dimension(81, 79)
    }),
    pos: Point(0, canvas.height - 115),
    scale: 0.4
});

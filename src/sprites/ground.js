var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Circ = Dragon.Circle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

/**
 * @param {Number} startx
 */
module.exports = function (startx) {
    return Sprite({
        name: 'ground',
        collisionSets: collisions,
        mask: Rect(
            Point(startx, canvas.height - 79),
            Dimension(81, 40)
        ),
        freemask: true,
        strip: AnimationStrip({
            sheet: SpriteSheet({
                src: 'ground.png'
            }),
            size: Dimension(81, 79)
        }),
        pos: Point(startx, canvas.height - 79),
        depth: 8
    });
};

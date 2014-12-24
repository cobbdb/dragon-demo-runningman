var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

/**
 * @param {Point} [opts.start] Start position of this tile.
 */
module.exports = function (opts) {
    var start;
    opts = opts || {};
    start = opts.start || Point();

    return Sprite({
        name: 'ground',
        collisionSets: collisions,
        mask: Rect(
            start,
            Dimension(81, 40)
        ),
        strip: AnimationStrip({
            sheet: SpriteSheet({
                src: 'ground.png'
            }),
            size: Dimension(81, 79)
        }),
        pos: start,
        depth: 8,
        freemask: true
    });
};

var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    KeyDown = Dragon.Keyboard,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

/**
 * New use case.. how to tile sprites?
 * This should tile horizontally for the width
 * of the canvas.
 */
module.exports = Sprite({
    name: 'ground',
    collisionSets: collisions,
    mask: Rect(
        Point(100, 100),
        Dimension(66, 115)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'ground.png'
        }),
        size: Dimension(81, 79)
    }),
    scale: 0.4,
    pos: Point(0, 100)
}).extend({
    update: function () {
        this.base.update();
    }
});

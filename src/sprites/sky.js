var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'sky',
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'sky.png'
        }),
        size: Dimension(5, 400)
    }),
    size: Game.canvas,
    depth: 10
});

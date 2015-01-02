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
    strips: {
        sky: AnimationStrip({
            sheet: SpriteSheet({
                src: 'sky.png'
            }),
            size: Dimension(5, 400)
        })
    },
    startingStrip: 'sky',
    size: Game.canvas,
    depth: 20
});

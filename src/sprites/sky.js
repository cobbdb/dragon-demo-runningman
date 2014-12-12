var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'sky',
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'sky.png'
        }),
        start: Point(),
        size: Dimension(5, 400),
        frames: 1
    }),
    size: Game.canvas
});

var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Credits = require('../screens/credits.js'),
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'sky',
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'sky.png'
        }),
        start: Point(),
        size: Game.canvas,
        frames: 1
    })
}).extend({
    update: function () {
        // Example of a sprite conditionally adding
        // a new screen to the system.
        if (KeyDown.name('N')) {
            Game.addScreens(
                Credits()
            );
        }
    }
});

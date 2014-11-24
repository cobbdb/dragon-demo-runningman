var Dragon = require('dragonjs'),
    Credits = require('../screens/credits.js'),
    Game = Dragon.Game,
    KeyDown = Dragon.Keyboard;

module.exports = function () {
    return Dragon.Sprite({
        name: 'sky',
        strip: Dragon.AnimationStrip({
            sheet: Dragon.SpriteSheet({
                src: 'sky.png'
            }),
            start: Dragon.Point(),
            size: Dragon.Dimension(123, 321),
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
};

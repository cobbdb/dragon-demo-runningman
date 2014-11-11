var Dragon = require('dragonjs');

/**
 * --> I really hate all the "Dragon"s
 * floating around everywhere.
 */
module.exports = Dragon.Sprite({
    name: 'sky',
    strip: Dragon.AnimationStrip({
        sheet: Dragon.SpriteSheet({
            src: 'sky.png',
            onload: function () {
                /**
                 * This is when the asset becomes
                 * available, so there needs to be
                 * some kind of eventing.
                 */
            }
        }),
        start: Dragon.Point(),
        size: Dragon.Dimension(123, 321),
        frames: 1
    })
});

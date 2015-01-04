var Dragon = require('dragonjs'),
    Screen = Dragon.Screen;

module.exports = Screen({
    name: 'pause',
    spriteSet: [
        require('../sprites/pause-symbol.js')
    ],
    depth: 1
});

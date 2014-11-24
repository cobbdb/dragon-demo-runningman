var Dragon = require('dragonjs'),
    Sky = require('../sprites/sky.js');

module.exports = function () {
    return Dragon.Screen({
        name: 'runningscreen',
        collisionSets: [],
        spriteSet: [
            Sky()
        ]
    });
};

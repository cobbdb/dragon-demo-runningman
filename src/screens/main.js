var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    sky = require('../sprites/sky.js'),
    runner = require('../sprites/runner.js'),
    Ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = Screen({
    name: 'main',
    collisionSets: collisions,
    spriteSet: [
        sky,
        runner,
        Ground(0),
        Ground(81),
        Ground(162),
        Ground(243)
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
});

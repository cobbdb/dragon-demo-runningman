var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Sky = require('../sprites/sky.js'),
    Runner = require('../sprites/runner.js'),
    Ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = Screen({
    name: 'main',
    collisionSets: collisions,
    spriteSet: [
        Sky,
        Runner,
        Ground
    ]
});

var Dragon = require('dragonjs'),
    Sky = require('../sprites/sky.js'),
    Runner = require('../sprites/runner.js'),
    Ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = function () {
    return Dragon.Screen({
        name: 'main',
        collisionSets: collisions,
        spriteSet: [
            Sky(),
            Runner(),
            Ground()
        ]
    });
};

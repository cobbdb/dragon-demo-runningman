var Dragon = require('dragonjs'),
    Game = Dragon.Game,
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
    ],
    on: {
        ready: function () {
            Game.screen('main').start();
        }
    }
});

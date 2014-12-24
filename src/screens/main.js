var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Game = Dragon.Game,
    canvas = Game.canvas,
    Point = Dragon.Point,
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
        Ground({
            start: Point(0, canvas.height - 79)
        }),
        Ground({
            start: Point(81, canvas.height - 79)
        })
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
});

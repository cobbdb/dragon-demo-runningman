var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Mouse = Dragon.Mouse,
    sky = require('../sprites/sky.js'),
    runner = require('../sprites/runner.js'),
    ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = Screen({
    name: 'main',
    collisionSets: collisions,
    spriteSet: [
        sky,
        runner,
        ground
    ],
    one: {
        ready: function (self) {
            self.start();
        }
    }
}).extend({
    update: function () {
        this.base.update();
    }
});

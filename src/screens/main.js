var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    canvas = Dragon.Game.canvas,
    Ground = require('../sprites/ground.js'),
    floor = [],
    i, len;

len = Math.ceil(canvas.width / 81) + 2;
for (i = 0; i < len; i += 1) {
    floor.push(
        Ground(i * 81)
    );
}

module.exports = Screen({
    name: 'main',
    collisionSets: require('../collisions/main.js'),
    spriteSet: [
        require('../sprites/sky.js'),
        require('../sprites/runner.js'),
        require('../sprites/hills-near.js'),
        require('../sprites/hills-far.js'),
        require('../sprites/sun.js'),
        require('../sprites/button-jump.js')
    ].concat(floor),
    one: {
        ready: function () {
            this.start();
        }
    }
}).extend({
    floorSet: floor
});

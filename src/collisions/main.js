var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler,
    Game = Dragon.Game;

module.exports = CollisionHandler(
    'environ',
    Dimension(5, 5),
    Game.canvas
);

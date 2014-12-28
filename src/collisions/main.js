var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler;

module.exports = CollisionHandler({
    name: 'environ',
    gridSize: Dimension(5, 5)
});

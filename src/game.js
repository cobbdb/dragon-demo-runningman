var Dragon = require('dragonjs'),
    Game = Dragon.Game;

Game.addScreens([
    require('./screens/main.js'),
    require('./screens/pause.js')
]);
Game.run({
    debug: true
});

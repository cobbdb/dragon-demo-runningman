var Dragon = require('dragonjs'),
    Game = Dragon.Game;

Game.addScreens(
    require('./screens/main.js')
);
Game.run({
    debug: false
});

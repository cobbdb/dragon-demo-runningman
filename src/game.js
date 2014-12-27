var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    mainScreen = require('./screens/main.js');

Game.addScreens(mainScreen);
Game.run({
    debug: true
});

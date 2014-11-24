var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Main = require('./screens/main.js');

Game.canvas.style.backgroundColor = '';
Game.addScreens([
    Main()
]);
Game.run();

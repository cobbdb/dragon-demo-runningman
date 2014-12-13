var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    mainScreen = require('./screens/main.js');

Game.addScreens({
    set: mainScreen,
    onload: function () {
        Game.run({
            debug: true
        });
    }
});
Game.run({
    debug: true
});

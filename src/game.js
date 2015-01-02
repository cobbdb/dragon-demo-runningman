var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    getJSON = require('get-json');

Game.addScreens(
    require('./screens/main.js')
);
Game.run({
    debug: false
});

/**
 * Side test to prove that the outside world
 * can be touched after porting to mobile.
 * This means that external services can be used.
 */
getJSON(
    'http://time.jsontest.com',
    function (err, res) {
        if (err) {
            console.log('Could not contact jsontest.com');
        } else {
            console.log(
                JSON.stringify(res, null, 3)
            );
        }
    }
);

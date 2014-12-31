var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js'),
    runner = require('./runner.js');

/**
 * @param {Number} startx
 */
function Ground(startx) {
    return Sprite({
        name: 'ground',
        collisionSets: [
            collisions,
            Game.collisions
        ],
        mask: Rect(
            Point(startx, canvas.height - 79),
            Dimension(81, 40)
        ),
        //freemask: true,
        strips: {
            ground: AnimationStrip({
                sheet: SpriteSheet({
                    src: 'ground.png'
                }),
                size: Dimension(81, 79)
            })
        },
        startingStrip: 'ground',
        pos: Point(startx, canvas.height - 79),
        depth: 5,
        on: {
            'separate/screenedge/right': function (other) {
                console.log('rightside', this.id, other.id);
                if (runner.direction > 0) {
                    Game.screen('main').addSprites({
                        set: Ground(canvas.width)
                    });
                }
            }
        }
    }).extend({
        update: function () {
            if (runner.direction > 0) {
                this.speed.x = -2;
                if (this.pos.x < -this.size.width) {
                    Game.screen('main').removeSprite(this);
                }
            } else {
                this.speed.x = 2;
                if (this.pos.x > canvas.width) {
                    Game.screen('main').removeSprite(this);
                }
            }
            this.base.update();
        }
    });
}

module.exports = Ground;

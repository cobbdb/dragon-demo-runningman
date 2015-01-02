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
            Point(),
            Dimension(81, 40)
        ),
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
        depth: 5
    }).extend({
        update: function () {
            var floor;
            if (runner.direction > 0) {
                this.speed.x = -2;
                if (this.mask.right < 0) {
                    floor = Game.screen('main').floorSet;
                    this.pos.x = floor[floor.length - 1].mask.right;
                    floor.push(floor.shift());
                }
            } else {
                this.speed.x = 2;
                if (this.pos.x > canvas.width) {
                    floor = Game.screen('main').floorSet;
                    this.pos.x = floor[0].pos.x - this.size.width;
                    floor.unshift(floor.pop());
                }
            }
            this.base.update();
        }
    });
}

module.exports = Ground;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
!function(){function a(a){return a.leaf=a,a.extend=function(a){var b,c={};a=a||{};for(b in this)c[b]="function"==typeof this[b]?this[b].bind(c):this[b];for(b in a)this[b]=a[b],"function"!=typeof a[b]&&(c[b]=a[b]);return this.base=c,this},a.implement=function(){var b,c=arguments.length;for(b=0;c>b;b+=1)arguments[b](a);return a},a}a.Abstract=function(){throw Error("[BaseClass] Abstract method was called without definition.")},a.Stub=function(){},a.Interface=function(a){return function(b){var c;for(c in a)b[c]=a[c];return b}},module.exports=a}();
},{}],2:[function(require,module,exports){
var Dimension = require('./dimension.js'),
    Point = require('./point.js');

/**
 * @param {SpriteSheet} opts.sheet
 * @param {Point} [opts.start] Defaults to (0,0). Point in the
 * sprite sheet of the first frame.
 * @param {Dimension} [opts.size] Defaults to (0,0). Size of
 * each frame in the sprite sheet.
 * @param {Number} [opts.frames] Defaults to 1. Number of
 * frames in this strip.
 * @param {Number} [opts.speed] Number of frames per second.
 */
module.exports = function (opts) {
    var timeBetweenFrames,
        timeLastFrame,
        timeSinceLastFrame = 0,
        updating = false,
        frames = opts.frames || 1,
        size = opts.size || Dimension(),
        start = opts.start || Point();

    if (opts.speed > 0) {
        // Convert to milliseconds / frame
        timeBetweenFrames = (1 / opts.speed) * 1000;
    } else {
        timeBetweenFrames = 0;
    }

    return {
        get ready () {
            return opts.sheet.ready;
        },
        get size () {
            return size;
        },
        frame: 0,
        start: function () {
            timeLastFrame = new Date().getTime();
            updating = true;
        },
        /**
         * Pausing halts the update loop but
         * retains animation position.
         */
        pause: function () {
            updating = false;
        },
        /**
         * Stopping halts update loop and
         * resets the animation.
         */
        stop: function () {
            updating = false;
            timeSinceLastFrame = 0;
            this.frame = 0;
        },
        update: function () {
            var now, elapsed;
            if (updating) {
                now = new Date().getTime();
                elapsed = now - timeLastFrame;
                timeLastFrame = now;
                timeSinceLastFrame += elapsed;
                if (timeSinceLastFrame >= timeBetweenFrames) {
                    timeSinceLastFrame -= timeBetweenFrames;
                    this.nextFrame();
                }
            }
        },
        nextFrame: function () {
            this.frame += 1;
            this.frame %= frames;
            return this.frame;
        },
        /**
         * @param {Context2D} ctx Canvas 2D context.
         * @param {Point} pos Canvas position.
         * @param {Dimension} [scale] Defaults to (1,1).
         * @param {Number} [rotation] Defaults to 0.
         */
        draw: function (ctx, pos, scale, rotation) {
            var offset = this.frame * opts.width;
            scale = scale || Dimension(1, 1);
            rotation = rotation || 0;

            // Apply the canvas transforms.
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(rotation);
            ctx.scale(scale.width, scale.height);

            // Draw the frame and restore the canvas.
            ctx.drawImage(opts.sheet,
                start.x + offset, start.y, size.width, size.height,
                pos.x, pos.y, size.width, size.height
            );
            ctx.restore();
        }
    };
};

},{"./dimension.js":7,"./point.js":14}],3:[function(require,module,exports){
var Shape = require('./shape.js'),
    Vector = require('./vector.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js');

/**
 * @param {Point} [pos] Defaults to (0,0).
 * @param {Number} [rad] Defaults to 0.
 */
module.exports = function (pos, rad) {
    pos = pos || Point();
    rad = rad || 0;

    var self = Shape(pos.x, pos.y).extend({
        radius: rad,
        intersects: function (other) {
            return other.intersects.circle(this);
        },
        draw: function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.fill();
        }
    });
    self.intersects.circle = function (other) {
        var len = Vector.length(this.x, this.y, other.x, other.y);
        return len < this.radius + other.radius;
    };
    self.intersects.rect = function (rect) {
        var len,
            pt = Point(this.x, this.y);

        if (this.x > rect.right) pt.x = rect.right;
        else if (this.x < rect.x) pt.x = rect.x;
        if (this.y > rect.bottom) pt.y = rect.bottom;
        else if (this.y < rect.y) pt.y = rect.y;

        len = Vector.length(pt.x, pt.y, this.x, this.y);
        return len < circle.radius;
    };
    return self;
};

},{"./dimension.js":7,"./point.js":14,"./shape.js":18,"./vector.js":21}],4:[function(require,module,exports){
var counter = require('./id-counter.js'),
    EventHandler = require('./event-handler.js'),
    BaseClass = require('baseclassjs'),
    Rectangle = require('./rectangle.js');

/**
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [on] Set of collision events.
 */
module.exports = function (opts) {
    var instanceId = counter.nextId,
        activeCollisions = {},
        collisionSets = [].concat(opts.collisionSets);

    return BaseClass({
        get id () {
            return instanceId;
        },
        get name () {
            return opts.name;
        },
        mask: opts.mask || Rectangle(),
        move: function (x, y) {
            this.mask.move(x, y);
        },
        intersects: function (mask) {
            return this.mask.intersects(mask);
        },
        update: function () {
            collisionSets.forEach(function (handler) {
                handler.update(this.leaf);
            });
        },
        addCollision: function (id) {
            if (id !== instanceId) {
                activeCollisions[id] = true;
            }
        },
        removeCollision: function (id) {
            activeCollisions[id] = false;
        },
        isCollidingWith: function (id) {
            // Return type is always boolean.
            return activeCollisions[id] || false;
        }
    }).implement(
        EventHandler({
            events: opts.on
        })
    );
};

},{"./event-handler.js":8,"./id-counter.js":11,"./rectangle.js":16,"baseclassjs":1}],5:[function(require,module,exports){
var Rectangle = require('./rectangle.js'),
    Dimension = require('./dimension.js');

/**
 * @param {String} opts.name
 * @param {Dimension} [opts.gridSize] Defaults to (1,1).
 * @param {Dimension} opts.canvasSize Dimension of the game canvas.
 */
module.exports = function (opts) {
    var i, j, len,
        collisionGrid = [],
        activeCollisions = [],
        gridSize = opts.gridSize || Dimension(1, 1);

    for (i = 0; i < gridSize.x; i += 1) {
        for (j = 0; j < gridSize.y; j += 1) {
            collisionGrid.push(
                Rectangle(
                    i / gridSize.x * opts.canvasSize.width,
                    j / gridSize.y * opts.canvasSize.height,
                    opts.canvasSize.width / gridSize.x,
                    opts.canvasSize.height / gridSize.y
                )
            );
        }
    }

    len = collisionGrid.length;
    for (i = 0; i < len; i += 1) {
        activeCollisions.push([]);
    }

    return {
        name: opts.name,
        clearCollisions: function () {
            var i, len = activeCollisions.length;
            for (i = 0; i < len; i += 1) {
                activeCollisions[i] = [];
            }
        },
        update: function (collidable) {
            var i, len = activeCollisions.length;
            for (i = 0; i < len; i += 1) {
                if (collidable.intersects(collisionGrid[i])) {
                    activeCollisions[i].push(collidable);
                }
            }
        },
        handleCollisions: function () {
            var i, set,
                len = activeCollisions.length;

            for (i = 0; i < len; i += 1) {
                set = activeCollisions[i];
                set.forEach(function (pivot) {
                    set.forEach(function (other) {
                        var intersects = pivot.intersects(other.mask),
                            colliding = pivot.isCollidingWith(other.id);
                        /**
                         *  (colliding) ongoing intersection
                         *  (collide) first collided: no collide -> colliding
                         *  (separate) first separated: colliding -> no collide
                         *  (miss) ongoing separation
                         */
                        if (intersects) {
                            if (!colliding) {
                                pivot.trigger('collide/' + other.name, other);
                                pivot.addCollision(other.id);
                            }
                            pivot.trigger('colliding/' + other.name, other);
                        } else {
                            if (colliding) {
                                pivot.trigger('separate/' + other.name, other);
                                pivot.removeCollision(other.id);
                            }
                            pivot.trigger('miss/' + other.name, other);
                        }
                    });
                });
                // Clear the collision set after it's been processed.
                activeCollisions[i] = [];
            }
        }
    };
};

},{"./dimension.js":7,"./rectangle.js":16}],6:[function(require,module,exports){
module.exports = {
    Shape: require('./shape.js'),
    Circle: require('./circle.js'),
    Rectangle: require('./rectangle.js'),

    Dimension: require('./dimension.js'),
    Point: require('./point.js'),
    Vector: require('./vector.js'),
    Polar: require('./polar.js'),

    FrameCounter: require('./frame-counter.js'),
    IdCounter: require('./id-counter.js'),
    Mouse: require('./mouse.js'),
    Keyboard: require('./keyboard.js'),

    EventHandler: require('./event-handler.js'),
    SpriteSheet: require('./spritesheet.js'),
    AnimationStrip: require('./animation-strip.js'),
    CollisionHandler: require('./collision-handler.js'),

    Game: require('./game.js'),
    Screen: require('./screen.js'),
    Collidable: require('./collidable.js'),
    Sprite: require('./sprite.js')
};

},{"./animation-strip.js":2,"./circle.js":3,"./collidable.js":4,"./collision-handler.js":5,"./dimension.js":7,"./event-handler.js":8,"./frame-counter.js":9,"./game.js":10,"./id-counter.js":11,"./keyboard.js":12,"./mouse.js":13,"./point.js":14,"./polar.js":15,"./rectangle.js":16,"./screen.js":17,"./shape.js":18,"./sprite.js":19,"./spritesheet.js":20,"./vector.js":21}],7:[function(require,module,exports){
var BaseClass = require('baseclassjs');

module.exports = function (w, h) {
    return BaseClass({
        width: w || 0,
        height: h || 0
    });
};

},{"baseclassjs":1}],8:[function(require,module,exports){
var BaseClass = require('baseclassjs');

module.exports = function (opts) {
    var events, singles;

    opts = opts || {};
    events = opts.events || {};
    singles = opts.singles || {};

    return BaseClass.Interface({
        on: function (name, cb) {
            events[name] = events[name] || [];
            events[name].push(cb);
        },
        one: function (name, cb) {
            singles[name] = singles[name] || [];
            singles[name].push(cb);
        },
        off: function (name) {
            events[name] = [];
            singles[name] = [];
        },
        trigger: function (name, data) {
            if (events[name]) {
                events[name].forEach(function (cb) {
                    cb(data);
                });
            }
            if (singles[name]) {
                singles[name].forEach(function (cb) {
                    cb(data);
                });
                single[name] = [];
            }
        }
    });
};

},{"baseclassjs":1}],9:[function(require,module,exports){
var timeSinceLastSecond = frameCountThisSecond = frameRate = 0,
    timeLastFrame = new Date().getTime();

module.exports = {
    countFrame: function () {
        var timeThisFrame = new Date().getTime(),
            elapsedTime = timeThisFrame - timeLastFrame;

        frameCountThisSecond += 1;
        timeLastFrame = timeThisFrame;

        timeSinceLastSecond += elapsedTime;
        if (timeSinceLastSecond >= 1000) {
            timeSinceLastSecond -= 1000;
            frameRate = frameCountThisSecond;
            frameCountThisSecond = 0;
        }
    },
    get frameRate () {
        return frameRate;
    }
};

},{}],10:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Dimension = require('./dimension.js'),
    Circle = require('./circle.js'),
    Collidable = require('./collidable.js'),
    FrameCounter = require('./frame-counter.js');

var pressEventName,
    endEventName,
    ctx,
    tapCollisionSet,
    heartbeat = false,
    throttle = 100,
    canvas = document.createElement('canvas'),
    screens = [],
    screenMap = {},
    screensToAdd = [],
    screenRemoved = false;

if (window.innerWidth >= 500) {
    // Large screen devices.
    canvas.width = 320;
    canvas.height = 480;
    canvas.style.border = '1px solid #000';
    pressEventName = 'mousedown';
    endEventName = 'mouseup';
} else {
    // Mobile devices.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    pressEventName = 'touchstart';
    endEventName = 'touchend';
}

tapCollisionSet = CollisionHandler(
    Dimension(4, 4),
    canvas
);
ctx = canvas.getContext('2d');
document.addEventListener(pressEventName, function (event) {
    tapCollisionSet.update(Collidable({
        name: 'screentap',
        mask: Circle(
            event.offsetX,
            event.offsetY,
            12
        )
    }));
});
document.body.appendChild(canvas);

/**
 * @param screenSet Array
 */
var Game = {
    get canvas () {
        return canvas;
    },
    get ctx () {
        return ctx;
    },
    get pressEventName () {
        return {
            start: pressEventName,
            end: endEventName
        };
    },
    get screenTap () {
        return tapCollisionSet;
    },
    screen: function (name) {
        return screenMap[name];
    },
    addScreens: function (set) {
        screensToAdd = screensToAdd.concat(set);
    },
    removeScreen: function (screen) {
        screen.removed = true;
        screenRemoved = true;
    },
    run: function (opts) {
        var speed, debug,
            that = this;

        opts = opts || {};
        speed = opts.speed || throttle;

        if (opts.debug) {
            window.Dragon = this;
        }

        if (!heartbeat) {
            screens.forEach(function (screen) {
                screen.start();
            });
            heartbeat = window.setInterval(function () {
                if (opts.debug) {
                    console.log('beat');
                }
                that.update();
                that.draw();
                FrameCounter.countFrame();
            }, speed);
        }
    },
    kill: function () {
        window.clearInterval(heartbeat);
        heartbeat = false;
        screens.forEach(function (screen) {
            screen.stop();
        });
    },
    update: function () {
        // Settle screen tap events.
        tapCollisionSet.handleCollisions();

        // Update the screen.
        screens.forEach(function (screen) {
            screen.update();
        });

        if (screensToAdd.length) {
            // Update the master screen list after updates.
            screensToAdd.forEach(function (screen) {
                screens.push(screen);
                if (screen.name) {
                    screenMap[screen.name] = screen;
                }
            });
            // Sort by descending sprite depths.
            screens.sort(function (a, b) {
                return b.depth - a.depth;
            });
            screensToAdd = [];
        }
        if (screenRemoved) {
            // Remove any stale screens.
            screens = screens.filter(function (screen) {
                // true to keep, false to drop.
                return !screen.removed;
            });
            screenRemoved = false;
        }
    },
    draw: function () {
        screens.forEach(function (screen) {
            screen.draw(ctx);
        });
    }
};

module.exports = Game;

},{"./circle.js":3,"./collidable.js":4,"./collision-handler.js":5,"./dimension.js":7,"./frame-counter.js":9}],11:[function(require,module,exports){
var counter = 0;

module.exports = {
    get lastId () {
        return counter;
    },
    get nextId () {
        counter += 1;
        return counter;
    }
};

},{}],12:[function(require,module,exports){
var nameMap = {
        alt: false,
        ctrl: false,
        shift: false
    },
    codeMap = {};

function getCode(event) {
    return event.charCode || event.keyCode || event.which;
}

document.onkeydown = function (event) {
    var code = getCode(event),
        name = String.fromCharCode(code);
    codeMap[code] = true;
    nameMap[name] = true;
    nameMap.alt = event.altKey;
    nameMap.ctrl = event.ctrlKey;
    nameMap.shift = event.shiftKey;
};
document.onkeyup = function (event) {
    var code = getCode(event),
        name = String.fromCharCode(code);
    codeMap[code] = false;
    nameMap[name] = false;
    nameMap.alt = event.altKey;
    nameMap.ctrl = event.ctrlKey;
    nameMap.shift = event.shiftKey;
};

/**
 * **Example**
 * KeyDown.alt
 * KeyDown.name(' ')
 * KeyDown.code(32)
 */
module.exports = {
    get alt () {
        return nameMap.alt;
    },
    get ctrl () {
        return nameMap.ctrl;
    },
    get shift () {
        return nameMap.shift;
    },
    name: function (name) {
        return nameMap[name] || false;
    },
    code: function (code) {
        return codeMap[code] || false;
    }
};

},{}],13:[function(require,module,exports){
var Game = require('./game.js'),
    isDown = false;

document.addEventListener(
    Game.pressEventName.start,
    function (event) {
        isDown = true;
    }
);
document.addEventListener(
    Game.pressEventName.end,
    function (event) {
        isDown = false;
    }
);

/**
 * @example
 * Mouse.isDown
 */
module.exports = {
    get isDown () {
        return isDown;
    }
};

},{"./game.js":10}],14:[function(require,module,exports){
module.exports = function (x, y) {
    return {
        extend: require('baseclassjs'),
        x: x || 0,
        y: y || 0
    };
};

},{"baseclassjs":1}],15:[function(require,module,exports){
var Vector = require('./vector.js'),
    BaseClass = require('baseclassjs');

module.exports = function (theta, mag) {
    return BaseClass({
        theta: theta || 0,
        magnitude: mag || 0,
        invert: function () {
            // Mutate the vector and return.
            this.magnitude *= -1;
            this.theta += Math.PI;
            return this;
        },
        toVector: function () {
            return Vector(
                mag * Math.cos(theta),
                mag * Math.sin(theta)
            );
        }
    });
};

},{"./vector.js":21,"baseclassjs":1}],16:[function(require,module,exports){
var Shape = require('./shape.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js');

/**
 * @param {Point} [pos] Defaults to (0,0).
 * @param {Dimension} [size] Defaults to (0,0).
 */
module.exports = function (pos, size) {
    pos = pos || Point();
    size = size || Dimension();

    var self = Shape(pos.x, pos.y).extend({
        width: size.width || 0,
        height: size.height || 0,
        right: pos.x + size.width || 0,
        bottom: pos.y + size.height || 0,
        move: function (x, y) {
            this.base.move(x, y);
            this.right = x + this.width;
            this.bottom = y + this.height;
        },
        intersects: function (other) {
            return other.intersects.rect(this);
        },
        draw: function (ctx) {
            ctx.fillStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    });
    self.intersects.rect = function (other) {
        return (
            this.x < other.right &&
            this.right > other.x &&
            this.y < other.bottom &&
            this.bottom > other.y
        );
    };
    self.intersects.circle = function (circ) {
        var len, pt = _Point(circ.x, circ.y);
        if (circ.x > this.right) pt.x = this.right;
        else if (circ.x < this.x) pt.x = this.x;
        if (circ.y > this.bottom) pt.y = this.bottom;
        else if (circ.y < this.y) pt.y = this.y;

        len = Vector.length(pt.x, pt.y, circ.x, circ.y);
        return len < circle.radius;
    };
    return self;
};

},{"./dimension.js":7,"./point.js":14,"./shape.js":18}],17:[function(require,module,exports){
var BaseClass = require('baseclassjs');

/**
 * @param {Array|Sprite} [opts.spriteSet]
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {String} opts.name
 * @param {Number} [opts.depth] Defaults to 0.
 */
module.exports = function (opts) {
    var sprites = [],
        spriteMap = {},
        spritesToAdd = [],
        spritesLoading = [],
        spriteRemoved = false,
        collisionMap = {},
        updating = false,
        drawing = false;

    opts.spriteSet = [].concat(opts.spriteSet);
    opts.collisionSets = [].concat(opts.collisionSets);

    // Load in the sprites.
    opts.spriteSet.forEach(function (sprite) {
        spritesToAdd.push(sprite);
        if (sprite.name) {
            spriteMap[sprite.name] = sprite;
        }
    });
    // Load in collision handlers.
    opts.collisionSets.forEach(function (handler) {
        collisionMap[handler.name] = handler;
    });

    return BaseClass({
        get name () {
            return opts.name;
        },
        start: function () {
            sprites.forEach(function (sprite) {
                sprite.strip.start();
            });
            updating = true;
            drawing = true;
        },
        pause: function () {
            sprites.forEach(function (sprite) {
                sprite.strip.pause();
            });
            updating = false;
            drawing = true;
        },
        stop: function () {
            sprites.forEach(function (sprite) {
                sprite.strip.stop();
            });
            updating = false;
            drawing = false;
        },
        depth: opts.depth || 0,
        collisionSet: function (name) {
            return collisionMap[name];
        },
        addCollisionSet: function (handler) {
            collisionMap[handler.name] = handler;
        },
        sprite: function (name) {
            return spriteMap[name];
        },
        addSprites: function (set) {
            spritesToAdd = spritesToAdd.concat(set);
        },
        removeSprite: function (sprite) {
            sprite.removed = true;
            spriteRemoved = true;
        },
        update: function () {
            var i,
                doSort = false,
                spritesLoading = [];

            if (updating) {
                // Update sprites.
                sprites.forEach(function (sprite) {
                    if (updating && !sprite.removed) {
                        // Don't update dead sprites.
                        sprite.update();
                    }
                });

                // Update collisions.
                for (i in collisionMap) {
                    collisionMap[i].handleCollisions();
                }
            }

            if (spritesToAdd.length) {
                // Update the master sprite list after updates.
                spritesToAdd.forEach(function (sprite) {
                    if (sprite.ready) {
                        // Load the sprite into the game engine
                        // if its resources are done loading.
                        sprites.push(sprite);
                        if (sprite.name) {
                            spriteMap[sprite.name] = sprite;
                        }
                        doSort = true;
                    } else {
                        // Stash loading sprites for this frame.
                        spritesLoading.push(sprite);
                    }
                });
                if (doSort) {
                    // Sort by descending sprite depths.
                    sprites.sort(function (a, b) {
                        return b.depth - a.depth;
                    });
                }
                spritesToAdd = spritesLoading;
            }
            if (spriteRemoved) {
                // Remove any stale sprites.
                sprites = sprites.filter(function (sprite) {
                    // true to keep, false to drop.
                    return !sprite.removed;
                });
                spriteRemoved = false;
            }
        },
        draw: function (ctx) {
            if (drawing) {
                sprites.forEach(function (sprite) {
                    sprite.draw(ctx);
                });
            }
        }
    });
};

},{"baseclassjs":1}],18:[function(require,module,exports){
var BaseClass = require('baseclassjs');

module.exports = function (x, y) {
    return BaseClass({
        x: x || 0,
        y: y || 0,
        move: function (x, y) {
            this.x = x;
            this.y = y;
        },
        intersects: BaseClass.Stub
    });
};

},{"baseclassjs":1}],19:[function(require,module,exports){
var Collidable = require('./collidable.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js');

/**
 * Sprite:
 * @param {AnimationStrip} opts.strip
 * @param {Point} [opts.pos] Defaults to (0,0).
 * @param {Number} [opts.scale] Defaults to 1.
 * @param {Dimension} [opts.size] Defaults to strip size.
 * @param {Number} [opts.depth] Defaults to 0.
 * @param {Number} [opts.rotation] Defaults to 0.
 * @param {Point} [opts.speed] Defaults to (0,0).
 *
 * Collidable:
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 */
module.exports = function (opts) {
    var size = opts.size || opts.strip.size;

    return Collidable(opts).extend({
        get ready () {
            return opts.strip.ready;
        },
        get strip () {
            return opts.strip;
        },
        pos: opts.pos || Point(),
        scale: opts.scale || 1,
        size: size,
        rotation: opts.rotation || 0,
        depth: opts.depth || 0,
        speed: opts.speed || Point(),
        update: function () {
            this.base.update();
            // Advance the animation.
            opts.strip.update();
        },
        draw: function (ctx) {
            opts.strip.draw(
                ctx,
                this.pos,
                Dimension(
                    size.width / opts.strip.size.width * this.scale,
                    size.height / opts.strip.size.height * this.scale
                ),
                this.rotation
            );
        },
        move: function (x, y) {
            this.pos.x = x;
            this.pos.y = y;
            this.base.move(x, y);
        },
        shift: function (vx, vy) {
            this.pos.x += vx || this.speed.x;
            this.pox.y += vy || this.speed.y;
            this.base.move(this.pos.x, this.pos.y);
        }
    });
};

},{"./collidable.js":4,"./dimension.js":7,"./point.js":14}],20:[function(require,module,exports){
var cache = {};

/**
 * @param opts.src
 * Duplicate calls to constructor will only
 * load a single time - returning cached
 * data on subsequent calls.
 */
module.exports = function (opts) {
    var img;

    // Check if already loaded and cached.
    if (opts.src in cache) {
        return cache[opts.src];
    }

    // Create and cache the new image.
    img = new Image();
    img.ready = false;
    cache[opts.src] = img;

    img.onload = function () {
        img.ready = true;
    };

    img.src = 'assets/img/' + opts.src;
    return img;
};

},{}],21:[function(require,module,exports){
var Point = require('./point.js');

/**
 * Can be created with either:
 * Vector(10, 20);
 * or
 * Vector(5, 2, 15, 22);
 * Both of these vectors are === to each other.
 */
function Vector(run, rise, x2, y2) {
    if (y2 !== undefined) {
        run = run - x2;
        rise = rise - y2;
    }
    return {
        extend: require('baseclassjs'),
        x: run,
        y: rise,
        length: function () {
            return Math.sqrt((rise * rise) + (run * run));
        }
    };
}
Vector.length = function (run, rise, x2, y2) {
    if (y2 !== undefined) {
        run = run - x2;
        rise = rise - y2;
    }
    return Math.sqrt((rise * rise) + (run * run));
};

module.exports = Vector;

},{"./point.js":14,"baseclassjs":1}],22:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler,
    Game = Dragon.Game;

module.exports = CollisionHandler({
    name: 'environ',
    gridSize: Dimension(5, 5),
    canvasSize: Game.canvas
});

},{"dragonjs":6}],23:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    mainScreen = require('./screens/main.js');

Game.addScreens([
    mainScreen
]);
Game.run({
    debug: true
});

},{"./screens/main.js":24,"dragonjs":6}],24:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Sky = require('../sprites/sky.js'),
    Runner = require('../sprites/runner.js'),
    Ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = Screen({
    name: 'main',
    collisionSets: collisions,
    spriteSet: [
        Sky,
        Runner,
        Ground
    ]
});

},{"../collisions/main.js":22,"../sprites/ground.js":25,"../sprites/runner.js":26,"../sprites/sky.js":27,"dragonjs":6}],25:[function(require,module,exports){
var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'ground',
    collisionSets: collisions,
    mask: Rect(
        Point(0, canvas.height - 115),
        Dimension(canvas.width, 100)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'ground.png'
        }),
        size: Dimension(81, 79)
    }),
    pos: Point(0, canvas.height - 115),
    scale: 0.4
});

},{"../collisions/main.js":22,"dragonjs":6}],26:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    KeyDown = Dragon.Keyboard,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'runner',
    collisionSets: collisions,
    mask: Rect(
        Point(100, 100),
        Dimension(66, 115)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'runningGrant.png'
        }),
        start: Point(),
        size: Dimension(165, 288),
        frames: 12,
        speed: 5
    }),
    scale: 0.4,
    pos: Point(100, 100),
    on: {
        'collide/ground': function () {
            console.log('Runner: Colliding with ground!');
        }
    }
}).extend({
    update: function () {
        console.log('runner update');
        if (KeyDown.name(' ')) {
            console.log('Runner: Jumping!');
        }

        if (KeyDown.code(37)) {
            // Left arrow.
            this.speed.x = -4;
        } else if (KeyDown.code(39)) {
            // Right arrow.
            this.speed.x = 4;
        } else {
            this.speed.x = 0;
        }

        if (KeyDown.code(38)) {
            // Up arrow.
            this.speed.y = -4;
        } else if (KeyDown.code(40)) {
            // Down arrow.
            this.speed.y = 4;
        } else {
            this.speed.y = 0;
        }

        this.base.update();
    }
});

},{"../collisions/main.js":22,"dragonjs":6}],27:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'sky',
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'sky.png'
        }),
        start: Point(),
        size: Game.canvas,
        frames: 1
    })
});

},{"dragonjs":6}]},{},[23]);

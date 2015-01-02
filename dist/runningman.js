(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function () {
    throw Error('[BaseClass] Abstract method was called without definition.');
};

},{}],2:[function(require,module,exports){
var rebind = require('./rebind.js');

function contructor(root) {
    root.extend = function (child) {
        var key, base = {
            base: root.base
        };
        child = child || {};

        for (key in root) {
            if (typeof root[key] === 'function') {
                base[key] = root[key].bind(root);
            }
        }
        for (key in child) {
            if (typeof child[key] === 'function') {
                root[key] = rebind(key, root, base, child);
            } else {
                root[key] = child[key];
            }
        }

        root.base = base;
        return root;
    };

    root.implement = function () {
        var i, len = arguments.length;
        for (i = 0; i < len; i += 1) {
            arguments[i](root);
        }
        return root;
    };

    return root;
}

contructor.Abstract = require('./abstract.js');
contructor.Stub = require('./stub.js');
contructor.Interface = require('./interface.js');

module.exports = contructor;

},{"./abstract.js":1,"./interface.js":3,"./rebind.js":4,"./stub.js":5}],3:[function(require,module,exports){
module.exports = function (child) {
    return function (root) {
        var key;
        for (key in child) {
            root[key] = child[key];
        }
        return root;
    };
};

},{}],4:[function(require,module,exports){
module.exports = function (key, root, base, self) {
    return function () {
        var out,
            oldbase = root.base;

        // Rebind base and self for this specific method.
        root.base = base;
        root.self = self;
        out = self[key].apply(root, arguments);

        // Restore the original base object.
        root.base = oldbase;
        return out;
    };
};

},{}],5:[function(require,module,exports){
module.exports = function () {};

},{}],6:[function(require,module,exports){
(function (global){
/**
 * # Lumberjack
 * Set `localStorage.lumberjack` to `on` to enable logging.
 * @param {Boolean} enabled True to force logging regardless of
 * the localStorage setting.
 * @return {Object} A new Lumberjack.
 * @see GitHub-Page http://github.com/cobbdb/lumberjack
 */
module.exports = function (enabled) {
    var log,
        record = {},
        cbQueue = {},
        master = [],
        ls = global.localStorage || {};

    /**
     * ## log(channel, data)
     * Record a log entry for an channel.
     * @param {String} channel A string describing this channel.
     * @param {String|Object|Number|Boolean} data Some data to log.
     */
    log = function (channel, data) {
        var i, len, channel, entry;
        var channelValid = typeof channel === 'string';
        var dataType = typeof data;
        var dataValid = dataType !== 'undefined' && dataType !== 'function';
        if (ls.lumberjack !== 'on' && !enabled) {
            // Do nothing unless enabled.
            return;
        }
        if (channelValid && dataValid) {
            /**
             * All log entries take the form of:
             * ```javascript
             *  {
             *      time: // timestamp when entry was logged
             *      data: // the logged data
             *      channel: // channel of entry
             *      id: // id of entry in master record
             *  }
             * ```
             */
            entry = {
                time: new Date(),
                data: data,
                channel: channel,
                id: master.length
            };
            // Record the channel.
            record[channel] = record[channel] || []
            record[channel].push(entry);
            master.push(entry);

            // Perform any attached callbacks.
            cbQueue[channel] = cbQueue[channel] || [];
            len = cbQueue[channel].length;
            for (i = 0; i < len; i += 1) {
                cbQueue[channel][i](data);
            }
        } else {
            throw Error('Lumberjack Error: log(channel, data) requires an channel {String} and a payload {String|Object|Number|Boolean}.');
        }
    };

    /**
     * ## log.clear([channel])
     * Clear all data from a the log.
     * @param {String} [channel] Name of a channel.
     */
    log.clear = function (channel) {
        if (channel) {
            record[channel] = [];
        } else {
            record = {};
            master = [];
        }
    };

    /**
     * ## log.readback(channel, [pretty])
     * Fetch the log of an channel.
     * @param {String} channel A string describing this channel.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This channel's current record.
     */
    log.readback = function (channel, pretty) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            if (pretty) {
                return JSON.stringify(record[channel], null, 4);
            }
            return record[channel] || [];
        }
        throw Error('log.readback(channel, pretty) requires an channel {String}.');
    };

    /**
     * ## log.readback.master([pretty])
     * Get a full readback of all channels' entries.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's master record.
     */
    log.readback.master = function (pretty) {
        if (pretty) {
            return JSON.stringify(master, null, 4);
        }
        return master;
    };

    /**
     * ## log.readback.channels([pretty])
     * Fetch list of log channels currently in use.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's set of used channels.
     */
    log.readback.channels = function (pretty) {
        var keys = Object.keys(record);
        if (pretty) {
            return JSON.stringify(keys);
        }
        return keys;
    };

    /**
     * ## log.on(channel, cb)
     * Attach a callback to run anytime a channel is logged to.
     * @param {String} channel A string describing this channel.
     * @param {Function} cb The callback.
     */
    log.on = function (channel, cb) {
        var channelValid = typeof channel === 'string';
        var cbValid = typeof cb === 'function';
        if (channelValid && cbValid) {
            cbQueue[channel] = cbQueue[channel] || [];
            cbQueue[channel].push(cb);
        } else {
            throw Error('log.on(channel, cb) requires an channel {String} and a callback {Function}.');
        }
    };

    /**
     * ## log.off(channel)
     * Disable side-effects for a given channel.
     * @param {String} channel A string describing this channel.
     */
    log.off = function (channel) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            cbQueue[channel] = [];
        } else {
            throw Error('log.off(channel) requires an channel {String}.');
        }
    };

    /**
     * ## log.enable()
     * Activate logging regardless of previous settings.
     */
    log.enable = function () {
        enabled = true;
    };

    /**
     * ## log.disable()
     * Force logging off.
     */
    log.disable = function () {
        enabled = false;
    };

    return log;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
var Dimension = require('./dimension.js'),
    Point = require('./point.js'),
    log = require('./log.js');

/**
 * @param {SpriteSheet} opts.sheet
 * @param {Point} [opts.start] Defaults to (0,0). Point in the
 * sprite sheet of the first frame.
 * @param {Dimension} [opts.size] Defaults to (0,0). Size of
 * each frame in the sprite sheet.
 * @param {Number} [opts.frames] Defaults to 1. Number of
 * frames in this strip.
 * @param {Number} [opts.speed] Number of frames per second.
 * @param {Boolean} [opts.sinusoid] Defaults to false. True
 * to cycle the frames forward and backward in a sinusoid.
 */
module.exports = function (opts) {
    var timeLastFrame,
        timeSinceLastFrame = 0,
        updating = false,
        frames = opts.frames || 1,
        size = opts.size || Dimension(),
        start = opts.start || Point(),
        start = Point(
            size.width * start.x,
            size.height * start.y
        ),
        direction = 1;

    return {
        ready: function () {
            return opts.sheet.ready;
        },
        size: size,
        frame: 0,
        speed: opts.speed || 0,
        load: function (cb) {
            opts.sheet.load(cb);
        },
        start: function () {
            timeLastFrame = Date.now();
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
            direction = 1;
        },
        update: function () {
            var now, elapsed, timeBetweenFrames;

            if (updating && this.speed) {
                timeBetweenFrames = (1 / this.speed) * 1000;
                now = Date.now();
                elapsed = now - timeLastFrame;
                timeSinceLastFrame += elapsed;
                if (timeSinceLastFrame >= timeBetweenFrames) {
                    timeSinceLastFrame = 0;
                    this.nextFrame();
                }
                timeLastFrame = now;
            }
        },
        nextFrame: function () {
            this.frame += direction;
            if (opts.sinusoid) {
                if (this.frame % (frames - 1) === 0) {
                    direction *= -1;
                }
            } else {
                this.frame %= frames;
            }
            return this.frame;
        },
        /**
         * @param {Context2D} ctx Canvas 2D context.
         * @param {Point} pos Canvas position.
         * @param {Dimension} [scale] Defaults to (1,1).
         * @param {Number} [rotation] Defaults to 0.
         */
        draw: function (ctx, pos, scale, rotation) {
            var finalSize,
                offset = this.frame * size.width;
            scale = scale || Dimension(1, 1);
            rotation = rotation || 0;
            finalSize = Dimension(
                size.width * scale.width,
                size.height * scale.height
            );

            // Apply the canvas transforms.
            ctx.save();
            ctx.translate(
                pos.x + finalSize.width / 2,
                pos.y + finalSize.height / 2
            );
            ctx.rotate(rotation);

            // Draw the frame and restore the canvas.
            ctx.drawImage(opts.sheet,
                start.x + offset,
                start.y,
                size.width,
                size.height,
                -finalSize.width / 2,
                -finalSize.height / 2,
                finalSize.width,
                finalSize.height
            );
            ctx.restore();
        }
    };
};

},{"./dimension.js":14,"./log.js":21,"./point.js":23}],8:[function(require,module,exports){
var canvas = document.createElement('canvas');

if (window.innerWidth >= 500) {
    // Large screen devices.
    canvas.width = 320;
    canvas.height = 480;
    canvas.style.border = '1px solid #000';
    canvas.mobile = false;
} else {
    // Mobile devices.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.style.height = canvas.height + 'px';
    canvas.mobile = true;
}
document.body.appendChild(canvas);

canvas.ctx = canvas.getContext('2d');
module.exports = canvas;

},{}],9:[function(require,module,exports){
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

    return Shape({
        pos: pos,
        name: 'circle',
        intersects: {
            rectangle: function (rect) {
                var vect,
                    pt = Point(this.x, this.y);

                if (this.x > rect.right) pt.x = rect.right;
                else if (this.x < rect.x) pt.x = rect.x;
                if (this.y > rect.bottom) pt.y = rect.bottom;
                else if (this.y < rect.y) pt.y = rect.y;

                vect = Vector(
                    this.x - pt.x,
                    this.y - pt.y
                );
                return vect.magnitude < this.radius;
            },
            circle: function (circ) {
                var vect = Vector(
                    circ.x - this.x,
                    circ.y - this.y
                );
                return vect.magnitude < this.radius + circ.radius;
            }
        }
    }).extend({
        radius: rad,
        width: rad * 2,
        height: rad * 2,
        top: pos.y - rad,
        right: pos.x + rad,
        bottom: pos.y + rad,
        left: pos.x - rad,
        draw: function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
        },
        move: function (x, y) {
            this.x = x;
            this.y = y;
            this.top = y - this.radius;
            this.right = x + this.radius;
            this.bottom = y + this.radius;
            this.left = x - this.radius;
        },
        resize: function (rad) {
            this.radius = rad;
            this.width = rad * 2;
            this.height = rad * 2;
            this.top = this.y - rad;
            this.right = this.x + rad;
            this.bottom = this.y + rad;
            this.left = this.x - rad;
        }
    });
};

},{"./dimension.js":14,"./point.js":23,"./shape.js":27,"./vector.js":30}],10:[function(require,module,exports){
var Counter = require('./id-counter.js'),
    EventHandler = require('./event-handler.js'),
    BaseClass = require('baseclassjs'),
    Rectangle = require('./rectangle.js'),
    Point = require('./point.js');

/**
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var activeCollisions = {},
        collisionSets = [],
        updated = false;

    if (opts.collisionSets) {
        collisionSets = [].concat(opts.collisionSets);
    }

    return BaseClass({
        id: Counter.nextId,
        name: opts.name,
        mask: opts.mask || Rectangle(),
        offset: opts.offset || Point(),
        move: function (pos) {
            this.mask.move(
                pos.x + this.offset.x,
                pos.y + this.offset.y
            );
        },
        intersects: function (mask) {
            return this.mask.intersects(mask);
        },
        update: function () {
            var that = this;
            if (!updated) {
                collisionSets.forEach(function (handler) {
                    handler.update(that);
                });
                updated = true;
            }
        },
        teardown: function () {
            updated = false;
        },
        addCollision: function (id) {
            activeCollisions[id] = true;
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
            events: opts.on,
            singles: opts.one
        })
    );
};

},{"./event-handler.js":15,"./id-counter.js":18,"./point.js":23,"./rectangle.js":25,"baseclassjs":2}],11:[function(require,module,exports){
var Rectangle = require('./rectangle.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    canvas = require('./canvas.js');

/**
 * @param {String} opts.name
 * @param {Dimension} [opts.gridSize] Defaults to (1,1).
 */
module.exports = function (opts) {
    var i, j,
        collisionGrid = [],
        activeCollisions = [],
        gridSize = opts.gridSize || Dimension(1, 1);

    for (i = 0; i < gridSize.width; i += 1) {
        for (j = 0; j < gridSize.height; j += 1) {
            collisionGrid.push(
                Rectangle(
                    Point(
                        i / gridSize.width * canvas.width,
                        j / gridSize.height * canvas.height
                    ),
                    Dimension(
                        canvas.width / gridSize.width,
                        canvas.height / gridSize.height
                    )
                )
            );
        }
    }

    for (i = 0; i < collisionGrid.length; i += 1) {
        activeCollisions.push([]);
    }

    return {
        name: opts.name,
        draw: function (ctx, drawGrid) {
            if (drawGrid) {
                collisionGrid.forEach(function (partition) {
                    partition.draw(ctx);
                });
            }
            activeCollisions.forEach(function (set) {
                set.forEach(function (collidable) {
                    collidable.mask.draw(ctx);
                });
            });
        },
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
                        var intersects, colliding;

                        if (pivot.id !== other.id) {
                            intersects = pivot.intersects(other.mask),
                            colliding = pivot.isCollidingWith(other.id);
                            /**
                             * (colliding) ongoing intersection
                             * (collide) first collided: no collide -> colliding
                             * (separate) first separated: colliding -> no collide
                             * (miss) ongoing separation
                             */
                            if (intersects) {
                                if (!colliding) {
                                    pivot.addCollision(other.id);
                                    pivot.trigger('collide/' + other.name, other);
                                }
                                pivot.trigger('colliding/' + other.name, other);
                            } else {
                                if (colliding) {
                                    pivot.removeCollision(other.id);
                                    pivot.trigger('separate/' + other.name, other);
                                }
                                pivot.trigger('miss/' + other.name, other);
                            }
                        }
                    });
                });
            }
        },
        teardown: function () {
            this.clearCollisions();
        }
    };
};

},{"./canvas.js":8,"./dimension.js":14,"./point.js":23,"./rectangle.js":25}],12:[function(require,module,exports){
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

},{"./animation-strip.js":7,"./circle.js":9,"./collidable.js":10,"./collision-handler.js":11,"./dimension.js":14,"./event-handler.js":15,"./frame-counter.js":16,"./game.js":17,"./id-counter.js":18,"./keyboard.js":20,"./mouse.js":22,"./point.js":23,"./polar.js":24,"./rectangle.js":25,"./screen.js":26,"./shape.js":27,"./sprite.js":28,"./spritesheet.js":29,"./vector.js":30}],13:[function(require,module,exports){
module.exports = {
    show: {
        fps: function () {}
    }
};

},{}],14:[function(require,module,exports){
function Dimension(w, h) {
    return {
        width: w || 0,
        height: h || 0,
        clone: function () {
            return Dimension(this.width, this.height);
        },
        equals: function (other) {
            return (
                this.width === other.width &&
                this.height === other.height
            );
        },
        scale: function (scale) {
            return Dimension(
                this.width * scale,
                this.height * scale
            );
        }
    };
}

module.exports = Dimension;

},{}],15:[function(require,module,exports){
var BaseClass = require('baseclassjs');

/**
 * @param {Object} [opts.events]
 * @param {Object} [opts.singles]
 */
module.exports = function (opts) {
    var events = {},
        singles = {},
        name;

    opts = opts || {};
    for (name in opts.events) {
        events[name] = [
            opts.events[name]
        ];
    }
    for (name in opts.singles) {
        singles[name] = [
            opts.singles[name]
        ];
    }

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
            var that = this;
            if (name in events) {
                events[name].forEach(function (cb) {
                    cb.call(that, data);
                });
            }
            if (name in singles) {
                singles[name].forEach(function (cb) {
                    cb.call(that, data);
                });
                singles[name] = [];
            }
        }
    });
};

},{"baseclassjs":2}],16:[function(require,module,exports){
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
    },
    draw: function (ctx) {
        ctx.font = '30px Verdana';
        ctx.fillStyle = 'rgba(250, 50, 50, 0.5)';
        ctx.fillText(frameRate, 20, 50);
    }
};

},{}],17:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Circle = require('./circle.js'),
    Rectangle = require('./rectangle.js'),
    Collidable = require('./collidable.js'),
    FrameCounter = require('./frame-counter.js'),
    Mouse = require('./mouse.js'),
    canvas = require('./canvas.js'),
    ctx = canvas.ctx,
    Counter = require('./id-counter.js'),
    log = require('./log.js'),
    debug = false,
    heartbeat = false,
    throttle = 30,
    screens = [],
    screenMap = {},
    screensToAdd = [],
    screenRemoved = false,
    dragonCollisions = CollisionHandler({
        name: 'dragon',
        gridSize: Dimension(4, 4),
        canvasSize: canvas
    }),
    loadQueue = {},
    masks = {
        screentap: Collidable({
            name: 'screentap',
            mask: Circle(Point(), 15)
        }),
        screendrag: Collidable({
            name: 'screendrag',
            mask: Circle(Point(), 25)
        }),
        screenhold: Collidable({
            name: 'screenhold',
            mask: Circle(Point(), 15)
        }),
        screenedge: {
            top: Collidable({
                name: 'screenedge/top',
                mask: Rectangle(
                    Point(0, -9),
                    Dimension(canvas.width, 10)
                )
            }),
            right: Collidable({
                name: 'screenedge/right',
                mask: Rectangle(
                    Point(canvas.width - 1, 0),
                    Dimension(10, canvas.height)
                )
            }),
            bottom: Collidable({
                name: 'screenedge/bottom',
                mask: Rectangle(
                    Point(0, canvas.height - 1),
                    Dimension(canvas.width, 10)
                )
            }),
            left: Collidable({
                name: 'screenedge/left',
                mask: Rectangle(
                    Point(-9, 0),
                    Dimension(10, canvas.height)
                )
            })
        }
    };

Mouse.on.down(function () {
    masks.screentap.move(Mouse.offset);
    dragonCollisions.update(masks.screentap);
});

module.exports = {
    log: log,
    canvas: canvas,
    debug: require('./debug-console.js'),
    collisions: dragonCollisions,
    screen: function (name) {
        return screenMap[name];
    },
    /**
     * Loads screen into the game together
     * as a batch. None of the batch will be
     * loaded into the game until all screens
     * are ready.
     * @param {Array|Screen} set
     */
    addScreens: function (set) {
        var id;
        if (set) {
            set = [].concat(set);
            id = Counter.nextId;

            loadQueue[id] = set.length;
            set.forEach(function (screen) {
                screen.load(function () {
                    loadQueue[id] -= 1;
                    if (loadQueue[id] === 0) {
                        screensToAdd = screensToAdd.concat(set);
                    }
                });
            });
        }
    },
    removeScreen: function (screen) {
        screen.removed = true;
        screenRemoved = true;
    },
    run: function (opts) {
        var speed,
            that = this;

        opts = opts || {};
        speed = opts.speed || throttle;
        debug = opts.debug;

        if (debug) {
            window.Dragon = this;
        }

        if (!heartbeat) {
            screens.forEach(function (screen) {
                screen.start();
            });
            heartbeat = window.setInterval(function () {
                that.update();
                that.draw();
                that.teardown();
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
        if (Mouse.is.dragging) {
            masks.screendrag.move(Mouse.offset);
            dragonCollisions.update(masks.screendrag);
        } else if (Mouse.is.holding) {
            masks.screenhold.move(Mouse.offset);
            dragonCollisions.update(masks.screenhold);
        }
        dragonCollisions.update(masks.screenedge.top);
        dragonCollisions.update(masks.screenedge.right);
        dragonCollisions.update(masks.screenedge.bottom);
        dragonCollisions.update(masks.screenedge.left);

        // Update the screen.
        screens.forEach(function (screen) {
            screen.update();
        });

        // Settle screen tap events.
        dragonCollisions.handleCollisions();

        if (screensToAdd.length) {
            // Update the master screen list after updates.
            screensToAdd.forEach(function (screen) {
                screens.push(screen);
                if (screen.name) {
                    screenMap[screen.name] = screen;
                }
                screen.trigger('ready');
            });
            // Sort by descending sprite depths.
            screens.sort(function (a, b) {
                return b.depth - a.depth;
            });
            screensToAdd = [];
        }
    },
    draw: function () {
        screens.forEach(function (screen) {
            screen.draw(ctx, debug);
        });
        if (debug) {
            FrameCounter.draw(ctx);
            dragonCollisions.draw(ctx);
        }
    },
    teardown: function () {
        dragonCollisions.teardown();
        screens.forEach(function (screen) {
            screen.teardown();
        });
        if (screenRemoved) {
            // Remove any stale screens.
            screens = screens.filter(function (screen) {
                // true to keep, false to drop.
                return !screen.removed;
            });
            screenRemoved = false;
        }
    }
};

},{"./canvas.js":8,"./circle.js":9,"./collidable.js":10,"./collision-handler.js":11,"./debug-console.js":13,"./dimension.js":14,"./frame-counter.js":16,"./id-counter.js":18,"./log.js":21,"./mouse.js":22,"./point.js":23,"./rectangle.js":25}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
module.exports = function (src) {
    var img = new Image();
    img.ready = false;
    img.cmd = [];

    img.processLoadEvents = function () {
        this.cmd.forEach(function (cb) {
            cb(img);
        });
        this.cmd = [];
    };

    img.onload = function () {
        this.ready = true;
        this.processLoadEvents();
    };

    /**
     * @param {Function} [cb] Defaults to noop. Callback
     * for onload event.
     */
    img.load = function (cb) {
        cb = cb || function () {};
        if (this.ready) {
            cb(img);
        } else {
            this.cmd.push(cb);
            this.src = 'assets/img/' + src;
        }
    };

    return img;
};

},{}],20:[function(require,module,exports){
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
    arrow: {
        get left () {
            return codeMap[37] || false;
        },
        get up () {
            return codeMap[38] || false;
        },
        get right () {
            return codeMap[39] || false;
        },
        get down () {
            return codeMap[40] || false;
        }
    },
    name: function (name) {
        return nameMap[name] || false;
    },
    code: function (code) {
        return codeMap[code] || false;
    }
};

},{}],21:[function(require,module,exports){
var Lumberjack = require('lumberjackjs');

module.exports = Lumberjack();

},{"lumberjackjs":6}],22:[function(require,module,exports){
(function (global){
var Point = require('./point.js'),
    Vector = require('./vector.js'),
    canvas = require('./canvas.js'),
    isDown = false,
    isDragging = false,
    isHolding = false,
    current = Point(),
    last = Point(),
    shift = Vector(),
    startEventName,
    moveEventName,
    endEventName;

if (canvas.mobile) {
    startEventName = 'touchstart';
    moveEventName = 'touchmove';
    endEventName = 'touchend';
} else {
    startEventName = 'mousedown';
    moveEventName = 'mousemove';
    endEventName = 'mouseup';
}

function getOffset(event) {
    if (canvas.mobile) {
        return Point(
            event.touches[0].clientX,
            event.touches[0].clientY
        );
    }
    return Point(
        event.offsetX,
        event.offsetY
    );
}

canvas.addEventListener(
    startEventName,
    function (event) {
        isDown = true;
        current = getOffset(event);
        global.setTimeout(function () {
            if (isDown) {
                isHolding = true;
            }
        }, 200);
    }
);
document.addEventListener(
    endEventName,
    function (event) {
        isDown = isDragging = isHolding = false;
    }
);
canvas.addEventListener(
    moveEventName,
    function (event) {
        last = current;
        current = getOffset(event);

        if (isDown) {
            shift.x = current.x - last.x;
            shift.y = current.y - last.y;
            // Drag threshold.
            if (shift.magnitude > 1) {
                isDragging = true;
            }
        }
    }
);

module.exports = {
    is: {
        get down () {
            return isDown;
        },
        get dragging () {
            return isDragging;
        },
        get holding () {
            return isHolding;
        }
    },
    get offset () {
        return current;
    },
    on: {
        down: function (cb) {
            canvas.addEventListener(startEventName, cb);
        },
        click: function (cb) {},
        dclick: function (cb) {},
        up: function (cb) {
            document.addEventListener(endEventName, cb);
        },
        move: function (cb) {
            canvas.addEventListener(moveEventName, cb);
        }
    },
    eventName: {
        start: startEventName,
        move: moveEventName,
        end: endEventName
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./canvas.js":8,"./point.js":23,"./vector.js":30}],23:[function(require,module,exports){
function Point(x, y) {
    return {
        x: x || 0,
        y: y || 0,
        clone: function () {
            return Point(this.x, this.y);
        },
        equals: function (other) {
            return (
                this.x === other.x &&
                this.y === other.y
            );
        }
    };
}

module.exports = Point;

},{}],24:[function(require,module,exports){
var Vector = require('./vector.js');

function isEqual(my, other, tfactor, mfactor) {
    var mag = my.magnitude === mfactor * other.magnitude,
        mytheta = (my.theta % Math.PI).toFixed(5),
        otheta = ((other.theta + tfactor) % Math.PI).toFixed(5);
    return mag && (mytheta === otheta);
}

/**
 * @param {Number} [theta] Defaults to 0.
 * @param {Number} [mag] Defaults to 0.
 */
function Polar(theta, mag) {
    return {
        theta: theta || 0,
        magnitude: mag || 0,
        invert: function () {
            return Polar(
                this.theta + Math.PI,
                this.magnitude * -1
            );
        },
        clone: function () {
            return Polar(
                this.theta,
                this.magnitude
            );
        },
        toVector: function () {
            return Vector(
                this.magnitude * Math.cos(this.theta),
                this.magnitude * Math.sin(this.theta)
            );
        },
        equals: function (other) {
            return (
                isEqual(this, other, 0, 1) ||
                isEqual(this, other, Math.PI, -1)
            );
        }
    };
}

module.exports = Polar;

},{"./vector.js":30}],25:[function(require,module,exports){
var Shape = require('./shape.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Vector = require('./vector.js');

/**
 * @param {Point} [pos] Defaults to (0,0).
 * @param {Dimension} [size] Defaults to (0,0).
 */
module.exports = function (pos, size) {
    pos = pos || Point();
    size = size || Dimension();

    return Shape({
        pos: pos,
        name: 'rectangle',
        intersects: {
            rectangle: function (rect) {
                return (
                    this.x < rect.right &&
                    this.right > rect.x &&
                    this.y < rect.bottom &&
                    this.bottom > rect.y
                );
            },
            circle: function (circ) {
                var vect,
                    pt = Point(circ.x, circ.y);

                if (circ.x > this.right) pt.x = this.right;
                else if (circ.x < this.x) pt.x = this.x;
                if (circ.y > this.bottom) pt.y = this.bottom;
                else if (circ.y < this.y) pt.y = this.y;

                vect = Vector(
                    circ.x - pt.x,
                    circ.y - pt.y
                );
                return vect.magnitude < circ.radius;
            }
        }
    }).extend({
        width: size.width || 0,
        height: size.height || 0,
        top: pos.y || 0,
        right: pos.x + size.width || 0,
        bottom: pos.y + size.height || 0,
        left: pos.x || 0,
        move: function (x, y) {
            this.x = x;
            this.y = y;
            this.top = y;
            this.right = x + this.width;
            this.bottom = y + this.height;
            this.left = x;
        },
        resize: function (size) {
            this.width = size.width;
            this.height = size.height;
            this.right = this.x + size.width;
            this.bottom = this.y + size.height;
        },
        draw: function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    });
};

},{"./dimension.js":14,"./point.js":23,"./shape.js":27,"./vector.js":30}],26:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    EventHandler = require('./event-handler.js'),
    Counter = require('./id-counter.js');

/**
 * @param {Array|Sprite} [opts.spriteSet]
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {String} opts.name
 * @param {Number} [opts.depth] Defaults to 0.
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var self,
        loaded = false,
        sprites = [],
        spriteMap = {},
        spritesToAdd = [],
        spritesLoading = [],
        loadQueue = {},
        spriteRemoved = false,
        collisionMap = {},
        updating = false,
        drawing = false;

    self = BaseClass({
        name: opts.name,
        load: function (cb) {
            if (!loaded) {
                this.addSprites({
                    set: opts.spriteSet,
                    onload: cb
                });
                loaded = true;
            }
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
        collision: function (name) {
            return collisionMap[name];
        },
        /**
         * @param {Array|CollisionHandler} set
         */
        addCollisionSets: function (set) {
            if (set) {
                set = [].concat(set);
                set.forEach(function (handler) {
                    collisionMap[handler.name] = handler;
                });
            }
        },
        sprite: function (name) {
            return spriteMap[name];
        },
        /**
         * Loads sprites into this screen together
         * as a batch. None of the batch will be
         * loaded into the screen until all sprites
         * are ready.
         * @param {Array|Sprite} opts.set
         * @param {Function} [onload]
         */
        addSprites: function (opts) {
            var id, onload, set;
            opts = opts || {};

            if (opts.set) {
                onload = opts.onload || function () {};
                set = [].concat(opts.set);
                id = Counter.nextId;

                loadQueue[id] = set.length;
                set.forEach(function (sprite) {
                    sprite.load(function () {
                        loadQueue[id] -= 1;
                        if (loadQueue[id] === 0) {
                            spritesToAdd = spritesToAdd.concat(set);
                            onload();
                        }
                    });
                });
            }
        },
        removeSprite: function (sprite) {
            sprite.removed = true;
            spriteRemoved = true;
        },
        update: function () {
            var i;

            // Update sprites.
            sprites.forEach(function (sprite) {
                if (updating && !sprite.removed) {
                    // Don't update dead sprites.
                    sprite.update();
                }
            });

            // Process collisions.
            for (i in collisionMap) {
                collisionMap[i].handleCollisions();
            }

            if (spritesToAdd.length) {
                // Update the master sprite list after updates.
                spritesToAdd.forEach(function (sprite) {
                    sprites.push(sprite);
                    if (sprite.name) {
                        spriteMap[sprite.name] = sprite;
                    }
                    sprite.strip.start();
                });
                // Sort by descending sprite depths.
                sprites.sort(function (a, b) {
                    return b.depth - a.depth;
                });
                spritesToAdd = [];
            }
        },
        draw: function (ctx, debug) {
            var name;
            if (drawing) {
                sprites.forEach(function (sprite) {
                    sprite.draw(ctx);
                });
                if (debug) {
                    for (name in collisionMap) {
                        collisionMap[name].draw(ctx);
                    }
                }
            }
        },
        teardown: function () {
            var i;

            if (updating) {
                sprites.forEach(function (sprite) {
                    if (!sprite.removed) {
                        // Don't update dead sprites.
                        sprite.teardown();
                    }
                });
            }

            for (i in collisionMap) {
                collisionMap[i].teardown();
            }

            if (spriteRemoved) {
                // Remove any stale sprites.
                sprites = sprites.filter(function (sprite) {
                    // true to keep, false to drop.
                    return !sprite.removed;
                });
                spriteRemoved = false;
            }
        }
    }).implement(
        EventHandler({
            events: opts.on,
            singles: opts.one
        })
    );

    // Load in collision handlers.
    self.addCollisionSets(opts.collisionSets);

    return self;
};

},{"./event-handler.js":15,"./id-counter.js":18,"baseclassjs":2}],27:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Point = require('./point.js');

/**
 * @param {Point} [opts.pos] Defaults to (0,0).
 * @param {Object} [opts.intersects] Dictionary of collision tests.
 */
module.exports = function (opts) {
    var pos, intersectMap;

    opts = opts || {};
    intersectMap = opts.intersects || {};
    pos = opts.pos || Point();

    return BaseClass({
        x: pos.x,
        y: pos.y,
        name: opts.name,
        move: BaseClass.Abstract,
        resize: BaseClass.Abstract,
        intersects: function (other) {
            return intersectMap[other.name].call(this, other);
        },
        draw: BaseClass.Stub
    });
};

},{"./point.js":23,"baseclassjs":2}],28:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Collidable = require('./collidable.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Rectangle = require('./rectangle.js');

/**
 * ##### Sprite
 * @param {Array|AnimationStrip} opts.strips
 * @param {String} opts.startingStrip
 * @param {Point} [opts.pos] Defaults to (0,0).
 * @param {Number} [opts.scale] Defaults to 1.
 * @param {Dimension} [opts.size] Defaults to strip size.
 * @param {Number} [opts.depth] Defaults to 0.
 * @param {Number} [opts.rotation] Defaults to 0.
 * @param {Point} [opts.speed] Defaults to (0,0).
 * @param {Boolean} [opts.freemask] Defaults to false. True
 * to decouple the position of the mask from the position
 * of the sprite.
 *
 * ##### Collidable
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var loaded = false,
        stripMap = opts.strips || {},
        pos = opts.pos || Point();

    opts.mask = opts.mask || Rectangle();
    opts.offset = Point(
        opts.mask.x,
        opts.mask.y
    );
    opts.mask.x = pos.x + opts.offset.x;
    opts.mask.y = pos.y + opts.offset.y;

    return Collidable(opts).extend({
        ready: function () {
            return this.strip.ready();
        },
        strip: stripMap[opts.startingStrip],
        useStrip: function (name) {
            // Do nothing if already using this strip.
            if (this.strip !== stripMap[name]) {
                this.strip.stop();
                this.strip = stripMap[name];
                this.strip.start();
            }
        },
        getStrip: function (name) {
            return stripMap[name];
        },
        pos: pos,
        scale: opts.scale || 1,
        size: opts.size || stripMap[opts.startingStrip].size,
        trueSize: function () {
            return this.size.scale(this.scale);
        },
        rotation: opts.rotation || 0,
        depth: opts.depth || 0,
        speed: opts.speed || Point(),
        update: function () {
            this.shift();
            this.strip.update();
            this.base.update();
        },
        draw: function (ctx) {
            var stripSize = this.strip.size;
            this.strip.draw(
                ctx,
                this.pos,
                Dimension(
                    this.scale * this.size.width / stripSize.width,
                    this.scale * this.size.height / stripSize.height
                ),
                this.rotation
            );
        },
        load: function (cb) {
            var name, loadQueue;
            if (!loaded) {
                loadQueue = Object.keys(stripMap).length;
                for (name in stripMap) {
                    stripMap[name].load(function () {
                        loadQueue -= 1;
                        if (loadQueue === 0) {
                            cb();
                            loaded = true;
                        }
                    });
                }
            }
        },
        move: function (x, y) {
            this.pos.x = x;
            this.pos.y = y;
            if (!opts.freemask) {
                this.base.move(this.pos);
            }
        },
        shift: function (vx, vy) {
            this.pos.x += vx || this.speed.x;
            this.pos.y += vy || this.speed.y;
            if (!opts.freemask) {
                this.base.move(this.pos);
            }
        }
    });
};

},{"./collidable.js":10,"./dimension.js":14,"./point.js":23,"./rectangle.js":25,"baseclassjs":2}],29:[function(require,module,exports){
var createImage = require('./image.js'),
    cache = {};

/**
 * Duplicate calls to constructor will only
 * load a single time - returning cached
 * data on subsequent calls.
 * @param {String} opts.src
 * @return {Image} HTML5 Image instance.
 */
module.exports = function (opts) {
    var img,
        src = opts.src;

    if (src in cache) {
        img = cache[src];
    } else {
        img = createImage(src);
        cache[src] = img;
    }

    return img;
};

},{"./image.js":19}],30:[function(require,module,exports){
var Polar = require('./polar.js');

/**
 * @param {Number} [x] Defaults to 0.
 * @param {Number} [y] Defaults to 0.
 */
function Vector(x, y) {
    return {
        x: x || 0,
        y: y || 0,
        get magnitude () {
            return Math.abs(
                Math.sqrt(
                    (this.y * this.y) +
                    (this.x * this.x)
                )
            );
        },
        clone: function () {
            return Vector(
                this.x,
                this.y
            );
        },
        equals: function (other) {
            return (
                this.x === other.x &&
                this.y === other.y
            );
        },
        scale: function (scale) {
            return Vector(
                this.x * scale,
                this.y * scale
            );
        },
        toPolar: function () {
            return Polar(
                Math.atan(this.y / this.x),
                this.magnitude
            );
        }
    };
}

module.exports = Vector;

},{"./polar.js":24}],31:[function(require,module,exports){
var isNode = require('is-node');
var nodeRequire = require;

module.exports = isNode ? nodeRequire('./lib/node') : require('./lib/browser');

},{"./lib/browser":32,"is-node":33}],32:[function(require,module,exports){
module.exports = require('jsonp');

},{"jsonp":34}],33:[function(require,module,exports){
(function (process){
module.exports = !!(typeof process != 'undefined' && process.versions && process.versions.node);

}).call(this,require('_process'))
},{"_process":38}],34:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';
  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;

  // generate a unique id for this request
  var id = prefix + (count++);

  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    script.parentNode.removeChild(script);
    window[id] = noop;
  }

  window[id] = function(data){
    debug('jsonp got', data);
    if (timer) clearTimeout(timer);
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);
}

},{"debug":35}],35:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":36}],36:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":37}],37:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],38:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],39:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler;

module.exports = CollisionHandler({
    name: 'environ',
    gridSize: Dimension(5, 5)
});

},{"dragonjs":12}],40:[function(require,module,exports){
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

},{"./screens/main.js":41,"dragonjs":12,"get-json":31}],41:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    canvas = Dragon.Game.canvas,
    Ground = require('../sprites/ground.js'),
    floor = [],
    i, len;

len = Math.ceil(canvas.width / 81) + 2;
for (i = 0; i < len; i += 1) {
    floor.push(
        Ground(i * 81)
    );
}

module.exports = Screen({
    name: 'main',
    collisionSets: require('../collisions/main.js'),
    spriteSet: [
        require('../sprites/sky.js'),
        require('../sprites/runner.js'),
        require('../sprites/hills-near.js'),
        require('../sprites/hills-far.js'),
        require('../sprites/sun.js')
    ].concat(floor),
    one: {
        ready: function () {
            this.start();
        }
    }
}).extend({
    floorSet: floor
});

},{"../collisions/main.js":39,"../sprites/ground.js":42,"../sprites/hills-far.js":43,"../sprites/hills-near.js":44,"../sprites/runner.js":45,"../sprites/sky.js":46,"../sprites/sun.js":47,"dragonjs":12}],42:[function(require,module,exports){
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

},{"../collisions/main.js":39,"./runner.js":45,"dragonjs":12}],43:[function(require,module,exports){
var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'hills-far',
    strips: {
        hills: AnimationStrip({
            sheet: SpriteSheet({
                src: 'parallaxHill2.png'
            }),
            size: Dimension(282, 59)
        })
    },
    startingStrip: 'hills',
    scale: 5,
    pos: Point(100, canvas.height - 300),
    depth: 9
}).extend({
    update: function () {
        if (runner.direction > 0) {
            if (this.pos.x < -this.trueSize().width) {
                this.pos.x = canvas.width;
            }
            this.speed.x = -1;
        } else {
            if (this.pos.x > canvas.width) {
                this.pos.x = -this.trueSize().width;
            }
            this.speed.x = 1;
        }
        this.base.update();
    }
});

},{"./runner.js":45,"dragonjs":12}],44:[function(require,module,exports){
var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'hills-near',
    strips: {
        hills: AnimationStrip({
            sheet: SpriteSheet({
                src: 'parallaxHill1.png'
            }),
            size: Dimension(282, 59)
        })
    },
    startingStrip: 'hills',
    scale: 1.6,
    pos: Point(50, canvas.height - 170),
    depth: 8
}).extend({
    update: function () {
        if (runner.direction > 0) {
            if (this.pos.x < -this.trueSize().width) {
                this.pos.x = canvas.width;
            }
            this.speed.x = -3;
        } else {
            if (this.pos.x > canvas.width) {
                this.pos.x = -this.trueSize().width;
            }
            this.speed.x = 3;
        }
        this.base.update();
    }
});

},{"./runner.js":45,"dragonjs":12}],45:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Mouse = Dragon.Mouse,
    KeyDown = Dragon.Keyboard,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Polar = Dragon.Polar,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(64, 60)
    ),
    strips: {
        'walk-right': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(1, 11),
            size: Dimension(64, 64),
            frames: 8,
            speed: 10
        }),
        'walk-left': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(1, 9),
            size: Dimension(64, 64),
            frames: 8,
            speed: 10
        }),
        'jump': AnimationStrip({
            sheet: SpriteSheet({
                src: 'orc-walk.png'
            }),
            start: Point(3, 2),
            size: Dimension(64, 64),
            frames: 3,
            sinusoid: true,
            speed: 10
        })
    },
    startingStrip: 'walk-right',
    pos: Point(100, 100),
    depth: 2,
    on: {
        'colliding/ground': function (other) {
            this.pos.y = other.pos.y - this.mask.height;
            this.speed.y = 0;
            this.speed.x = 0.7 * this.direction;
            this.base.update();
            if (this.direction > 0) {
                this.useStrip('walk-right');
            } else {
                this.useStrip('walk-left');
            }
        },
        'colliding/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            this.speed.y = 0;
            this.useStrip('jump');
            this.strip.speed = 20;
        },
        'colliding/screentap': function () {
            this.speed.y = -30;
            this.useStrip('jump');
            this.strip.speed = 10;
        },
        'collide/screenedge/left': function () {
            this.direction = 1;
        },
        'collide/screenedge/right': function () {
            this.direction = -1;
        }
    }
}).extend({
    update: function () {
        this.speed.y += 3;
        this.speed.x = 0;
        this.base.update();
    },
    direction: 1
});

},{"../collisions/main.js":39,"dragonjs":12}],46:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'sky',
    strips: {
        sky: AnimationStrip({
            sheet: SpriteSheet({
                src: 'sky.png'
            }),
            size: Dimension(5, 400)
        })
    },
    startingStrip: 'sky',
    size: Game.canvas,
    depth: 20
});

},{"../collisions/main.js":39,"dragonjs":12}],47:[function(require,module,exports){
var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    runner = require('./runner.js');

module.exports = Sprite({
    name: 'sun',
    strips: {
        sun: AnimationStrip({
            sheet: SpriteSheet({
                src: 'sun.png'
            }),
            size: Dimension(248, 248)
        })
    },
    startingStrip: 'sun',
    scale: 0.5,
    pos: Point(170, 50),
    depth: 10
}).extend({
    update: function () {
        if (runner.direction > 0) {
            this.speed.x = -0.2;
        } else {
            this.speed.x = 0.2;
        }
        this.base.update();
    }
});

},{"./runner.js":45,"dragonjs":12}]},{},[40]);

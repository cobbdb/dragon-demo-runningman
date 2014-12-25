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
        ready: function () {
            return opts.sheet.ready;
        },
        size: size,
        frame: 0,
        load: function (cb) {
            opts.sheet.load(cb);
        },
        start: function () {
            timeLastFrame = Date.now();
            if (timeBetweenFrames) {
                updating = true;
            }
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

},{"./dimension.js":12,"./point.js":20}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
                var len, vect,
                    pt = Point(this.x, this.y);

                if (this.x > rect.right) pt.x = rect.right;
                else if (this.x < rect.x) pt.x = rect.x;
                if (this.y > rect.bottom) pt.y = rect.bottom;
                else if (this.y < rect.y) pt.y = rect.y;

                vect = Vector({
                    start: pt,
                    end: this
                });
                return vect.size < this.radius;
            },
            circle: function (circ) {
                var vect = Vector({
                    start: this,
                    end: circ
                });
                return vect.size < this.radius + circ.radius;
            }
        }
    }).extend({
        radius: rad,
        draw: function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });
};

},{"./dimension.js":12,"./point.js":20,"./shape.js":24,"./vector.js":27}],9:[function(require,module,exports){
var Counter = require('./id-counter.js'),
    EventHandler = require('./event-handler.js'),
    BaseClass = require('baseclassjs'),
    Rectangle = require('./rectangle.js');

/**
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var instanceId = Counter.nextId,
        activeCollisions = {},
        collisionSets = [];

    if (opts.collisionSets) {
        collisionSets = collisionSets.concat(opts.collisionSets);
    }

    return BaseClass({
        id: instanceId,
        name: opts.name,
        mask: opts.mask || Rectangle(),
        move: function (x, y) {
            this.mask.move(x, y);
        },
        intersects: function (mask) {
            return this.mask.intersects(mask);
        },
        update: function () {
            var that = this;
            collisionSets.forEach(function (handler) {
                handler.update(that);
            });
        },
        teardown: BaseClass.Stub,
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

},{"./event-handler.js":13,"./id-counter.js":16,"./rectangle.js":22,"baseclassjs":2}],10:[function(require,module,exports){
var Rectangle = require('./rectangle.js'),
    Point = require('./point.js'),
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

    for (i = 0; i < gridSize.width; i += 1) {
        for (j = 0; j < gridSize.height; j += 1) {
            collisionGrid.push(
                Rectangle(
                    Point(
                        i / gridSize.width * opts.canvasSize.width,
                        j / gridSize.height * opts.canvasSize.height
                    ),
                    Dimension(
                        opts.canvasSize.width / gridSize.width,
                        opts.canvasSize.height / gridSize.height
                    )
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
        draw: function (ctx) {
            collisionGrid.forEach(function (partition) {
                partition.draw(ctx);
            });
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

},{"./dimension.js":12,"./point.js":20,"./rectangle.js":22}],11:[function(require,module,exports){
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

},{"./animation-strip.js":6,"./circle.js":8,"./collidable.js":9,"./collision-handler.js":10,"./dimension.js":12,"./event-handler.js":13,"./frame-counter.js":14,"./game.js":15,"./id-counter.js":16,"./keyboard.js":18,"./mouse.js":19,"./point.js":20,"./polar.js":21,"./rectangle.js":22,"./screen.js":23,"./shape.js":24,"./sprite.js":25,"./spritesheet.js":26,"./vector.js":27}],12:[function(require,module,exports){
module.exports = function (w, h) {
    return {
        width: w || 0,
        height: h || 0
    };
};

},{}],13:[function(require,module,exports){
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

},{"baseclassjs":2}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Circle = require('./circle.js'),
    Collidable = require('./collidable.js'),
    FrameCounter = require('./frame-counter.js'),
    Mouse = require('./mouse.js'),
    canvas = require('./canvas.js'),
    ctx = canvas.ctx,
    Counter = require('./id-counter.js');

var debug = false,
    heartbeat = false,
    throttle = 30,
    screens = [],
    screenMap = {},
    screensToAdd = [],
    screenRemoved = false,
    tapCollisionSet = CollisionHandler({
        name: 'screentap',
        gridSize: Dimension(4, 4),
        canvasSize: canvas
    }),
    loadQueue = {};

Mouse.on.down(function () {
    tapCollisionSet.update(Collidable({
        name: 'screentap',
        mask: Circle(Mouse.offset, 15)
    }));
});

module.exports = {
    canvas: canvas,
    screenTap: tapCollisionSet,
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
    /**
     * Apply new data to the game.
     */
    update: function () {
        if (Mouse.is.dragging) {
            tapCollisionSet.update(Collidable({
                name: 'screendrag',
                mask: Circle(Mouse.offset, 15)
            }));
        } else if (Mouse.is.holding) {
            tapCollisionSet.update(Collidable({
                name: 'screenhold',
                mask: Circle(Mouse.offset, 15)
            }));
        }

        // Update the screen.
        screens.forEach(function (screen) {
            screen.update();
        });

        // Settle screen tap events.
        tapCollisionSet.handleCollisions();

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
            if (Mouse.is.down) {
                tapCollisionSet.draw(ctx);
            }
        }
    },
    /**
     * Cleanup before the next frame.
     */
    teardown: function () {
        tapCollisionSet.teardown();
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

},{"./canvas.js":7,"./circle.js":8,"./collidable.js":9,"./collision-handler.js":10,"./dimension.js":12,"./frame-counter.js":14,"./id-counter.js":16,"./mouse.js":19,"./point.js":20}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

canvas.addEventListener(
    startEventName,
    function (event) {
        isDown = true;
        current.x = event.offsetX;
        current.y = event.offsetY;
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
        last.x = current.x;
        last.y = current.y;
        current.x = event.offsetX;
        current.y = event.offsetY;

        if (isDown) {
            shift.start = current;
            shift.end = last;
            // Drag threshold.
            if (shift.size > 1) {
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
},{"./canvas.js":7,"./point.js":20,"./vector.js":27}],20:[function(require,module,exports){
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
};

module.exports = Point;

},{}],21:[function(require,module,exports){
var Vector = require('./vector.js');

module.exports = function (theta, mag) {
    return {
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
    };
};

},{"./vector.js":27}],22:[function(require,module,exports){
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

                vect = Vector({
                    start: pt,
                    end: circ
                });
                return vect.size < circ.radius;
            }
        }
    }).extend({
        width: size.width || 0,
        height: size.height || 0,
        right: pos.x + size.width || 0,
        bottom: pos.y + size.height || 0,
        move: function (x, y) {
            this.base.move(x, y);
            this.right = x + this.width;
            this.bottom = y + this.height;
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

},{"./dimension.js":12,"./point.js":20,"./shape.js":24,"./vector.js":27}],23:[function(require,module,exports){
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
            var id, onload;
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

},{"./event-handler.js":13,"./id-counter.js":16,"baseclassjs":2}],24:[function(require,module,exports){
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
        move: function (x, y) {
            this.x = x;
            this.y = y;
        },
        intersects: function (other) {
            return intersectMap[other.name].call(this, other);
        },
        draw: BaseClass.Stub
    });
};

},{"./point.js":20,"baseclassjs":2}],25:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Collidable = require('./collidable.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js');

/**
 * ##### Sprite
 * @param {AnimationStrip} opts.strip
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
    var size = opts.size || opts.strip.size,
        stripSize = opts.strip.size,
        loaded = false;

    return Collidable(opts).extend({
        ready: function () {
            return opts.strip.ready();
        },
        strip: opts.strip,
        pos: opts.pos || Point(),
        scale: opts.scale || 1,
        size: size,
        rotation: opts.rotation || 0,
        depth: opts.depth || 0,
        speed: opts.speed || Point(),
        update: function () {
            this.shift();
            this.strip.update();
            this.base.update();
        },
        draw: function (ctx) {
            opts.strip.draw(
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
            if (!loaded) {
                opts.strip.load(cb);
                loaded = true;
            }
        },
        move: function (x, y) {
            this.pos.x = x;
            this.pos.y = y;
            if (!opts.freemask) {
                this.base.move(x, y);
            }
        },
        shift: function (vx, vy) {
            this.pos.x += vx || this.speed.x;
            this.pos.y += vy || this.speed.y;
            if (!opts.freemask) {
                this.base.move(this.pos.x, this.pos.y);
            }
        }
    });
};

},{"./collidable.js":9,"./dimension.js":12,"./point.js":20,"baseclassjs":2}],26:[function(require,module,exports){
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

},{"./image.js":17}],27:[function(require,module,exports){
var Point = require('./point.js');

/**
 * @param {Point} [opts.start] Defaults to (0,0).
 * @param {Dimension|Point} [opts.size|opts.end] Defaults
 * to (0,0). Either size of vector or the ending point.
 */
module.exports = function (opts) {
    var start, end;

    opts = opts || {};
    start = opts.start || Point();
    end = opts.end || Point();

    if (opts.size) {
        end.x = start.x + opts.size.width;
        end.y = start.y + opts.size.height;
    }

    return {
        start: start,
        end: end,
        get size () {
            var rise = this.end.x - this.start.x,
                run = this.end.y - this.start.y;
            return Math.sqrt((rise * rise) + (run * run));
        }
    };
};

},{"./point.js":20}],28:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler,
    Game = Dragon.Game;

module.exports = CollisionHandler({
    name: 'environ',
    gridSize: Dimension(5, 5),
    canvasSize: Game.canvas
});

},{"dragonjs":11}],29:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    mainScreen = require('./screens/main.js');

Game.addScreens(mainScreen);
Game.run({
    debug: false
});

},{"./screens/main.js":30,"dragonjs":11}],30:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Game = Dragon.Game,
    canvas = Game.canvas,
    Point = Dragon.Point,
    sky = require('../sprites/sky.js'),
    runner = require('../sprites/runner.js'),
    Ground = require('../sprites/ground.js'),
    collisions = require('../collisions/main.js');

module.exports = Screen({
    name: 'main',
    collisionSets: collisions,
    spriteSet: [
        sky,
        runner,
        Ground({
            start: Point(0, canvas.height - 79)
        }),
        Ground({
            start: Point(81, canvas.height - 79)
        })
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
});

},{"../collisions/main.js":28,"../sprites/ground.js":31,"../sprites/runner.js":32,"../sprites/sky.js":33,"dragonjs":11}],31:[function(require,module,exports){
var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    collisions = require('../collisions/main.js');

/**
 * @param {Point} [opts.start] Start position of this tile.
 */
module.exports = function (opts) {
    var start;
    opts = opts || {};
    start = opts.start || Point();

    return Sprite({
        name: 'ground',
        collisionSets: collisions,
        mask: Rect(
            start,
            Dimension(81, 40)
        ),
        strip: AnimationStrip({
            sheet: SpriteSheet({
                src: 'ground.png'
            }),
            size: Dimension(81, 79)
        }),
        pos: start,
        depth: 8,
        freemask: true
    });
};

},{"../collisions/main.js":28,"dragonjs":11}],32:[function(require,module,exports){
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
    collisions = require('../collisions/main.js');

module.exports = Sprite({
    name: 'runner',
    collisionSets: [
        collisions,
        Game.screenTap
    ],
    mask: Rect(
        Point(100, 104),
        Dimension(64, 60)
    ),
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'orc-walk.png'
        }),
        start: Point(0, 704),
        size: Dimension(64, 64),
        frames: 9,
        speed: 8
    }),
    pos: Point(100, 100),
    depth: 2,
    on: {
        'colliding/ground': function (other) {
            this.speed.y = 0;
            this.pos.y = other.pos.y - this.mask.height;
        },
        'collide/screendrag': function () {
            var pos = Mouse.offset.clone();
            pos.x -= this.size.width / 2;
            pos.y -= this.size.height / 2;
            this.move(pos.x, pos.y);
            this.speed.y = 0;
        },
        'collide/screentap': function () {
            this.speed.y = -50;
        }
    }
}).extend({
    update: function () {
        if (KeyDown.name(' ')) {
            blah = 'blah';
        }
        this.speed.y += 3;
        this.base.update();
    }
});

},{"../collisions/main.js":28,"dragonjs":11}],33:[function(require,module,exports){
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
    strip: AnimationStrip({
        sheet: SpriteSheet({
            src: 'sky.png'
        }),
        start: Point(),
        size: Dimension(5, 400),
        frames: 1
    }),
    size: Game.canvas,
    depth: 10
});

},{"../collisions/main.js":28,"dragonjs":11}]},{},[29]);

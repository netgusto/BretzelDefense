'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.loadspritesheet = loadspritesheet;
exports.cursorkeys = cursorkeys;
exports.gameloop = gameloop;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* @flow */

var _pixiJs = require('pixi.js');

// $FlowFixMe

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

var GameSet = (function () {
    function GameSet(node, width, height, canvas) {
        _classCallCheck(this, GameSet);

        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.renderer = (0, _pixiJs.autoDetectRenderer)(width, height);
        this.entities = new Array();
        this.systems = new Array();
        node.appendChild(this.renderer.view);
    }

    _createClass(GameSet, [{
        key: 'addEntity',
        value: function addEntity(entity) {
            var _this = this;

            this.entities.push(entity);
            this.canvas.addChild(entity.getDisplayObject());
            entity.remove = function () {
                entity.getDisplayObject().parent.removeChild(entity.getDisplayObject());
                var index = _this.entities.indexOf(entity);
                if (index === -1) return;
                _this.entities.splice(index, 1);
            };

            return this;
        }
    }, {
        key: 'getEntities',
        value: function getEntities() {
            return this.entities;
        }
    }, {
        key: 'addSystem',
        value: function addSystem(system) {
            this.systems.push(system);
            return this;
        }
    }, {
        key: 'requires',
        value: function requires() {
            for (var _len = arguments.length, entities = Array(_len), _key = 0; _key < _len; _key++) {
                entities[_key] = arguments[_key];
            }

            entities.map(function (entity) {
                return entity.loadAssets && entity.loadAssets(_pixiJs.loader);
            });

            //loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
            //loader.add('background', '/assets/sprites/level_pagras-v2.png');
            //loader.add('flag', '/assets/sprites/flag.png');

            return this;
        }
    }, {
        key: 'load',
        value: function load() {

            var p = new Promise(function (resolve, reject) {
                _pixiJs.loader.load();
                _pixiJs.loader.once('complete', function (loader, resources) {
                    console.log('ioci');
                    resolve({ loader: loader, resources: resources });
                });
            });

            return p;
        }
    }, {
        key: 'run',
        value: function run(cbk) {

            var self = this;

            animate();
            function animate() {
                cbk(self);
                self.renderer.render(self.canvas);
                window.requestAnimationFrame(animate);
            }
        }
    }]);

    return GameSet;
})();

exports.GameSet = GameSet;
;

function loadspritesheet(basetexture, width, height, nbframes) {
    if (!basetexture.hasLoaded) {
        throw new Error('BaseTexture not loaded in loadspritesheet');
    }
    var frames = [];

    var realWidth = basetexture.realWidth;
    var realHeight = basetexture.realHeight;

    var maxX = Math.floor(realWidth / width);
    var maxY = Math.floor(realHeight / height);

    if (!nbframes) nbframes = maxX * maxY;

    var counter = 0;

    for (var y = 0; y < maxY; y++) {
        for (var x = 0; x < maxX; x++) {
            if (counter >= nbframes) break;
            frames.push(new _pixiJs.Texture(basetexture, new _pixiJs.Rectangle(x * width, y * height, width, height)));
            counter++;
        }
    }

    return frames;
}

var cursors = {
    up: false,
    down: false,
    left: false,
    right: false,
    shift: false,
    alt: false,
    ctrl: false
};

_keyboardjs2['default'].bind('left', function () {
    return cursors.left = true;
}, function () {
    return cursors.left = false;
});
_keyboardjs2['default'].bind('right', function () {
    return cursors.right = true;
}, function () {
    return cursors.right = false;
});
_keyboardjs2['default'].bind('up', function () {
    return cursors.up = true;
}, function () {
    return cursors.up = false;
});
_keyboardjs2['default'].bind('down', function () {
    return cursors.down = true;
}, function () {
    return cursors.down = false;
});
_keyboardjs2['default'].bind('shift', function () {
    return cursors.shift = true;
}, function () {
    return cursors.shift = false;
});
_keyboardjs2['default'].bind('alt', function () {
    return cursors.alt = true;
}, function () {
    return cursors.alt = false;
});
_keyboardjs2['default'].bind('ctrl', function () {
    return cursors.ctrl = true;
}, function () {
    return cursors.ctrl = false;
});

function cursorkeys() {
    return cursors;
}

function gameloop() {
    var then = performance.now();
    var start = undefined;
    var costtime = undefined;

    // Systems

    return function (game) {
        var start = performance.now();
        var deltatime = start - then;

        game.systems.map(function (system) {
            system.process(system.match ? game.entities.filter(system.match) : game.entities, { deltatime: deltatime, costtime: costtime });
        });

        then = start;
        costtime = performance.now() - start;
    };
}

;

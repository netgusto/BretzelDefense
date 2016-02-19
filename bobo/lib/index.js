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
    function GameSet(node, width, height) {
        _classCallCheck(this, GameSet);

        this.width = width;
        this.height = height;
        this.renderer = (0, _pixiJs.autoDetectRenderer)(width, height);
        node.appendChild(this.renderer.view);
    }

    _createClass(GameSet, [{
        key: 'run',
        value: function run(stage, cbk) {

            var g = this;

            animate();
            function animate() {
                cbk(g);
                g.renderer.render(stage);
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

function gameloop(_ref) {
    var systems = _ref.systems;
    var entities = _ref.entities;

    var then = performance.now();
    var start = undefined;
    var costtime = undefined;

    return function (g) {
        var start = performance.now();
        var deltatime = start - then;

        systems.map(function (system) {
            system.process(system.match ? entities.filter(system.match) : entities, { deltatime: deltatime, costtime: costtime });
        });

        then = start;
        costtime = performance.now() - start;
    };
}

;

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GameStage = exports.GameLayer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// $FlowFixMe


exports.loadspritesheet = loadspritesheet;
exports.cursorkeys = cursorkeys;
exports.gameloop = gameloop;

var _pixi = require('pixi.js');

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameLayer = exports.GameLayer = function () {
    function GameLayer(stage) {
        _classCallCheck(this, GameLayer);

        this.stage = stage;
        this.container = new _pixi.Container();
        this.entities = new Array();
    }

    _createClass(GameLayer, [{
        key: 'addEntity',
        value: function addEntity(entity) {
            var _this = this;

            this.entities.push(entity);
            this.stage.entities.push(entity);
            this.stage.entitybyid[entity.id] = entity;
            this.container.addChild(entity.displayobject);
            entity.remove = function () {
                var index = void 0;
                entity.displayobject.parent.removeChild(entity.displayobject);

                index = _this.entities.indexOf(entity);
                if (index !== -1) {
                    _this.entities.splice(index, 1);
                }

                index = _this.stage.entities.indexOf(entity);
                if (index === -1) return;
                _this.stage.entities.splice(index, 1);
                delete _this.stage.entitybyid[entity.id];
            };

            return this;
        }
    }, {
        key: 'addChild',
        value: function addChild(displayobject) {
            this.container.addChild(displayobject);
        }
    }, {
        key: 'getContainer',
        value: function getContainer() {
            return this.container;
        }
    }, {
        key: 'sort',
        value: function sort(cbk) {
            this.container.children.sort(cbk);
        }
    }]);

    return GameLayer;
}();

;

var GameStage = exports.GameStage = function () {
    function GameStage(container) {
        _classCallCheck(this, GameStage);

        this.container = container;
        this.entities = new Array();
        this.entitybyid = {};
        this.systems = new Array();
        this.layers = new Array();
    }

    _createClass(GameStage, [{
        key: 'addLayer',
        value: function addLayer(layer) {
            this.layers.push(layer);
            this.container.addChild(layer.getContainer());
            return this;
        }
    }, {
        key: 'getEntities',
        value: function getEntities() {
            return this.entities;
        }
    }, {
        key: 'getEntity',
        value: function getEntity(id) {
            return this.entitybyid[id];
        }
    }, {
        key: 'addSystem',
        value: function addSystem(system) {
            this.systems.push(system);
            return this;
        }
    }, {
        key: 'require',
        value: function require() {
            for (var _len = arguments.length, entities = Array(_len), _key = 0; _key < _len; _key++) {
                entities[_key] = arguments[_key];
            }

            entities.map(function (entity) {
                return entity.loadAssets && entity.loadAssets(_pixi.loader);
            });
            return this;
        }
    }, {
        key: 'load',
        value: function load(_ref) {
            var _ref$onbegin = _ref.onbegin;
            var onbegin = _ref$onbegin === undefined ? null : _ref$onbegin;
            var _ref$onprogress = _ref.onprogress;
            var onprogress = _ref$onprogress === undefined ? null : _ref$onprogress;
            var _ref$oncomplete = _ref.oncomplete;
            var oncomplete = _ref$oncomplete === undefined ? null : _ref$oncomplete;


            if (onbegin !== null) onbegin();
            var p = new Promise(function (resolve, reject) {
                _pixi.loader.load();
                if (onbegin !== null) onprogress();
                _pixi.loader.once('complete', function (loader, resources) {
                    oncomplete();
                    resolve({ loader: loader, resources: resources });
                });
            });

            return p;
        }
    }, {
        key: 'run',
        value: function run(renderer, cbk) {
            var self = this;

            function animate() {
                cbk(self);
                renderer.render(self.container);
                window.requestAnimationFrame(animate);
            }

            animate();
            return this;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.entities.map(function (entity) {
                return entity.remove();
            });
            delete this.entitybyid;

            for (var i = this.systems.length - 1; i >= 0; i--) {
                delete this.systems[i];
            }

            for (var _i = this.layers.length - 1; _i >= 0; _i--) {
                delete this.layers[_i];
            }

            delete this;
        }
    }]);

    return GameStage;
}();

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
            frames.push(new _pixi.Texture(basetexture, new _pixi.Rectangle(x * width, y * height, width, height)));
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

_keyboardjs2.default.bind('left', function () {
    return cursors.left = true;
}, function () {
    return cursors.left = false;
});
_keyboardjs2.default.bind('right', function () {
    return cursors.right = true;
}, function () {
    return cursors.right = false;
});
_keyboardjs2.default.bind('up', function () {
    return cursors.up = true;
}, function () {
    return cursors.up = false;
});
_keyboardjs2.default.bind('down', function () {
    return cursors.down = true;
}, function () {
    return cursors.down = false;
});
_keyboardjs2.default.bind('shift', function () {
    return cursors.shift = true;
}, function () {
    return cursors.shift = false;
});
_keyboardjs2.default.bind('alt', function () {
    return cursors.alt = true;
}, function () {
    return cursors.alt = false;
});
_keyboardjs2.default.bind('ctrl', function () {
    return cursors.ctrl = true;
}, function () {
    return cursors.ctrl = false;
});

function cursorkeys() {
    return cursors;
}

function gameloop() {
    var then = performance.now();
    var start = void 0;
    var costtime = void 0;

    // Systems

    return function (stage) {
        var start = performance.now();
        var deltatime = start - then;

        stage.systems.map(function (system) {
            system.process(system.match ? stage.entities.filter(system.match) : stage.entities, { deltatime: deltatime, costtime: costtime, game: stage });
        });

        then = start;
        costtime = performance.now() - start;
    };
};

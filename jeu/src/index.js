'use strict';

import 'babel-polyfill';
import 'perfnow';

import { Container, autoDetectRenderer } from 'pixi.js';

import { gameloop } from './Utils/bobo';
import resolutionFinder from './Utils/resolution';
import Stage from './Stage/TitleScreen';

import world from './Singleton/world';
import eventbus from './Singleton/eventbus';

(function(mountnode, resolution) {

    window.onfocus = function() {
        eventbus.emit('game.focus');
    };

    window.onblur = function() {
        eventbus.emit('game.blur');
    };

    world
    .set('debug', true)
    .set('timescale', 1)
    .set('scale', resolution.worldscale)
    .set('resolution', resolution);

    var dpr = window.devicePixelRatio || 1;

    const renderer = autoDetectRenderer(resolution.width, resolution.height, { resolution: dpr });
    mountnode.appendChild(renderer.view);

    const canvas = new Container(0xFF0000 /* white */, true /* interactive */);
    let previousstage = null;

    const swapstage = function(newstage) {
        window.setImmediate(function() {    // allow pixi mouse events triggering swapstage to complete before tearing the stage down
            if(previousstage) previousstage.destroy();
            newstage({ world, canvas, swapstage, renderer })
                .then(stage => stage.run(renderer, gameloop({ world })))
                .then(stage => previousstage = stage);
        });
    };

    swapstage(Stage);

})(document.getElementById('app'), resolutionFinder());

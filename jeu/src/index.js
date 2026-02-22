'use strict';

// Polyfills (imports with side effect)
import 'perfnow';

const globalscope = typeof globalThis !== 'undefined' ? globalThis : window;
if(!('Uint8Array' in globalscope)) globalscope.Uint8Array = Array;
if(!('Uint16Array' in globalscope)) globalscope.Uint16Array = Array;

import { Container, autoDetectRenderer } from 'pixi.js';

import { gameloop } from './Utils/bobo';
import resolutionFinder from './Utils/resolution';
import Stage from './Stage/TitleScreen';

import world from './Singleton/world';
import EVENTS from './Singleton/events';
import eventbus from './Singleton/eventbus';
import timers from './Singleton/timers';

(function(mountnode, resolution) {

    window.onfocus = function() {
        eventbus.emit(EVENTS.GAME_FOCUS);
    };

    window.onblur = function() {
        eventbus.emit(EVENTS.GAME_BLUR);
    };

    world
    .set('debug', true)
    .set('timescale', 5)
    .set('scale', resolution.worldscale)
    .set('resolution', resolution);

    var dpr = window.devicePixelRatio || 1;
    if(dpr < 1) dpr = 1; // browser unzoomed
    console.log('Screen: ' + resolution.screenwidth + 'x' + resolution.screenheight + '; Res: ' + resolution.width + 'x' + resolution.height + '@' + dpr + 'X; ', resolution);

    const renderer = autoDetectRenderer(resolution.effectivewidth, resolution.effectiveheight, { resolution: dpr });
    renderer.view.style.width = resolution.effectivewidth + 'px';
    renderer.view.style.height = resolution.effectiveheight + 'px';
    mountnode.appendChild(renderer.view);

    let previousstage = null;

    const swapstage = function(newstage) {
        window.setTimeout(function() {    // allow pixi mouse events triggering swapstage to complete before tearing the stage down
            const canvas = new Container(0xFF0000, true);   // true: interactive

            timers.removeAll();
            eventbus.removeAll();
            if(previousstage) previousstage.destroy();
            newstage({ world, canvas, swapstage, renderer })
                .then(stage => stage.run(renderer, gameloop({ world })))
                .then(stage => previousstage = stage);
        }, 0);
    };

    swapstage(Stage);

})(document.getElementById('app'), resolutionFinder());

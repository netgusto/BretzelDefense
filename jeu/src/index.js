'use strict';

import 'babel-polyfill';
import 'perfnow';

import { Container, autoDetectRenderer } from 'pixi.js';
import { gameloop } from 'bobo';

import resolutionFinder from './Utils/resolution';
import Stage from './Stage/TitleScreen';

const debug = true;

(function(mountnode: HTMLElement, resolution) {

    const renderer = autoDetectRenderer(resolution.width, resolution.height);
    mountnode.appendChild(renderer.view);

    const canvas = new Container(0xFF0000 /* white */, true /* interactive */);
    let previousstage = null;

    const swapstage = function(newstage) {
        window.setImmediate(function() {    // allow pixi mouse events triggering swapstage to complete before tearing the stage down
            if(previousstage) previousstage.destroy();
            newstage({ resolution, canvas, debug, swapstage, renderer })
                .then(stage => stage.run(renderer, gameloop()))
                .then(stage => previousstage = stage);
        });
    };

    swapstage(Stage);

})(document.getElementById('app'), resolutionFinder());

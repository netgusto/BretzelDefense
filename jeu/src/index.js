'use strict';

import 'babel-polyfill';
import 'perfnow';

import { Container, autoDetectRenderer } from 'pixi.js';
import { gameloop } from 'bobo';

import resolutionFinder from './Utils/resolution';
import TitleScreen from './Stage/TitleScreen';
//import Stage from './Stage/StageLevel01';

const debug = true;

(function(mountnode: HTMLElement, resolution) {

    const renderer = autoDetectRenderer(resolution.width, resolution.height);
    mountnode.appendChild(renderer.view);

    const canvas = new Container(0xFF0000 /* white */, true /* interactive */);
    TitleScreen({ resolution, canvas, debug }).then(stage => stage.run(renderer, gameloop()));

})(document.getElementById('app'), resolutionFinder());

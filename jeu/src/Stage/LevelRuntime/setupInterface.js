'use strict';

import { Graphics, Text, Sprite } from 'pixi.js';
import screenfull from 'screenfull';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';

export default function({ layers, world, fullscreenButtonTexture, pausebuttonTexture }) {
    const pauseoverlay = new Graphics();
    pauseoverlay.beginFill(0x000000);
    pauseoverlay.alpha = 0.83;
    pauseoverlay.drawRect(0, 0, world.resolution.width, world.resolution.height);
    layers.pause.addChild(pauseoverlay);

    const pausetext = new Text('Pause - Cliquez pour reprendre', { font: '28px Arial', fill: 'white' });
    pausetext.pivot.set(0, 0);
    pausetext.position.set(30, 100);
    layers.pause.addChild(pausetext);

    layers.pause.container.renderable = false;
    layers.pause.container.interactive = false;
    layers.pause.container.click = layers.pause.container.tap = function(e) {
        e.stopPropagation();
        eventbus.emit(EVENTS.GAME_RESUME);
    };

    if(screenfull.enabled) {
        const fullscreenbutton = new Sprite(fullscreenButtonTexture);
        fullscreenbutton.scale.set(world.scale * 0.3);
        fullscreenbutton.pivot.set(fullscreenbutton.width / 2, fullscreenbutton.height / 2);
        fullscreenbutton.position.set(world.resolution.effectivewidth - (180 * world.scale) - fullscreenbutton.width, 10 * world.scale);
        fullscreenbutton.interactive = true;
        layers.interface.addChild(fullscreenbutton);
        fullscreenbutton.click = fullscreenbutton.tap = function(e) {
            e.stopPropagation();
            eventbus.emit(EVENTS.GAME_FULLSCREEN_TOGGLE);
        };
    }

    const pausebutton = new Sprite(pausebuttonTexture);
    pausebutton.scale.set(world.scale * 0.09);
    pausebutton.pivot.set(pausebutton.width / 2, pausebutton.height / 2);
    pausebutton.position.set(world.resolution.effectivewidth - (90 * world.scale) - pausebutton.width, 19 * world.scale);
    pausebutton.interactive = true;
    layers.interface.addChild(pausebutton);
    pausebutton.click = pausebutton.tap = function(e) {
        e.stopPropagation();
        eventbus.emit(EVENTS.GAME_PAUSE_TOGGLE);
    };
}

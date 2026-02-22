'use strict';

import { Container, Graphics, Text } from 'pixi.js';
import screenfull from 'screenfull';

import { GameStage, GameLayer } from '../Utils/bobo';

import StageLevel01 from './Level01';
import GenericEntity from '../Entity/Generic';
import isportrait from '../Utils/isportrait';

export default function({ world, canvas, swapstage, renderer }) {
    const stage = new GameStage(canvas);
    const layer = new GameLayer(stage);
    stage.addLayer(layer);
    let hasstarted = false;

    const titletext = new Text('Bretzel Defense', { font: '56px Arial', fill: 'white' });
    const subtitle = new Text('Click or tap to start', { font: '30px Arial', fill: '#ffd5d5' });
    const orientation = new Text(isportrait() ? 'portrait mode' : 'landscape mode', { font: '22px Arial', fill: '#a5b0c8' });
    titletext.anchor.set(0.5);
    subtitle.anchor.set(0.5);
    orientation.anchor.set(0.5);
    titletext.position.set(0, -48);
    subtitle.position.set(0, 14);
    orientation.position.set(0, 62);

    const g = new Graphics();
    g.lineStyle(2, 0xFF2B2B, 0.85);
    g.beginFill(0x201820, 0.88);
    g.drawRoundedRect(-280, -112, 560, 224, 18);
    g.endFill();

    const container = new Container();
    container.addChild(g);
    container.addChild(titletext);
    container.addChild(subtitle);
    container.addChild(orientation);
    const title = GenericEntity({ displayobject: container });

    title.displayobject.position.set(world.resolution.width / 2, world.resolution.height / 2);
    title.displayobject.interactive = true;
    layer.container.interactive = true;
    const startgame = function() {
        if(hasstarted) {
            return;
        }
        hasstarted = true;

        renderer.view.style.width = world.resolution.effectivewidth + 'px';
        renderer.view.style.height = world.resolution.effectiveheight + 'px';

        if(screenfull.enabled) {
            try {
                const fullscreenrequest = screenfull.request();
                if(fullscreenrequest && fullscreenrequest.catch) {
                    fullscreenrequest.catch(function() {});
                }
            } catch(e) {
            }
        }

        swapstage(StageLevel01);
    };

    title.displayobject.click = title.displayobject.tap = layer.container.click = layer.container.tap = startgame;

    layer.addEntity(title);

    return Promise.resolve(stage)/*.then(function() {
        title.displayobject.click();
    })*/;
}

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

    const text = new Text(isportrait() ? 'portrait' : 'landscape', { font: '30px Arial', fill: 'white' });
    const g = new Graphics();
    g.beginFill(0xFF0000);
    g.drawRect(0, 0, 100, 100);
    const container = new Container();
    container.addChild(text);
    container.addChild(g);
    const title = GenericEntity({ displayobject: container });

    title.displayobject.position.set(300, 300);
    title.displayobject.interactive = true;
    layer.container.interactive = true;
    title.displayobject.click = title.displayobject.tap = layer.container.click = layer.container.tap = function() {

        renderer.view.style.width = world.resolution.effectivewidth + 'px';
        renderer.view.style.height = world.resolution.effectiveheight + 'px';

        if(screenfull.enabled) {
            screenfull.request();
        }

        swapstage(StageLevel01);
    };

    layer.addEntity(title);

    return Promise.resolve(stage)/*.then(function() {
        title.displayobject.click();
    })*/;
}
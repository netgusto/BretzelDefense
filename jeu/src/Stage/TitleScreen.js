'use strict';

import { GameStage, GameLayer } from 'bobo';
import { Text } from 'pixi.js';

import StageLevel01 from './StageLevel01';
import GenericEntity from '../Entity/Generic';

export default function({ resolution, canvas/*, debug */, swapstage }) {
    const stage = new GameStage(canvas);
    const layer = new GameLayer(stage);
    stage.addLayer(layer);

    const text = new Text('Sucrée défense', { font: '30px Arial', fill: 'white' });
    const title = GenericEntity({ displayobject: text });

    title.displayobject.position.set(resolution.width/2 - text.width/2, resolution.height/2 - text.height/2);
    title.displayobject.interactive = true;
    title.displayobject.click = title.displayobject.tap = function() {
        swapstage(StageLevel01);
    };
    layer.addEntity(title);

    return Promise.resolve(stage);
}
'use strict';

import { GameLayer } from '../../Utils/bobo';

export const defaultLayerNames = [
    'background',
    'spots',
    'lifebar',
    'ranges',
    'creeps',
    'projectiles',
    'ingamemenus',
    'interface',
    'pause',
    'debug'
];

export default function({ stage, layerNames = defaultLayerNames }) {
    const layers = {};

    layerNames.map(function(layername) {
        layers[layername] = new GameLayer(stage);
        stage.addLayer(layers[layername]);
    });

    return layers;
}

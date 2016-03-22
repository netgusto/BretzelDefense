'use strict';

/* @flow */

import { Text } from 'pixi.js';

export default function({ layer, cbk }) {

    let count = 0;
    const fps = [];
    const costs = new Array(300);

    const text = new Text('', { font: '30px Arial', fill: 'white' });
    text.position.set(25, 50);
    layer.addChild(text);

    const sum = (a, b) => a + b;

    return {
        process(entities, { deltatime, costtime }) {

            entities.map(entity => {
                if(entity.hasTag('Debugable')) {
                    entity.render();
                }
            });
            fps[count % 10] = Math.floor(1000 / deltatime);
            if(!isNaN(costtime)) costs[count % 300] = parseFloat(costtime);

            if(count % 10 === 0) {
                text.text = Math.round(fps.reduce(sum, 0) / fps.length) + ' fps; ' + parseFloat(costtime).toFixed(3) + ' ms cost/frame; ' + parseFloat(costs.reduce(sum, 0) / costs.length).toFixed(2) + ' ms cost/frame mean';
                if(cbk) {
                    text.text = cbk(text.text, { deltatime, costtime });
                }
            }

            count++;
        }
    };
}

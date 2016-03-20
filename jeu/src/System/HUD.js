'use strict';

/* @flow */

import { Text } from 'pixi.js';

export default function({ layer, state }) {

    const text = new Text('', { font: '30px Arial', fill: 'yellow' });
    text.position.set(25, 100);
    layer.addChild(text);

    return {
        process() {
            text.text = 'Life ' + state.life + '; Coins ' + state.coins;
        }
    };
}

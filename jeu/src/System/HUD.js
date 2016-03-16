'use strict';

/* @flow */

import { Text } from 'pixi.js';

export default class HUDSystem {

    constructor({ layer, state }) {
        this.state = state;

        this.text = new Text('', { font: '30px Arial', fill: 'yellow' });
        this.text.position.set(25, 100);
        layer.addChild(this.text);
    }

    process() {
        this.text.text = 'Life ' + this.state.life + '; Coins ' + this.state.coins;
    }
}

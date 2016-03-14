'use strict';

/* @flow */

import { Text, DisplayObject } from 'pixi.js';

export default class DebugSystem {

    count: number;
    costs: number;
    fps: Array<number>;
    text: Text;

    constructor({ layer, cbk }) {
        this.count = 0;
        this.fps = [];
        this.costs = new Array(300);
        this.cbk = cbk;

        this.text = new Text('', { font: '30px Arial', fill: 'white' });
        this.text.position.set(25, 50);
        layer.addChild(this.text);
    }

    sum(a, b) {
        return a + b;
    }

    process(entities: Array<DisplayObject>, { deltatime, costtime }) {
        this.fps[this.count % 10] = Math.floor(1000 / deltatime);
        if(!isNaN(costtime)) this.costs[this.count % 300] = parseFloat(costtime);

        if(this.count % 10 === 0) {
            this.text.text = Math.round(this.fps.reduce(this.sum, 0) / this.fps.length) + ' fps; ' + parseFloat(costtime).toFixed(3) + ' ms cost/frame; ' + parseFloat(this.costs.reduce(this.sum, 0) / this.costs.length).toFixed(2) + ' ms cost/frame mean';
            if(this.cbk) {
                this.text.text = this.cbk(this.text.text, { deltatime, costtime });
            }
        }

        this.count++;
    }
}

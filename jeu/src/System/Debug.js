'use strict';

/* @flow */

import { Text, Container as PixiContainer } from 'pixi.js';

export default class DebugSystem {

    count: number;
    costs: number;
    fps: Array<number>;
    text: Text;

    constructor({ stage }: { stage: PixiContainer }) {
        this.count = 0;
        this.fps = [];
        this.costs = [];

        this.text = new Text('', { font: '30px Arial', fill: 'white' });
        stage.addChild(this.text);
    }

    sum(a, b) {
        return a + b;
    }

    process(entities: Array<DisplayObject>, { deltatime, costtime }) {
        this.fps[this.count % 10] = Math.floor(1000 / deltatime);
        if(!isNaN(costtime)) this.costs[this.count % 300] = parseFloat(costtime);

        if(this.count % 10 === 0) {
            this.text.text = Math.round(this.fps.reduce(this.sum, 0) / this.fps.length) + ' fps; ' + parseFloat(costtime).toFixed(3) + ' ms cost/frame; ' + parseFloat(this.costs.reduce(this.sum, 0) / this.costs.length).toFixed(2) + ' ms cost/frame mean';
        }

        this.count++;
    }
}

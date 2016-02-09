'use strict';

/* @flow */

import { Text, Container as PixiContainer } from 'pixi.js';

export default class DebugSystem {

    count: number;
    fps: Array<number>;
    text: Text;

    constructor({ stage }: { stage: PixiContainer }) {
        this.count = 0;
        this.fps = [];
        let count = 0;
        const fps = [];

        this.text = new Text('', { font: '50px Arial', fill: 'red' });
        stage.addChild(this.text);
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) {
        this.fps[this.count % 10] = Math.floor(1000 / deltatime);

        if(this.count % 10 === 0) {
            this.text.text = Math.round(this.fps.reduce((a, b) => a + b, 0) / this.fps.length) + ' fps';
        }

        this.count++;
    }
}

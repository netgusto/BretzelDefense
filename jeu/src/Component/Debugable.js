'use strict';

import compose from 'compose-js';

import CustomRenderable from './CustomRenderable';

import { Text } from 'pixi.js';

const Debugable = compose(CustomRenderable, {
    expects: {
        getId: Function,
        getDisplayObject: Function,
        setCustomRenderMethod: Function,
        setTint: Function
    },
    init: function() {

        const displayobject = this.getDisplayObject();

        const text = new Text('', { font: '10px Arial', fill: 'red' });

        text.position.set(0, -25);
        text.text = this.getId();

        displayobject.addChild(text);
        displayobject.interactive = true;
        displayobject.click = () => {
            console.log(this.getId() + '; ' + this.walk.state);
            this.doRun();
        };

        displayobject.mouseover = () => {
            this.prevtint = displayobject.tint;
            this.setTint(0x00FF00);
        }

        displayobject.mouseout = () => this.setTint(this.prevtint);

        this.setCustomRenderMethod(() => {
            //console.log(this.getId());
            text.text = this.getId() + '; ' + this.walk.state;
            if(displayobject.scale.x === -1) {
                text.scale.set(-1, 1);
            } else {
                text.scale.set(1);
            }
        });
    }
});

export default Debugable;

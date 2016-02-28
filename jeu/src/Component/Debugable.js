'use strict';

import compose from 'compose-js';

import CustomRenderable from './CustomRenderable';

import { DisplayObject, Text } from 'pixi.js';

const Debugable = compose(CustomRenderable, {
    expects: {
        getId: Function,
        displayobject: DisplayObject,
        setCustomRenderMethod: Function,
        setTint: Function
    },
    init: function() {

        const text = new Text('', { font: '15px Arial', fill: 'red' });

        text.position.set(0, -25);
        text.text = this.getId();

        this.displayobject.addChild(text);
        this.displayobject.interactive = true;
        this.displayobject.click = () => {
            console.log(this.getId() + '; ' + this.walk.state + ';' + this.getFieldPositionForPixelPosition(this.getPosition().x, this.getPosition().y));
            //this.doRun();
        };

        this.displayobject.mouseover = () => {
            this.prevtint = this.displayobject.tint;
            console.log(this.getId() + '; ' + this.walk.state, this.getFieldPositionForPixelPosition(this.getPosition().x, this.getPosition().y));
            this.setTint(0x00FF00);
        }

        this.displayobject.mouseout = () => this.setTint(this.prevtint);

        this.setCustomRenderMethod(() => {
            //console.log(this.getId());
            text.text = this.getId() + '; ' + this.walk.state;
            if(this.displayobject.scale.x === -1) {
                text.scale.set(-1, 1);
            } else {
                text.scale.set(1);
            }
        });
    }
});

export default Debugable;

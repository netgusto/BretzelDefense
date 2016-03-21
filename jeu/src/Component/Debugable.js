'use strict';

import compose from 'compose-js';

import CustomRenderable from './CustomRenderable';

import { DisplayObject, Text } from 'pixi.js';

const Debugable = compose(CustomRenderable, {
    // expects: {
    //     getId: Function,
    //     displayobject: DisplayObject,
    //     setCustomRenderMethod: Function,
    //     setTint: Function
    // },
    init: function() {

        this.tag('Debugable');

        const text = new Text('', { font: '15px Arial', fill: 'red' });

        text.position.set(0, -25);
        text.text = this.getId() + ';' + this.meleecount;

        this.displayobject.addChild(text);
        this.setCustomRenderMethod(() => {
            //console.log(this.getId());
            text.text = this.getId() + ';' + this.meleecount;
            if(this.displayobject.scale.x === -1) {
                text.scale.set(-1, 1);
            } else {
                text.scale.set(1);
            }
        });
    }
});

export default Debugable;

'use strict';

import compose from 'compose-js';

//import { DisplayObject } from 'pixi.js';

const Displayable = compose({
    // expects: {
    //     displayobject: DisplayObject
    // },
    init: function({ displayobject }) {
        this.tag('Displayable');
        this.displayobject = displayobject;
    },
    methods: {

        setPosition(x: number, y: ?number) : Object {
            this.displayobject.position.set(x, y);
            return this;
        },

        getPosition() : Object {
            return this.displayobject.position;
        },

        setPivot(x: number, y: ?number) : Object {
            this.displayobject.pivot.set(x, y);
            return this;
        },

        setAnchor(x: number, y: ?number) : Object {
            this.displayobject.anchor.set(x, y);
            return this;
        },

        setTint(tint: number) : Object {
            this.displayobject.tint = tint;
            return this;
        },

        getZIndex() {
            return this.getPosition().y;
        }
    }
});

export default Displayable;

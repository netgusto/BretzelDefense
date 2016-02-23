'use strict';

import stampit from 'stampit';

const Displayable = stampit()
    .init(function() {

        this.declareImplements('Displayable');

        if(typeof this.displayobject === 'undefined') {
            throw new Error('Missing prop displayobject');
        }

        this.setDisplayObject(this.displayobject);

    })
    .props({
        displayobject: null
    })
    .methods({

        setDisplayObject(dispobj) : Object {
            this.displayobject = dispobj;
            return this;
        },

        getDisplayObject() : DisplayObject {
            return this.displayobject;
        },

        setScale(x: number, y: ?number) : Object {
            this.getDisplayObject().scale.set(x, y);
            return this;
        },

        setPosition(x: number, y: ?number) : Object {
            this.getDisplayObject().position.set(x, y);
            return this;
        },

        getPosition() : Object {
            return this.getDisplayObject().position;
        },

        setPivot(x: number, y: ?number) : Object {
            this.getDisplayObject().pivot.set(x, y);
            return this;
        },

        setAnchor(x: number, y: ?number) : Object {
            this.getDisplayObject().anchor.set(x, y);
            return this;
        },

        setTint(tint: number) : Object {
            this.getDisplayObject().tint = tint;
            return this;
        }
    });

export default Displayable;

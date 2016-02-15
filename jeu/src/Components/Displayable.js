'use strict';

import stampit from 'stampit';

const Displayable = stampit()
    .init(function() {

        let displayobject : DisplayObject = this.displayobject;

        this.setDisplayObject = (dispobj) : Object => {
            dispobj.gum = this;
            displayobject = dispobj;
            return this;
        };

        this.getDisplayObject = () : DisplayObject => {
            return displayobject;
        };

    })
    .methods({
        setScale(x: number, y: ?number) : Object {
            this.getDisplayObject().scale.set(x, y);
            return this;
        },

        setPosition(x: number, y: ?number) : Object {
            this.getDisplayObject().position.set(x, y);
            return this;
        },

        setPivot(x: number, y: ?number) : Object {
            this.getDisplayObject().pivot.set(x, y);
            return this;
        },

        setAnchor(x: number, y: ?number) : Object {
            this.getDisplayObject().anchor.set(x, y);
            return this;
        }
    });

export default Displayable;

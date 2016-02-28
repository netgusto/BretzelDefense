'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';

import { DisplayObject } from 'pixi.js';

/*
// Décorateur ?
// https://github.com/CocktailJS/traits-decorator

// Plugin babel ?
Trait Displayable {

    use Something;
    use SomethingElse { hello as world };

    need Deps;
    need Deps2;

    init({ prop, prop2 }) {
        // ...
    }

    setPosition() {

    }

    getPosition() {
        
    }

    static loadAssets() {

    }
}
*/

const Displayable = compose({
    expects: {
        displayobject: DisplayObject
    },
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

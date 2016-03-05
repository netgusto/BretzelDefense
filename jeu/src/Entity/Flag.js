'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';
import { DisplayObject } from 'pixi.js';

import GenericEntity from './Generic';

const Flag = compose(GenericEntity, {
    expects: {
        displayobject: DisplayObject
    },
    init: function() {
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
    },
    loadAssets: function(loader) {
        loader.add('flagtexture', '/assets/sprites/flag.png');
        loader.once('complete', (_, resources) => {
            Flag.texture = resources.flagtexture.texture;
        });
    }
});

//console.log(Flag.assetHandlers[0].toString());

export default Flag;

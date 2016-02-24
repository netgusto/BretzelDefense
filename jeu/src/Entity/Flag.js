'use strict';

//import stampit from 'stampit';
import compose from '../compose-js';
import { Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const Flag = compose(GenericEntity, {
        init: function() {
            const sprite = new Sprite(Flag.texture);
            sprite.pivot.set(sprite.width / 2, sprite.height);
            this.setDisplayObject(sprite);
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

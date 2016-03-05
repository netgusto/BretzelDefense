'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { DisplayObject } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';
import CollaborativeDiffusionFieldAgent from '../Component/CollaborativeDiffusionFieldAgent';
import CustomRenderable from '../Component/CustomRenderable';

let Mummy = compose(GenericEntity, CollaborativeDiffusionFieldAgent, Walkable, CustomRenderable).compose({
    expects: {
        displayobject: DisplayObject
    },
    loadAssets(loader) {
        loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        loader.once('complete', (_, resources) => {
            Mummy.texture = resources.mummy.texture.baseTexture;
            //Mummy.texture.scaleMode = SCALE_MODES.NEAREST;
            Mummy.spriteframes = loadspritesheet(Mummy.texture, 37, 45, 18);
        });
    },
    init: function() {

        //console.log(this.displayobject.scale);
        this.displayobject.play();
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea
        this.displayobject.scale.set(1/this.displayobject.width*20);

        this.doStop();
    },
    methods: {
        setLane(lane) {
            this.lane = lane;
            return this;
        }
    }
});

export default Mummy;

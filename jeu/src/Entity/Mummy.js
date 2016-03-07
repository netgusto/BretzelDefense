'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { extras as PixiExtras } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';

let Mummy = compose(GenericEntity).compose({
    // expects: {
    //     displayobject: DisplayObject
    // },
    loadAssets(loader) {
        loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        loader.once('complete', (_, resources) => {
            Mummy.texture = resources.mummy.texture.baseTexture;
            //Mummy.texture.scaleMode = SCALE_MODES.NEAREST;
            Mummy.spriteframes = loadspritesheet(Mummy.texture, 37, 45, 18);
        });
    },
    init: function() {

        this.displayobject = new PixiExtras.MovieClip(Mummy.spriteframes);
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
        }//,
        // render() {

        //     //console.log('laaaa');
        //     const lifebarwidth = 0;
        //     this.lifebar.lineStyle(2, 0x00FF00);
        //     this.lifebar.moveTo(0, 0);
        //     this.lifebar.lineTo(lifebarwidth, 0);

        //     this.lifebar.lineStyle(2, 0xFF0000);
        //     //this.lifebar.lineTo(((this.maxlife - this.life) / this.life)|0 * lifebarwidth, 0);
        //     //this.lifebar.lineTo(((this.maxlife - this.life) / this.life)|0 * lifebarwidth, 0);
        // }
    }
}).compose(Walkable);

export default Mummy;

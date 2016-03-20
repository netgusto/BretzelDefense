'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { extras as PixiExtras } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import SpatialTrackable from '../Component/SpatialTrackable';

let loaded = false;

let Mummy = compose(GenericEntity, SpatialTrackable).compose({
    // expects: {
    //     displayobject: DisplayObject
    // },
    loadAssets(loader) {
        if(loaded) return;
        loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        loader.once('complete', (_, resources) => {
            loaded = true;
            Mummy.texture = resources.mummy.texture.baseTexture;
            //Mummy.texture.scaleMode = SCALE_MODES.NEAREST;
            Mummy.spriteframes = loadspritesheet(Mummy.texture, 37, 45, 18);
        });
    },
    init: function({ worldscale }) {

        this.displayobject = new PixiExtras.MovieClip(Mummy.spriteframes);
        //console.log(this.displayobject.scale);
        this.displayobject.play();
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea
        //this.displayobject.scale.set(1/this.displayobject.width*20);
        this.displayobject.scale.set(worldscale);
    },
    methods: {
        setLane(lane) {
            this.lane = lane;
            return this;
        },
        setVelocityPerSecond(vps) {
            this.velocitypersecond = vps;
            this.velocitypermillisecond = vps/1000;
            this.displayobject.animationSpeed = 9 * this.velocitypermillisecond;
            return this;
        },
        die() {
            const displayobject = this.displayobject;
            this.dead = true;
            displayobject.stop();
            displayobject.rotation = (displayobject.scale.x > 0) ? -Math.PI / 2 : Math.PI / 2;
            setTimeout(() => {
                //displayobject.parent.removeChild(displayobject);
                this.remove();
            }, 1000);
        },
        engageSoldier(/*soldier*/) {
            this.setVelocityPerSecond(0);
            this.displayobject.gotoAndStop(5);  // idle
        }
    }
});

export default Mummy;

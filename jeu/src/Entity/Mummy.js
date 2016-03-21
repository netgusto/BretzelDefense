'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { extras as PixiExtras } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Debugable from '../Component/Debugable';
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

        this.maxlife = 100;
        this.life = this.maxlife;
        this.meleecount = 0;

        this.displayobject = new PixiExtras.MovieClip(Mummy.spriteframes);
        //console.log(this.displayobject.scale);
        this.displayobject.play();
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea
        //this.displayobject.scale.set(1/this.displayobject.width*20);
        this.displayobject.scale.set(worldscale);
    },
    methods: {
        getSpatialTrackPoint() {
            // on calcule le centroide de la bounding box
            const bounds = this.displayobject.getBounds();
            const centroidx = (bounds.x + bounds.width/2)|0;
            const centroidy = (bounds.y + bounds.height/2)|0;
            return { x: centroidx, y: centroidy };
        },
        engageMelee(/*hunter*/) {
            this.setVelocityPerSecond(0);
            this.displayobject.gotoAndStop(5);  // idle
            this.meleecount++;
        },
        fightMelee(hunter) {
            hunter.life -= 0.25;
            if(hunter.life < 0) hunter.life = 0;
        },
        releaseMelee() {
            this.setVelocityPerSecond(50);
            this.displayobject.play();  // walk
            this.meleecount--;
        },
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
            this.meleecount = 0;
            displayobject.stop();
            displayobject.rotation = (displayobject.scale.x > 0) ? -Math.PI / 2 : Math.PI / 2;
            setTimeout(() => {
                //displayobject.parent.removeChild(displayobject);
                this.remove();
            }, 1000);
        }
    }
}).compose(Debugable);

export default Mummy;

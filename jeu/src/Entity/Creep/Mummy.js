'use strict';

/* @flow */

import compose from 'compose-js';
import { extras as PixiExtras } from 'pixi.js';

import { loadspritesheet } from '../../Utils/bobo';

import eventbus from '../../Singleton/eventbus';
import GenericEntity from '../Generic';
//import Debugable from '../Component/Debugable';
import SpatialTrackable from '../../Component/SpatialTrackable';

import world from '../../Singleton/world';
import timers from '../../Singleton/timers';

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

        this.maxlife = 27;
        this.life = this.maxlife;
        this.meleecount = 0;

        this.displayobject = new PixiExtras.MovieClip(Mummy.spriteframes);
        this.displayobject.play();
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea
        this.displayobject.scale.set(worldscale);

        this.offsetx = ((20 * worldscale * Math.random()) | 0) * (Math.random() > .5 ? 1 : -1);
        this.offsety = ((20 * worldscale * Math.random()) | 0) * (Math.random() > .5 ? 1 : -1);
        //this.offsety = -60 * worldscale;
    },
    methods: {
        setPosition(x, y) {
            this.displayobject.position.set(x + this.offsetx, y + this.offsety);
        },
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
        },
        fightMelee(hunter) {
            this.setTint(0x00FF00);
            hunter.life -= 0.002;
            if(hunter.life < 0) hunter.life = 0;
        },
        releaseMelee() {
            this.setTint(0xFFFFFF);
            this.setVelocityPerSecond(50);
            this.displayobject.play();  // walk
        },
        setLane(lane) {
            this.lane = lane;
            return this;
        },
        setVelocityPerSecond(vps) {
            this.velocitypersecond = vps;
            this.velocitypermillisecond = vps/1000;
            this.displayobject.animationSpeed = 9 * this.velocitypermillisecond * world.timescale;
            return this;
        },
        die() {
            this.setTint(0xFFFFFF);
            this.dead = true;
            this.displayobject.stop();
            this.displayobject.rotation = (this.displayobject.scale.x > 0) ? -Math.PI / 2 : Math.PI / 2;
            timers.addTimeout(() => {
                eventbus.emit('entity.remove.batch', [this]);
            }, 1000);
        },
        pause() {
            this.displayobject._animationSpeed = this.displayobject.animationSpeed;
            this.displayobject.animationSpeed = 0;
        },
        resume() {
            this.displayobject.animationSpeed = this.displayobject._animationSpeed;
        }
    }
})/*.compose(Debugable)*/;

export default Mummy;

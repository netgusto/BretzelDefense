'use strict';

import stampit from 'stampit';

import Entity from '../Components/Entity';

const Walkable = stampit().
    init(function() {
        this.declareImplements('Walkable');
        this.doStop();
    })
    .props({
        walk: {
            velocity: 0,
            velocityms: 0,
            state: null,

            stopVelocity: 0.0,
            walkVelocity: 30.0,
            runVelocity: 90.0,
            animationToVelocityMsRatio: 5.0
        }
    })
    .methods({
        setVelocityPerSecond(velocitypersecond: number) {
            this.walk.velocity = velocitypersecond;
            this.walk.velocityms = velocitypersecond / 1000;
            this.getDisplayObject().animationSpeed = this.walk.animationToVelocityMsRatio * this.walk.velocityms;
        },

        up(deltatime: number) : void {
            if(this.walk.state === 'idle') return;

            this.getDisplayObject().position.y -= this.walk.velocityms * deltatime;
        },

        down(deltatime: number) {
            if(this.walk.state === 'idle') return;

            this.getDisplayObject().position.y += this.walk.velocityms * deltatime;
        },

        left(deltatime: number) {
            if(this.walk.state === 'idle') return;

            const dispobj = this.getDisplayObject();

            dispobj.position.x -= this.walk.velocityms * deltatime;
            dispobj.scale.x = Math.abs(dispobj.scale.x) * -1;
        },

        right(deltatime: number) {
            if(this.walk.state === 'idle') return;

            const dispobj = this.getDisplayObject();

            dispobj.position.x += this.walk.velocityms * deltatime;
            dispobj.scale.x = Math.abs(dispobj.scale.x);
        },

        doStop() {
            if(this.walk.state === 'idle') return;
            this.setVelocityPerSecond(this.walk.stopVelocity);
            this.walk.state = 'idle';
        },

        doWalk() {
            if(this.walk.state === 'walk') return;
            this.setVelocityPerSecond(this.walk.walkVelocity);
            this.walk.state = 'walk';
        },

        doRun() {
            if(this.walk.state === 'run') return;
            this.setVelocityPerSecond(this.walk.runVelocity);
            this.walk.state = 'run';
        }
    });

let Mummy = stampit().compose(Entity, Walkable).init(function() {

    const displayobject = this.getDisplayObject();
    displayobject.play();
    displayobject.pivot.set(displayobject.width/2, displayobject.height/2);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea

    this.doStop();
    //this.hitArea = new Rectangle(10, 10, 20, 20);
});

export default Mummy;

/* @flow */

/*
import { extras as PixiExtras, Rectangle } from 'pixi.js';

export default class Mummy extends PixiExtras.MovieClip {

    velocity: number;  // px per second
    velocityms: number;  // px per ms (memoïzed)
    state: string;

    hitArea: Rectangle|Polygon;
    components: Object;

    stopVelocity:number;
    walkVelocity:number;
    runVelocity:number;
    animationToVelocityMsRatio:number;

    constructor(textures: Array<Texture>) : void {
        super(textures);

        this.stopVelocity = 0.0;
        this.walkVelocity = 30.0;
        this.runVelocity = 90.0;
        this.animationToVelocityMsRatio = 5.0;

        this.pivot.set(this.width/2, this.height/2);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea
        this.doStop();
        this.hitArea = new Rectangle(10, 10, 20, 20);
    }

    setVelocityPerSecond(velocitypersecond: number) {
        this.velocity = velocitypersecond;
        this.velocityms = velocitypersecond / 1000;
        this.animationSpeed = this.animationToVelocityMsRatio * this.velocityms;
    }

    up(deltatime: number) : void {
        if(this.state === 'idle') return;

        this.position.y -= this.velocityms * deltatime;
    }

    down(deltatime: number) {
        if(this.state === 'idle') return;

        this.position.y += this.velocityms * deltatime;
    }

    left(deltatime: number) {
        if(this.state === 'idle') return;

        this.position.x -= this.velocityms * deltatime;
        this.scale.x = Math.abs(this.scale.x) * -1;
    }

    right(deltatime: number) {
        if(this.state === 'idle') return;

        this.position.x += this.velocityms * deltatime;
        this.scale.x = Math.abs(this.scale.x);
    }

    doStop() {
        if(this.state === 'idle') return;
        this.setVelocityPerSecond(this.stopVelocity);
        this.state = 'idle';
    }

    doWalk() {
        if(this.state === 'walk') return;
        this.setVelocityPerSecond(this.walkVelocity);
        this.state = 'walk';
    }

    doRun() {
        if(this.state === 'run') return;
        this.setVelocityPerSecond(this.runVelocity);
        this.state = 'run';
    }

    destruct() : void {
        // TODO: this.off('mouseover')
        // TODO: this.off('mouseout')
    }
}
*/

'use strict';

/* @flow */

import { extras as PixiExtras, Rectangle } from 'pixi.js';
//import StateMachine from 'javascript-state-machine';

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

'use strict';

import stampit from 'stampit';

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

export default Walkable;

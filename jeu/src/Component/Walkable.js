'use strict';

//import stampit from 'stampit';
import compose from '../compose-js';

const Walkable = compose({
    init: function() {
        this.declareImplements('Walkable');
        this.doStop();
    },
    props: {
        walk: {
            velocity: 0,
            velocityms: 0,
            state: null,

            stopVelocity: 0.0,
            walkVelocity: 20.0,
            runVelocity: 60.0,
            animationToVelocityMsRatio: 9
        }
    },
    methods: {
        setVelocityPerSecond(velocitypersecond: number) {
            this.walk.velocity = velocitypersecond;
            this.walk.velocityms = velocitypersecond / 1000;
            this.getDisplayObject().animationSpeed = this.walk.animationToVelocityMsRatio * this.walk.velocityms;

            return this;
        },

        up(deltatime: number) : void {
            if(this.walk.state === 'idle') return;

            this.getDisplayObject().position.y -= this.walk.velocityms * deltatime;

            return this;
        },

        down(deltatime: number) {
            if(this.walk.state === 'idle') return;

            this.getDisplayObject().position.y += this.walk.velocityms * deltatime;

            return this;
        },

        left(deltatime: number) {
            if(this.walk.state === 'idle') return;

            const dispobj = this.getDisplayObject();

            dispobj.position.x -= this.walk.velocityms * deltatime;
            dispobj.scale.x = Math.abs(dispobj.scale.x) * -1;

            return this;
        },

        right(deltatime: number) {
            if(this.walk.state === 'idle') return;

            const dispobj = this.getDisplayObject();

            dispobj.position.x += this.walk.velocityms * deltatime;
            dispobj.scale.x = Math.abs(dispobj.scale.x);

            return this;
        },

        doStop() {
            if(this.walk.state === 'idle') return;
            this.setVelocityPerSecond(this.walk.stopVelocity);
            this.walk.state = 'idle';

            return this;
        },

        doWalk() {
            if(this.walk.state === 'walk') return;
            this.setVelocityPerSecond(this.walk.walkVelocity);
            this.walk.state = 'walk';

            return this;
        },

        doRun() {
            if(this.walk.state === 'run') return;
            this.setVelocityPerSecond(this.walk.runVelocity);
            this.walk.state = 'run';

            return this;
        }
    }
});

export default Walkable;

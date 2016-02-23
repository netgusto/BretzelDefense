'use strict';

import compose from '../compose-js';

import { vec2 } from 'gl-matrix';

const Animable = compose({
    init: function() {
        this.declareImplements('Animable');
    },
    props: {
        animation: {
            speed: 100,
            direction: { x: 0, y: 0 }
        }
    },
    methods: {
        setSpeed(speed: number) : Object {
            this.animation.speed = speed;
            return this;
        },

        getSpeed() : number {
            return this.animation.speed;
        },

        setDirection(x: number, y: number) : Object {
            const normvec = vec2.normalize({}, [x, y]);
            this.animation.direction.x = normvec[0] || 0;
            this.animation.direction.y = normvec[1] || 0;
            return this;
        },

        getDirection() : { x: number, y: number } {
            return this.animation.direction;
        },

        flipDirection() {
            this.flipDirectionX();
            this.flipDirectionY();
            return this;
        },

        flipDirectionX() {
            this.animation.direction.x = this.animation.direction.x * -1;
            return this;
        },

        flipDirectionY() {
            this.animation.direction.y = this.animation.direction.y * -1;
            return this;
        }
    }
});

export default Animable;

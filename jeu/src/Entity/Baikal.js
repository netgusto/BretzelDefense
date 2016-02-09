'use strict';

/* @flow */

import { Sprite, Polygon, Rectangle } from 'pixi.js';

import { vec2 } from 'gl-matrix';

export default class Baikal extends Sprite {

    direction: { x: number, y: number };
    speed: number;

    hitArea: Rectangle|Polygon;
    components: Object;

    constructor(texture: Texture) {
        super(texture);
        this.direction = { x: 0, y: 0 };
        //this.setDirection(0, 0);
    }

    setDirection(x: number, y: number) : Baikal {
        const normvec = vec2.normalize({}, [x, y]);
        this.direction.x = normvec[0] || 0;
        this.direction.y = normvec[1] || 0;

        return this;
    }

    setSpeed(speed: number) : Baikal {
        this.speed = speed;
        return this;
    }

    setScale(x: number, y: ?number) : Baikal {
        this.scale.set(x, y);
        return this;
    }

    setPosition(x: number, y: ?number) : Baikal {
        this.position.set(x, y);
        return this;
    }

    setPivot(x: number, y: ?number) : Baikal {
        this.pivot.set(x, y);
        return this;
    }

    setAnchor(x: number, y: ?number) : Baikal {
        this.anchor.set(x, y);
        return this;
    }

    setCollisionArea(p: Polygon|Rectangle) : Baikal {
        this.hitArea = p;
        return this;
    }

    flipDirection() {
        this.flipDirectionX();
        this.flipDirectionY();
    }

    flipDirectionX() {
        this.direction.x = this.direction.x * -1;
    }

    flipDirectionY() {
        this.direction.y = this.direction.y * -1;
    }
}

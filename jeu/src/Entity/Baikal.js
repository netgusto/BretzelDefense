'use strict';

/* @flow */

import { Sprite, Polygon, Rectangle } from 'pixi.js';

import { vec2 } from 'gl-matrix';

export default class Baikal extends Sprite {

    hitArea: Rectangle|Polygon;
    components: Object;

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
}

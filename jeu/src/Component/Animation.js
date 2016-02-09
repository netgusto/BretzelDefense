'use strict';

/* @flow */

import { vec2 } from 'gl-matrix';

export default function AnimationComponent(entity: DisplayObject, { speed, direction }) {
    if(!entity.components) { entity.components = {}; }

    entity.components.animation = {
        speed: speed,
        direction: direction || { x: 0, y: 0 }
    };

    entity.setSpeed = function(speed: number) : DisplayObject {
        this.components.animation.speed = speed;
        return this;
    }.bind(entity);

    entity.getSpeed = function() : number {
        return this.components.animation.speed;
    }.bind(entity);

    entity.setDirection = function(x: number, y: number) : DisplayObject {
        const normvec = vec2.normalize({}, [x, y]);
        this.components.animation.direction.x = normvec[0] || 0;
        this.components.animation.direction.y = normvec[1] || 0;

        return this;
    }.bind(entity);

    entity.getDirection = function() : { x: number, y: number } {
        return this.components.animation.direction;
    }.bind(entity);

    entity.flipDirection = function() {
        this.flipDirectionX();
        this.flipDirectionY();
    }.bind(entity);

    entity.flipDirectionX = function() {
        this.components.animation.direction.x = this.components.animation.direction.x * -1;
    }.bind(entity);

    entity.flipDirectionY = function() {
        this.components.animation.direction.y = this.components.animation.direction.y * -1;
    }.bind(entity);

    return entity;
}

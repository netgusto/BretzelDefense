'use strict';

import stampit from 'stampit';

const Collisionable = stampit()
    .methods({
        setCollisionArea(p: Polygon|Rectangle) : Object {
            this.getDisplayObject().hitArea = p;
            return this;
        }
    });

export default Collisionable;

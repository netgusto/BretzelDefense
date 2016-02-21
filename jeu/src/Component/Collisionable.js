'use strict';

import stampit from 'stampit';

const Collisionable = stampit()
    .init(function() {
        this.declareImplements('Collisionable');
    })
    .props({
        collisionArea: null,
        collisionGroup: null
    })
    .methods({
        setCollisionArea(p: Polygon|Rectangle) : Object {
            this.collisionArea = p;
            return this;
        },
        getCollisionArea() : Polygon|Rectangle {
            return this.collisionArea;
        },

        setCollisionGroup(group: string) : Object {
            this.collisionGroup = group;
            return this;
        },
        getCollisionGroup() : string {
            return this.collisionGroup;
        },
    });

export default Collisionable;
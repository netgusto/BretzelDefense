'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';

const Collisionable = compose({
    init: function() {
        this.tag('Collisionable');
    },
    props: {
        collisionArea: null,
        collisionGroup: null
    },
    methods: {
        setCollisionArea(p) : Object {
            this.collisionArea = p;
            return this;
        },
        getCollisionArea() {
            return this.collisionArea;
        },

        setCollisionGroup(group: string) : Object {
            this.collisionGroup = group;
            return this;
        },
        getCollisionGroup() : string {
            return this.collisionGroup;
        }
    }
});

export default Collisionable;

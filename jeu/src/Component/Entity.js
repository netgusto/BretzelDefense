'use strict';

import stampit from 'stampit';

import Displayable from './Displayable';
import Collisionable from './Collisionable';
import Componentable from './Componentable';

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const Identifiable = stampit()
    .props({
        id: null
    })
    .init(function() {
        if(!this.id) {
            this.id = uuid();
        }
    }).methods({
        getId() {
            return this.id;
        }
    })

const Entity = stampit.compose(Identifiable, Componentable, Displayable, Collisionable);

export default Entity;

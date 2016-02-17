'use strict';

import stampit from 'stampit';

import Displayable from './Displayable';
import Collisionable from './Collisionable';
import Componentable from './Componentable';

const Entity = stampit.compose(Componentable, Displayable, Collisionable);

export default Entity;

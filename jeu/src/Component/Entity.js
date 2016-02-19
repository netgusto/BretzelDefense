'use strict';

import stampit from 'stampit';

import Identifiable from './Displayable';
import Displayable from './Displayable';
import Collisionable from './Collisionable';
import Componentable from './Componentable';

const Entity = stampit.compose(Identifiable, Componentable, Displayable, Collisionable);

export default Entity;

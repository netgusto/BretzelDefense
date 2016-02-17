'use strict';

/* @flow */

import stampit from 'stampit';

import Entity from '../Component/Entity';
import Animable from '../Component/Animable';

let Baikal = stampit().compose(Entity, Animable);

export default Baikal;

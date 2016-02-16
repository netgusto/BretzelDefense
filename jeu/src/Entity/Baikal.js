'use strict';

/* @flow */

import stampit from 'stampit';

import Entity from '../Components/Entity';
import Animable from '../Components/Animable';

let Baikal = stampit().compose(Entity, Animable);

export default Baikal;

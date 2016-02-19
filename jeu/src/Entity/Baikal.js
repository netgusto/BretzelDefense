'use strict';

/* @flow */

import stampit from 'stampit';

import GenericEntity from './Generic';
import Animable from '../Component/Animable';

let Baikal = stampit().compose(GenericEntity, Animable);

export default Baikal;

'use strict';

/* @flow */

//import stampit from 'stampit';

import compose from '../compose-js';

import GenericEntity from './Generic';
import Animable from '../Component/Animable';

let Baikal = compose(GenericEntity, Animable);

export default Baikal;

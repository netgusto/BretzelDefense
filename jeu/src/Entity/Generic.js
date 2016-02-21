'use strict';

import stampit from 'stampit';

import Identifiable from '../Component/Displayable';
import Displayable from '../Component/Displayable';
import Collisionable from '../Component/Collisionable';
import Componentable from '../Component/Componentable';
//import Listenable from '../Component/Listenable';

const GenericEntity = stampit.compose(Identifiable, Componentable, Displayable, Collisionable)
    .methods({
        remove() {
            this.getDisplayObject().parent.removeChild(this.getDisplayObject());
        }
    });

export default GenericEntity;

'use strict';

//import stampit from 'stampit';
import compose from '../compose-js';

import Identifiable from '../Component/Displayable';
import Displayable from '../Component/Displayable';
import Collisionable from '../Component/Collisionable';
import Componentable from '../Component/Componentable';
import AssetLoader from '../Component/AssetLoader';
//import Listenable from '../Component/Listenable';

const GenericEntity = compose(Identifiable, Componentable, AssetLoader, Displayable, Collisionable).compose({
    methods: {
        remove() {
            this.getDisplayObject().parent.removeChild(this.getDisplayObject());
        }
    }
});

export default GenericEntity;

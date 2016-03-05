'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';

import { DisplayObject } from 'pixi.js';

import Identifiable from '../Component/Identifiable';
import Displayable from '../Component/Displayable';
import Taggable from '../Component/Taggable';
import AssetLoader from '../Component/AssetLoader';

const GenericEntity = compose(Taggable, Identifiable, AssetLoader, Displayable, {
    expects: {
        displayobject: DisplayObject
    },
    methods: {
        collaborativeDiffusionFieldUpdate: function() {},
        render: function() {},
        remove() {
            this.displayobject.parent.removeChild(this.displayobject);
        }
    }
});

export default GenericEntity;

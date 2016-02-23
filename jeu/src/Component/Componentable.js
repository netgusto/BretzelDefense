'use strict';

import stampit from 'stampit';

const Componentable = stampit()
    .init(function() {
        this.declareImplements('Componentable');
    })
    .props({
        components: {}
    })
    .methods({
        declareImplements(name: string) : Object {
            this.components[name] = true;
            return this;
        },
        checkImplements(name: string) : boolean {
            return this.components[name];
        }
    });

export default Componentable;

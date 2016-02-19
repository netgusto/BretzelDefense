'use strict';

import stampit from 'stampit';

const Componentable = stampit()
    .init(function() {
        this.declareImplements('Componentable');
    })
    .props({
        components: []
    })
    .methods({
        declareImplements(name: string) : Object {
            this.components.push(name);
            return this;
        },
        checkImplements(name: string) : boolean {
            return this.components.indexOf(name) !== -1;
        }
    });

export default Componentable;

'use strict';

import stampit from 'stampit';

const Componentable = stampit()
    .refs({
        components: []
    })
    .methods({
        declareImplements(name: string) : Object {
            this.components.push(name);
            return this;
        },
        implements(name: string) : boolean {
            return this.components.indexOf(name) !== -1;;
        }
    });

export default Componentable;
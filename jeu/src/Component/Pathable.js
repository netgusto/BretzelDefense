'use strict';

/* @flow */

import stampit from 'stampit';

const Pathable = stampit()
    .init(function() {
        this.declareImplements('Pathable');
    })
    .props({
        path: { target: null }
    })
    .methods({
        setPathTarget(x: number, y: number) {
            this.path.target = { x, y };
        },
        getPathTarget(x: number, y: number) {
            return this.path.target;
        }
    });

export default Pathable;

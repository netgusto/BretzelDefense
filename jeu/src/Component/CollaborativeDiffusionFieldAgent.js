'use strict';

import stampit from 'stampit';

const CollaborativeDiffusionFieldAgent = stampit()
    .init(function() {
        this.declareImplements('CollaborativeDiffusionFieldAgent');
    });

export default CollaborativeDiffusionFieldAgent;

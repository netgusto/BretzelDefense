'use strict';

import compose from '../compose-js';

const CollaborativeDiffusionFieldAgent = compose({
    init: function() {
        this.declareImplements('CollaborativeDiffusionFieldAgent');
    }
});

export default CollaborativeDiffusionFieldAgent;

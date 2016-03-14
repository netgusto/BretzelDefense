'use strict';

import compose from 'compose-js';

export default compose({
    init: function() {
        this.tag('SpatialTrackable');
        this.spatialtrackable = true;
    }
});


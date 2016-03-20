'use strict';

const zindexsort = function(a, b) { let pos = a.y - b.y; return pos === 0 ? a.id - b.id : pos; };

export default function(layer) {
    return {
        process() {
            layer.sort(zindexsort);
        }
    };
}

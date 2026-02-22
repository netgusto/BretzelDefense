import { describe, expect, it } from 'vitest';

import SpatialHash from '../src/Utils/spatialhash';

describe('SpatialHash', function() {
    it('removes entities stored in cell index 0', function() {
        const spatialhash = new SpatialHash({
            cellwidth: 10,
            cellheight: 10,
            worldwidth: 100,
            worldheight: 100,
            maxentityid: 32
        });

        spatialhash.insert(1, 1, 0, { id: 0 });
        expect(spatialhash.grid[0]).toHaveLength(1);

        spatialhash.remove(0);

        expect(spatialhash.grid[0]).toHaveLength(0);
        expect(spatialhash.present[0]).toBe(0);
    });
});

'use strict';

import { path2js, jsToSVGPath } from '../../Utils/svg';
import { gridcellsize, whratio, lanesprops as level01lanesprops } from '../Level01/props';

const basewidth = 2048;

const mirrorPathHorizontally = function(path) {
    const jspath = path2js(path);

    const mirrored = jspath.map(function(instruction) {
        switch(instruction.instruction) {
            case 'M': {
                instruction.data[0] = basewidth - instruction.data[0];
                break;
            }

            case 'C': {
                instruction.data[0] = basewidth - instruction.data[0];
                instruction.data[2] = basewidth - instruction.data[2];
                instruction.data[4] = basewidth - instruction.data[4];
                break;
            }
        }

        return instruction;
    });

    return jsToSVGPath(mirrored);
};

export const lanesprops = level01lanesprops.map(function(lane) {
    return {
        ...lane,
        path: mirrorPathHorizontally(lane.path)
    };
});

export { gridcellsize, whratio };

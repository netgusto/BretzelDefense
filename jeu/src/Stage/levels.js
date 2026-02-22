'use strict';

import Level01 from './Level01';
import Level02 from './Level02';

const levels = [
    {
        id: 'level01',
        label: 'Level 1',
        stage: Level01
    },
    {
        id: 'level02',
        label: 'Level 2',
        stage: Level02
    }
];

export const defaultLevel = levels[0];

export default levels;

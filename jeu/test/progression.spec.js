import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    getUnlockedLevels,
    isLevelUnlocked,
    resetProgressionForTests,
    unlockLevel,
    unlockLevels
} from '../src/Stage/progression';

describe('level progression', function() {
    beforeEach(function() {
        resetProgressionForTests();
    });

    afterEach(function() {
        resetProgressionForTests();
    });

    it('keeps level01 unlocked by default', function() {
        expect(isLevelUnlocked('level01')).toBe(true);
        expect(isLevelUnlocked('level02')).toBe(false);
    });

    it('unlocks and persists level ids without duplicates', function() {
        unlockLevel('level02');
        unlockLevels(['level02', 'level03']);

        expect(getUnlockedLevels()).toEqual(['level01', 'level02', 'level03']);
        expect(isLevelUnlocked('level02')).toBe(true);
    });
});

import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = function(relativepath) {
    const filepath = path.resolve('/home/jerome/code/BretzelDefense/jeu', relativepath);
    return fs.readFileSync(filepath, 'utf8');
};

describe('level registry source', function() {
    it('declares two unique level ids and a default level', function() {
        const levelsSource = readSource('src/Stage/levels.js');
        const idmatches = [...levelsSource.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]);

        expect(idmatches).toContain('level01');
        expect(idmatches).toContain('level02');
        expect(new Set(idmatches).size).toBe(idmatches.length);
        expect(levelsSource.includes('export const defaultLevel = levels[0];')).toBe(true);
    });
});

describe('level config source contracts', function() {
    it('keeps required factory hooks for level configs', function() {
        const level01source = readSource('src/Stage/Level01/config.js');
        const level02source = readSource('src/Stage/Level02/config.js');

        const requiredtokens = [
            'id:',
            'getBuildspots',
            'getBackgroundTexturePath',
            'getCompiledLevelPath',
            'loadBackgroundAsset',
            'loadSharedAssets',
            'createTowerBuilders',
            'spawnCreep'
        ];

        requiredtokens.map(function(token) {
            expect(level01source.includes(token)).toBe(true);
            expect(level02source.includes(token)).toBe(true);
        });
    });
});

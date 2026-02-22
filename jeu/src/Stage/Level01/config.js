'use strict';

import Background from '../../Entity/Background';
import Mummy from '../../Entity/Creep/Mummy';
import FireballTower from '../../Entity/Tower/FireballTower';
import ArcherTower from '../../Entity/Tower/ArcherTower';
import BarrackTower from '../../Entity/Tower/BarrackTower';

import TitleScreen from '../../Stage/TitleScreen';

import { gridcellsize, whratio, lanesprops } from './props';
import { economy, spawnBalance, startingState, towerCosts, waveSchedule } from './balance';

const balance = {
    economy,
    spawnBalance,
    startingState,
    towerCosts,
    waveSchedule
};

const getBuildspots = function({ world }) {
    return [
        { x: 741 * world.scale + world.resolution.offsetx, y: 695 * world.scale + world.resolution.offsety, deploy: [540 * world.scale + world.resolution.offsetx, 701 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 874 * world.scale + world.resolution.offsetx, y: 409 * world.scale + world.resolution.offsety, deploy: [912 * world.scale + world.resolution.offsetx, 546 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 887 * world.scale + world.resolution.offsetx, y: 988 * world.scale + world.resolution.offsety, deploy: [856 * world.scale + world.resolution.offsetx, 843 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1082 * world.scale + world.resolution.offsetx, y: 949 * world.scale + world.resolution.offsety, deploy: [1285 * world.scale + world.resolution.offsetx, 945 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1108 * world.scale + world.resolution.offsetx, y: 1237 * world.scale + world.resolution.offsety, deploy: [954 * world.scale + world.resolution.offsetx, 1148 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1224 * world.scale + world.resolution.offsetx, y: 527 * world.scale + world.resolution.offsety, deploy: [1444 * world.scale + world.resolution.offsetx, 480 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1228 * world.scale + world.resolution.offsetx, y: 369 * world.scale + world.resolution.offsety, deploy: [1225 * world.scale + world.resolution.offsetx, 224 * world.scale + world.resolution.offsety], tower: null, current: false }
    ];
};

export default {
    id: 'level01',
    unlocks: ['level02'],
    gridcellsize,
    whratio,
    lanesprops,
    balance,
    titleStage: TitleScreen,
    backgroundEntity: Background,
    getBuildspots,
    getBackgroundTexturePath({ world }) {
        return '/assets/sprites/level-' + world.resolution.width + '-' + world.resolution.height + '.jpg';
    },
    getCompiledLevelPath({ world }) {
        return '/assets/compiled/level1.' + world.resolution.width + 'x' + world.resolution.height + '.json';
    },
    loadBackgroundAsset({ loader }) {
        Background.loadAssets(loader);
    },
    loadSharedAssets({ loader }) {
        Mummy.loadAssets(loader);
        FireballTower.loadAssets(loader);
        ArcherTower.loadAssets(loader);
        BarrackTower.loadAssets(loader);
    },
    createTowerBuilders({ world, whratio, layers, meleeSystem }) {
        return {
            ArcherTower({ spot }) {
                return ArcherTower({ worldscale: world.scale, whratio })
                    .mount({
                        worldscale: world.scale,
                        clickpoint: { x: spot.x, y: spot.y },
                        creepslayer: layers.creeps
                    });
            },
            BarrackTower({ spot }) {
                return BarrackTower({ worldscale: world.scale, whratio, meleeSystem })
                    .mount({
                        worldscale: world.scale,
                        clickpoint: { x: spot.x, y: spot.y },
                        deploypoint: { x: spot.deploy[0], y: spot.deploy[1] },
                        creepslayer: layers.creeps
                    });
            },
            FireballTower({ spot }) {
                return FireballTower({ worldscale: world.scale, whratio })
                    .mount({
                        clickpoint: { x: spot.x, y: spot.y },
                        creepslayer: layers.creeps
                    });
            }
        };
    },
    spawnCreep({ world, layer, lane, spatialhash, vps, spawnBalance }) {
        const mummy = Mummy({
            worldscale: world.scale
        }).setVelocityPerSecond((vps + Math.random() * spawnBalance.speedVariance) * world.scale);

        layer.addEntity(mummy);
        mummy.creep = true;
        mummy.lane = lane;
        mummy.prevpos = { x: 0, y: 0 };
        mummy.pixelswalked = 0;

        const trackpoint = mummy.getSpatialTrackPoint();
        spatialhash.insert(trackpoint.x, trackpoint.y, mummy.id, mummy);

        return mummy;
    },
    onGameOver({ swapstage, titleStage }) {
        swapstage(titleStage);
    },
    onGameWin({ swapstage, titleStage }) {
        alert('Level 1 clear !');
        swapstage(titleStage);
    }
};

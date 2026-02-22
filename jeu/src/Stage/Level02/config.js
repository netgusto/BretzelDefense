'use strict';

import Background from '../../Entity/Background';
import Mummy from '../../Entity/Creep/Mummy';
import FireballTower from '../../Entity/Tower/FireballTower';
import ArcherTower from '../../Entity/Tower/ArcherTower';
import BarrackTower from '../../Entity/Tower/BarrackTower';

import TitleScreen from '../../Stage/TitleScreen';

import { gridcellsize, whratio, lanesprops } from './props';
import level01config from '../Level01/config';

const balance = {
    startingState: {
        life: 22,
        coins: 120
    },
    economy: {
        creepKillReward: 5,
        towerSellRefundRate: 0.85,
        creepLifePenalty: 1
    },
    towerCosts: {
        ArcherTower: 45,
        BarrackTower: 80,
        FireballTower: 75
    },
    spawnBalance: {
        speedVariance: 65
    },
    waveSchedule: [
        { number: 20, frequency: 650, vps: 24, delay: 0 },
        { number: 45, frequency: 360, vps: 30, delay: 14000 },
        { number: 120, frequency: 85, vps: 34, delay: 29000 },
        { number: 65, frequency: 320, vps: 40, delay: 47000 },
        { number: 140, frequency: 280, vps: 45, delay: 70000 }
    ]
};

const level01basebuildspots = [
    { x: 741, y: 695, deploy: [540, 701] },
    { x: 874, y: 409, deploy: [912, 546] },
    { x: 887, y: 988, deploy: [856, 843] },
    { x: 1082, y: 949, deploy: [1285, 945] },
    { x: 1108, y: 1237, deploy: [954, 1148] },
    { x: 1224, y: 527, deploy: [1444, 480] },
    { x: 1228, y: 369, deploy: [1225, 224] }
];

const mirroredbuildspots = level01basebuildspots.map(function(spot) {
    return {
        x: 2048 - spot.x,
        y: spot.y,
        deploy: [2048 - spot.deploy[0], spot.deploy[1]]
    };
});

const getMirroredOffsetX = function(world) {
    const mapbasewidth = 2048;
    return world.resolution.width - world.resolution.offsetx - (mapbasewidth * world.scale);
};

const getBuildspots = function({ world }) {
    const mirroredoffsetx = getMirroredOffsetX(world);

    return mirroredbuildspots.map(function(spot) {
        return {
            x: spot.x * world.scale + mirroredoffsetx,
            y: spot.y * world.scale + world.resolution.offsety,
            deploy: [
                spot.deploy[0] * world.scale + mirroredoffsetx,
                spot.deploy[1] * world.scale + world.resolution.offsety
            ],
            tower: null,
            current: false
        };
    });
};

export default {
    id: 'level02',
    unlocks: [],
    gridcellsize,
    whratio,
    lanesprops,
    balance,
    titleStage: TitleScreen,
    backgroundEntity: Background,
    getBuildspots,
    getBackgroundTexturePath({ world }) {
        return '/assets/sprites/level2-' + world.resolution.width + '-' + world.resolution.height + '.jpg';
    },
    getBackgroundProps() {
        return {
            mirrorX: true
        };
    },
    getLaneOffsetX({ world }) {
        return getMirroredOffsetX(world);
    },
    getCompiledLevelPath({ world }) {
        return '/assets/compiled/level2.' + world.resolution.width + 'x' + world.resolution.height + '.json';
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
    createTowerBuilders: level01config.createTowerBuilders,
    spawnCreep: level01config.spawnCreep,
    onGameOver({ swapstage, titleStage }) {
        swapstage(titleStage);
    },
    onGameWin({ swapstage, titleStage }) {
        alert('Level 2 clear !');
        swapstage(titleStage);
    }
};

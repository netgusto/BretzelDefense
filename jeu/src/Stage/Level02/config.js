'use strict';

import Background from '../../Entity/Background';
import Mummy from '../../Entity/Creep/Mummy';
import FireballTower from '../../Entity/Tower/FireballTower';
import ArcherTower from '../../Entity/Tower/ArcherTower';
import BarrackTower from '../../Entity/Tower/BarrackTower';

import TitleScreen from '../../Stage/TitleScreen';

import { gridcellsize, whratio, lanesprops } from '../Level01/props';
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

export default {
    gridcellsize,
    whratio,
    lanesprops,
    balance,
    titleStage: TitleScreen,
    backgroundEntity: Background,
    getBuildspots: level01config.getBuildspots,
    getBackgroundTexturePath({ world }) {
        return '/assets/sprites/level-' + world.resolution.width + '-' + world.resolution.height + '.jpg';
    },
    getCompiledLevelPath({ world }) {
        return '/assets/compiled/level1.' + world.resolution.width + 'x' + world.resolution.height + '.json';
    },
    loadEntityAssets({ loader }) {
        Background.loadAssets(loader);
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

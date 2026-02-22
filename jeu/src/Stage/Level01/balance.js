'use strict';

export const startingState = {
    life: 20,
    coins: 100
};

export const economy = {
    creepKillReward: 4,
    towerSellRefundRate: 0.9,
    creepLifePenalty: 1
};

export const towerCosts = {
    ArcherTower: 40,
    BarrackTower: 70,
    FireballTower: 60
};

export const spawnBalance = {
    speedVariance: 50
};

export const waveSchedule = [
    { number: 9, frequency: 800, vps: 20, delay: 0 },
    { number: 35, frequency: 400, vps: 23, delay: 20000 },
    { number: 500, frequency: 10, vps: 30, delay: 30000 },
    { number: 40, frequency: 400, vps: 35, delay: 50000 },
    { number: 70, frequency: 400, vps: 38, delay: 75000 }
];

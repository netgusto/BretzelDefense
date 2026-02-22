'use strict';

import eventbus from '../../Singleton/eventbus';

export default function({ timers, waveSchedule, scheduleTimescale = 1, spawnWave, isCountedDeath }) {
    let remainingcreeps = waveSchedule.reduce((total, waveprops) => total + waveprops.number, 0);
    let gamewon = false;

    waveSchedule.map(function(waveprops) {
        timers.addTimeout(function() {
            spawnWave(waveprops);
        }, waveprops.delay / scheduleTimescale);
    });

    const decreaseRemainingCreeps = function(decreaseby) {
        if(gamewon || decreaseby <= 0) {
            return;
        }

        remainingcreeps -= decreaseby;
        if(remainingcreeps <= 0) {
            remainingcreeps = 0;
            gamewon = true;
            eventbus.emit('game.win');
        }
    };

    eventbus.on('entity.death.batch', function(entities) {
        let deadcreeps = 0;

        for(let i = 0; i < entities.length; i++) {
            if(isCountedDeath(entities[i])) {
                deadcreeps++;
            }
        }

        decreaseRemainingCreeps(deadcreeps);
    });

    eventbus.on('creep.succeeded', function() {
        decreaseRemainingCreeps(1);
    });

    return {
        getRemainingCreeps() {
            return remainingcreeps;
        }
    };
}

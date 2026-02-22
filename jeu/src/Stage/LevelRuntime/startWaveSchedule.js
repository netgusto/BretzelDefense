'use strict';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';

export default function({ timers, waveSchedule, scheduleTimescale = 1, spawnWave, isCountedDeath }) {
    let remainingcreeps = waveSchedule.reduce((total, waveprops) => total + waveprops.number, 0);
    let gamewon = false;
    const listeners = [];
    const scheduletimeouts = [];

    const on = function(name, handler) {
        eventbus.on(name, handler);
        listeners.push({ name, handler });
    };

    waveSchedule.map(function(waveprops) {
        const timeoutid = timers.addTimeout(function() {
            spawnWave(waveprops);
        }, waveprops.delay / scheduleTimescale);

        scheduletimeouts.push(timeoutid);
    });

    const decreaseRemainingCreeps = function(decreaseby) {
        if(gamewon || decreaseby <= 0) {
            return;
        }

        remainingcreeps -= decreaseby;
        if(remainingcreeps <= 0) {
            remainingcreeps = 0;
            gamewon = true;
            eventbus.emit(EVENTS.GAME_WIN);
        }
    };

    const onEntityDeathBatch = function(entities) {
        let deadcreeps = 0;

        for(let i = 0; i < entities.length; i++) {
            if(isCountedDeath(entities[i])) {
                deadcreeps++;
            }
        }

        decreaseRemainingCreeps(deadcreeps);
    };

    const onCreepSucceeded = function() {
        decreaseRemainingCreeps(1);
    };

    on(EVENTS.ENTITY_DEATH_BATCH, onEntityDeathBatch);
    on(EVENTS.CREEP_SUCCEEDED, onCreepSucceeded);

    return {
        getRemainingCreeps() {
            return remainingcreeps;
        },
        dispose() {
            for(let i = 0; i < listeners.length; i++) {
                eventbus.off(listeners[i].name, listeners[i].handler);
            }
            listeners.length = 0;

            while(scheduletimeouts.length) {
                timers.remove(scheduletimeouts.pop());
            }
        }
    };
}

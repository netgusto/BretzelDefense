import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import eventbus from '../src/Singleton/eventbus';
import EVENTS from '../src/Singleton/events';
import startWaveSchedule from '../src/Stage/LevelRuntime/startWaveSchedule';

describe('startWaveSchedule', function() {
    beforeEach(function() {
        eventbus.removeAll();
    });

    afterEach(function() {
        eventbus.removeAll();
    });

    it('emits game win only once', function() {
        const scheduled = [];
        const timers = {
            addTimeout(fn) {
                scheduled.push(fn);
                return scheduled.length - 1;
            },
            remove(id) {
                scheduled[id] = null;
            }
        };

        let wins = 0;
        eventbus.on(EVENTS.GAME_WIN, function() {
            wins++;
        });

        const runtime = startWaveSchedule({
            timers,
            waveSchedule: [{ number: 1, frequency: 10, vps: 10, delay: 0 }],
            scheduleTimescale: 1,
            spawnWave: function() {},
            isCountedDeath: function(entity) {
                return entity.creep === true;
            }
        });

        eventbus.emit(EVENTS.ENTITY_DEATH_BATCH, [{ creep: true }]);
        eventbus.emit(EVENTS.ENTITY_DEATH_BATCH, [{ creep: true }]);
        eventbus.emit(EVENTS.CREEP_SUCCEEDED, {});

        expect(wins).toBe(1);

        runtime.dispose();
    });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import eventbus from '../src/Singleton/eventbus';
import EVENTS from '../src/Singleton/events';
import registerEntityLifecycleEvents from '../src/Stage/LevelRuntime/registerEntityLifecycleEvents';
import registerGameStateEvents from '../src/Stage/LevelRuntime/registerGameStateEvents';

describe('runtime lifecycle', function() {
    beforeEach(function() {
        eventbus.removeAll();
    });

    afterEach(function() {
        eventbus.removeAll();
    });

    it('untracks before removing when a creep succeeds', function() {
        const calls = [];
        const meleeSystem = {
            forfaitbatch(ids) {
                calls.push('melee:' + ids.join(','));
            }
        };

        const spatialhash = {
            removebatch(ids) {
                calls.push('spatial:' + ids.join(','));
            }
        };

        const lifecycle = registerEntityLifecycleEvents({
            state: { coins: 0 },
            economy: { creepKillReward: 4 },
            meleeSystem,
            spatialhash
        });

        const state = { life: 3, pause: false };
        const world = {
            timescale: 1,
            set(key, value) {
                this[key] = value;
                return this;
            }
        };

        const gameState = registerGameStateEvents({
            state,
            world,
            timers: {
                pauseAll() {},
                resumeAll() {}
            },
            layers: {
                creeps: { entities: [] },
                pause: { container: { renderable: false, interactive: false } }
            },
            economy: { creepLifePenalty: 1 }
        });

        const creep = {
            id: 42,
            remove() {
                calls.push('remove');
            }
        };

        eventbus.emit(EVENTS.CREEP_SUCCEEDED, { creep });

        expect(state.life).toBe(2);
        expect(calls).toEqual(['melee:42', 'spatial:42', 'remove']);
        expect(creep._despawned).toBe(true);

        gameState.dispose();
        lifecycle.dispose();
    });
});

'use strict';

import screenfull from 'screenfull';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';

export default function({ state, world, timers, layers, economy, onGameOver, onGameWin }) {
    const listeners = [];

    const on = function(name, handler) {
        eventbus.on(name, handler);
        listeners.push({ name, handler });
    };

    const onGameBlur = function() {
        eventbus.emit(EVENTS.GAME_PAUSE);
    };

    const onGameFocus = function() {
    };

    const onGamePause = function() {
        if(state.pause) {
            return;
        }

        state.pause = true;
        world.set('_timescale', world.timescale);
        world.set('timescale', 0);
        timers.pauseAll();

        layers.creeps.entities.map(item => item.pause());
        layers.pause.container.renderable = true;
        layers.pause.container.interactive = true;
    };

    const onGamePauseToggle = function() {
        if(state.pause) {
            eventbus.emit(EVENTS.GAME_RESUME);
        } else {
            eventbus.emit(EVENTS.GAME_PAUSE);
        }
    };

    const onGameResume = function() {
        if(!state.pause) {
            return;
        }

        state.pause = false;
        world.set('timescale', world._timescale || 1);
        timers.resumeAll();

        layers.creeps.entities.map(item => item.resume());
        layers.pause.container.renderable = false;
        layers.pause.container.interactive = false;
    };

    const onGameFullscreenToggle = function() {
        if(screenfull.enabled) {
            screenfull.toggle();
        }
    };

    const onCreepSucceeded = function({ creep }) {
        eventbus.emit(EVENTS.LIFE_DECREASE, economy.creepLifePenalty);
        eventbus.emit(EVENTS.ENTITY_DESPAWN_BATCH, {
            entities: [creep]
        });
    };

    const onLifeDecrease = function(amount) {
        state.life -= amount;
        if(state.life <= 0) {
            state.life = 0;
            eventbus.emit(EVENTS.GAME_OVER);
        }
    };

    const onGameOverEvent = function() {
        if(onGameOver) {
            onGameOver();
        }
    };

    const onGameWinEvent = function() {
        if(onGameWin) {
            onGameWin();
        }
    };

    on(EVENTS.GAME_BLUR, onGameBlur);
    on(EVENTS.GAME_FOCUS, onGameFocus);
    on(EVENTS.GAME_PAUSE, onGamePause);
    on(EVENTS.GAME_PAUSE_TOGGLE, onGamePauseToggle);
    on(EVENTS.GAME_RESUME, onGameResume);
    on(EVENTS.GAME_FULLSCREEN_TOGGLE, onGameFullscreenToggle);
    on(EVENTS.CREEP_SUCCEEDED, onCreepSucceeded);
    on(EVENTS.LIFE_DECREASE, onLifeDecrease);
    on(EVENTS.GAME_OVER, onGameOverEvent);
    on(EVENTS.GAME_WIN, onGameWinEvent);

    return {
        dispose() {
            for(let i = 0; i < listeners.length; i++) {
                eventbus.off(listeners[i].name, listeners[i].handler);
            }
            listeners.length = 0;
        }
    };
}

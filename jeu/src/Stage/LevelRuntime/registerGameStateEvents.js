'use strict';

import screenfull from 'screenfull';

import eventbus from '../../Singleton/eventbus';

export default function({ state, world, timers, layers, economy, onGameOver, onGameWin }) {
    eventbus.on('game.blur', function() {
        eventbus.emit('game.pause');
    });

    eventbus.on('game.focus', function() {
    });

    eventbus.on('game.pause', function() {
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
    });

    eventbus.on('game.pausetoggle', function() {
        if(state.pause) {
            eventbus.emit('game.resume');
        } else {
            eventbus.emit('game.pause');
        }
    });

    eventbus.on('game.resume', function() {
        if(!state.pause) {
            return;
        }

        state.pause = false;
        world.set('timescale', world._timescale || 1);
        timers.resumeAll();

        layers.creeps.entities.map(item => item.resume());
        layers.pause.container.renderable = false;
        layers.pause.container.interactive = false;
    });

    eventbus.on('game.fullscreentoggle', function() {
        if(screenfull.enabled) {
            screenfull.toggle();
        }
    });

    eventbus.on('creep.succeeded', function({ creep }) {
        eventbus.emit('life.decrease', economy.creepLifePenalty);
        eventbus.emit('entity.despawn.batch', {
            entities: [creep]
        });
    });

    eventbus.on('life.decrease', function(amount) {
        state.life -= amount;
        if(state.life <= 0) {
            state.life = 0;
            eventbus.emit('game.over');
        }
    });

    eventbus.on('game.over', function() {
        if(onGameOver) {
            onGameOver();
        }
    });

    eventbus.on('game.win', function() {
        if(onGameWin) {
            onGameWin();
        }
    });
}

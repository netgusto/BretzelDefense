'use strict';

import eventbus from '../../Singleton/eventbus';

export default function({ state, economy, meleeSystem, spatialhash }) {
    eventbus.on('entity.death.batch', function(entities) {
        eventbus.emit('entity.untrack.batch', entities);

        for(let i = entities.length - 1; i >= 0; i--) {
            entities[i].die();
            if(entities[i].creep) {
                state.coins += economy.creepKillReward;
            }
        }
    });

    eventbus.on('entity.untrack.batch', function(entities) {
        const entityids = entities.map(entity => entity.id);
        meleeSystem.forfaitbatch(entityids);
        spatialhash.removebatch(entityids);
    });

    eventbus.on('entity.remove.batch', function(entities) {
        for(let i = entities.length - 1; i >= 0; i--) {
            entities[i].remove();
        }
    });
}

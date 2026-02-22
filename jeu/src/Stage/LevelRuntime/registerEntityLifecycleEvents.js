'use strict';

import eventbus from '../../Singleton/eventbus';

export default function({ state, economy, meleeSystem, spatialhash }) {
    const normalizeEntities = function(entities) {
        const source = Array.isArray(entities) ? entities : (entities ? [entities] : []);
        const normalized = [];
        const seen = {};

        for(let i = 0; i < source.length; i++) {
            const entity = source[i];
            if(!entity || entity.id === undefined || entity.id === null) {
                continue;
            }

            if(seen[entity.id]) {
                continue;
            }

            seen[entity.id] = true;
            normalized.push(entity);
        }

        return normalized;
    };

    const untrackEntities = function(entities) {
        const normalized = normalizeEntities(entities);
        if(normalized.length === 0) {
            return normalized;
        }

        const entityids = normalized.map(entity => entity.id);
        meleeSystem.forfaitbatch(entityids);
        spatialhash.removebatch(entityids);

        return normalized;
    };

    const removeEntities = function(entities) {
        const normalized = normalizeEntities(entities);

        for(let i = 0; i < normalized.length; i++) {
            const entity = normalized[i];
            if(entity._removed === true || entity._removing === true) {
                continue;
            }

            entity._removing = true;
            try {
                entity.remove();
            } finally {
                entity._removing = false;
            }
        }

        return normalized;
    };

    const despawnEntities = function(entities, { rewardCreeps = false, animateDeath = false } = {}) {
        const normalized = normalizeEntities(entities);
        const pending = [];

        for(let i = 0; i < normalized.length; i++) {
            const entity = normalized[i];
            if(entity._despawned === true) {
                continue;
            }

            entity._despawned = true;
            entity.dead = true;
            pending.push(entity);
        }

        if(pending.length === 0) {
            return pending;
        }

        untrackEntities(pending);

        if(rewardCreeps) {
            for(let i = 0; i < pending.length; i++) {
                if(pending[i].creep) {
                    state.coins += economy.creepKillReward;
                }
            }
        }

        if(animateDeath) {
            const directremove = [];

            for(let i = 0; i < pending.length; i++) {
                const entity = pending[i];
                if(typeof entity.die === 'function') {
                    entity.die();
                } else {
                    directremove.push(entity);
                }
            }

            removeEntities(directremove);
        } else {
            removeEntities(pending);
        }

        return pending;
    };

    eventbus.on('entity.despawn.batch', function(payload) {
        if(Array.isArray(payload)) {
            despawnEntities(payload);
            return;
        }

        const entities = payload && payload.entities ? payload.entities : [];
        despawnEntities(entities, {
            rewardCreeps: !!(payload && payload.rewardCreeps),
            animateDeath: !!(payload && payload.animateDeath)
        });
    });

    eventbus.on('entity.death.batch', function(entities) {
        despawnEntities(entities, {
            rewardCreeps: true,
            animateDeath: true
        });
    });

    eventbus.on('entity.untrack.batch', function(entities) {
        untrackEntities(entities);
    });

    eventbus.on('entity.remove.batch', function(entities) {
        removeEntities(entities);
    });

    return {
        despawnEntities,
        untrackEntities,
        removeEntities
    };
}

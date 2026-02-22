'use strict';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';

export default function({ state, economy, meleeSystem, spatialhash }) {
    const listeners = [];

    const on = function(name, handler) {
        eventbus.on(name, handler);
        listeners.push({ name, handler });
    };

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

    const onEntityDespawnBatch = function(payload) {
        if(Array.isArray(payload)) {
            despawnEntities(payload);
            return;
        }

        const entities = payload && payload.entities ? payload.entities : [];
        despawnEntities(entities, {
            rewardCreeps: !!(payload && payload.rewardCreeps),
            animateDeath: !!(payload && payload.animateDeath)
        });
    };

    const onEntityDeathBatch = function(entities) {
        despawnEntities(entities, {
            rewardCreeps: true,
            animateDeath: true
        });
    };

    const onEntityUntrackBatch = function(entities) {
        untrackEntities(entities);
    };

    const onEntityRemoveBatch = function(entities) {
        removeEntities(entities);
    };

    on(EVENTS.ENTITY_DESPAWN_BATCH, onEntityDespawnBatch);
    on(EVENTS.ENTITY_DEATH_BATCH, onEntityDeathBatch);
    on(EVENTS.ENTITY_UNTRACK_BATCH, onEntityUntrackBatch);
    on(EVENTS.ENTITY_REMOVE_BATCH, onEntityRemoveBatch);

    return {
        despawnEntities,
        untrackEntities,
        removeEntities,
        dispose() {
            for(let i = 0; i < listeners.length; i++) {
                eventbus.off(listeners[i].name, listeners[i].handler);
            }
            listeners.length = 0;
        }
    };
}

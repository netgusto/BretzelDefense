'use strict';

export default function({ eventbus }) {
    return {
        process(entities) {
            const deaths = [];
            for(let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if(!entity.dead && entity.maxlife && entity.life <= 0) {
                    deaths.push(entity);
                }
            }

            eventbus.emit('entity.death.batch', deaths);
        }
    };
}
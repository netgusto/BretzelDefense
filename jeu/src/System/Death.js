'use strict';

export default function({ eventbus }) {
    return {
        process(entities) {
            for(let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if(!entity.dead && entity.maxlife && entity.life <= 0) {
                    eventbus.emit('entity.death', entity);
                }
            }
        }
    };
}
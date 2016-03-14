'use strict';

export default function({ spatialhash }) {
    return {
        process(entities) {
            for(let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if(entity.maxlife && entity.life <= 0) {
                    spatialhash.remove(entity.id)
                    entity.remove();
                }
            }
        }
    };
}
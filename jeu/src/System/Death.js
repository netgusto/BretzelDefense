'use strict';

export default function({ spatialhash }) {
    return {
        process(entities) {
            for(let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if(!entity.dead && entity.maxlife && entity.life <= 0) {

                    // Physical presence of the entity is removed
                    spatialhash.remove(entity.id);

                    // Triggering death state
                    entity.die();
                }
            }
        }
    };
}
'use strict';

import eventbus from '../Singleton/eventbus';
import EVENTS from '../Singleton/events';

export default function() {
    return {
        process(entities) {
            const deaths = [];
            for(let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if(!entity.dead && entity.maxlife && entity.life <= 0) {
                    deaths.push(entity);
                }
            }

            if(deaths.length > 0) {
                eventbus.emit(EVENTS.ENTITY_DEATH_BATCH, deaths);
            }
        }
    };
}

'use strict';

export default function({ spatialhash }) {
    return {
        process(entities) {

            for(let i = 0; i < entities.length; i++) {
                if(!entities[i].spatialtrackable) continue;

                const entity = entities[i];
                const bounds = entity.displayobject.getBounds();
                spatialhash.update(
                    bounds.x,
                    bounds.y,
                    bounds.width,
                    bounds.height,
                    entity.id
                );
            }
        }
    };
}

'use strict';

export default function({ spatialhash }) {
    return {
        process(entities) {

            for(let i = 0; i < entities.length; i++) {
                if(!entities[i].spatialtrackable || entities[i].dead) continue;

                let trackpoint = entities[i].getSpatialTrackPoint();
                spatialhash.update(
                    trackpoint.x,
                    trackpoint.y,
                    entities[i].id
                );
            }
        }
    };
}

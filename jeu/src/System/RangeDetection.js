'use strict';

export default function({ onenter, onrange, onleave, spatialhash, onrangebulk = null }) {

    const matchbyid = new Array();

    return {
        process(entities) {
            for(let i = 0; i < entities.length; i++) {
                if(!entities[i].hunter) continue;
                const hunter = entities[i];
                const rangeCenterPoint = hunter.getRangeCenterPoint();
                const collisions = spatialhash.retrieve(rangeCenterPoint.x, rangeCenterPoint.y, hunter.range);
                const prevmatches = matchbyid[hunter.id] || [];
                const newmatches = [];
                const bulkmatches = [];

                let stablematchcount = 0;

                for(let k = 0; k < collisions.length; k++) {
                    const collision = collisions[k];
                    if(prevmatches.indexOf(collision.id) === -1) {
                        onenter(collision.entity, hunter, collision.distance);
                    } else {
                        stablematchcount++;
                    }

                    onrange(collision.entity, hunter, collision.distance);
                    newmatches.push(collision.id);
                    if(onrangebulk) bulkmatches.push({ entity: collision.entity, distance: collision.distance, centerx: collision.centerx, centery: collision.centery });
                }

                if(onrangebulk) {
                    onrangebulk(bulkmatches, hunter);
                }

                if(stablematchcount === prevmatches.length) {
                    if(prevmatches.length !== newmatches.length) {
                        delete matchbyid[hunter.id];
                        matchbyid[hunter.id] = newmatches;
                    }

                    continue;
                }

                for(let k = 0; k < prevmatches.length; k++) {
                    if(newmatches.indexOf(prevmatches[k]) === -1) {
                        onleave(prevmatches[k]);
                    }
                }

                delete matchbyid[hunter.id];
                matchbyid[hunter.id] = newmatches;
            }
        }
    };
}
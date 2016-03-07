'use strict';

export default class RangeDetection {

    constructor({ onenter, onrange, onleave, spatialhash, onrangebulk = null }) {
        this.matchbyid = new Array();
        this.onenter = onenter;
        this.onrange = onrange;
        this.onrangebulk = onrangebulk;
        this.onleave = onleave;
        this.spatialhash = spatialhash;
    }

    process(entities) {
        for(let i = 0; i < entities.length; i++) {
            if(!entities[i].hunter) continue;
            const hunter = entities[i];
            const collisions = this.spatialhash.retrieve(hunter.displayobject.x, hunter.displayobject.y, hunter.range);
            const prevmatches = this.matchbyid[hunter.id] || [];
            const newmatches = [];
            const bulkmatches = [];

            let stablematchcount = 0;

            for(let k = 0; k < collisions.length; k++) {
                const collision = collisions[k];
                if(prevmatches.indexOf(collision.id) === -1) {
                    this.onenter(collision.entity, hunter, collision.distance);
                } else {
                    stablematchcount++;
                }

                this.onrange(collision.entity, hunter, collision.distance);
                newmatches.push(collision.id);
                if(this.onrangebulk) bulkmatches.push({ entity: collision.entity, distance: collision.distance, centerx: collision.centerx, centery: collision.centery });
            }

            if(this.onrangebulk) {
                this.onrangebulk(bulkmatches, hunter);
            }

            if(stablematchcount === prevmatches.length) {
                if(prevmatches.length !== newmatches.length) {
                    delete this.matchbyid[hunter.id];
                    this.matchbyid[hunter.id] = newmatches;
                }

                continue;
            }

            for(let k = 0; k < prevmatches.length; k++) {
                if(newmatches.indexOf(prevmatches[k]) === -1) {
                    this.onleave(prevmatches[k]);
                }
            }

            delete this.matchbyid[hunter.id];
            this.matchbyid[hunter.id] = newmatches;
        }
    }
}
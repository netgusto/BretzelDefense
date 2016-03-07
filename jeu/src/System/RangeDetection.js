'use strict';

export default class RangeDetection {

    constructor({ onenter, onrange, onleave, spatialhash }) {
        this.matchbyid = new Array();
        this.onenter = onenter;
        this.onrange = onrange;
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

            let stablematchcount = 0;

            for(let k = 0; k < collisions.length; k++) {
                const collision = collisions[k];
                if(prevmatches.indexOf(collision.id) === -1) {
                    this.onenter(collision.entity, hunter, collision.distance);
                } else {
                    this.onrange(collision.entity, hunter, collision.distance);
                    stablematchcount++;
                }

                newmatches.push(collision.id);
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
'use strict';

export default function() {

    const pendingfight = [];
    const infight = [];
    const infightids = [];
    const speedperms = 50/1000;

    return {
        isEngaged(entity) {
            return infightids.indexOf(entity.id) > -1;
        },
        fight({ hunter, creep }) {
            pendingfight.push({
                hunter,
                creep
            });
        },
        process(entities, { deltatime }) {

            while(pendingfight.length) {
                const fightprops = pendingfight.pop();
                const { hunter, creep } = fightprops;

                infightids.push(hunter.id);
                infightids.push(creep.id);
                infight.push(fightprops);

                creep.engageSoldier(hunter);
            }

            for(let i = infight.length-1; i >= 0; --i) {
                const fightprops = infight[i];
                const { hunter, creep } = fightprops;

                let offset;

                // Calculating vector between creep fight position (creep.x +/- 20, creep.y) and hunter position
                if(creep.displayobject.x > hunter.displayobject.x) {
                    offset = -20;   // fight on the left side of the creep
                } else {
                    offset = 20;   // fight on the right side of the creep
                }

                const fightpoint = { x: creep.displayobject.x + offset, y: creep.displayobject.y };
                const vec = [fightpoint.x - hunter.displayobject.x, fightpoint.y - hunter.displayobject.y];
                const distance = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));

                if(distance > 1) {
                    const normalizedvec = distance !== 0 ? [vec[0] / distance, vec[1] / distance] : [vec[0], vec[1]];
                    const displacementthisround = deltatime * speedperms;
                    const nextx = hunter.displayobject.x + (normalizedvec[0] * displacementthisround);
                    const nexty = hunter.displayobject.y + (normalizedvec[1] * displacementthisround);
                    hunter.setPosition(nextx, nexty);
                }
            }
        }
    };
}
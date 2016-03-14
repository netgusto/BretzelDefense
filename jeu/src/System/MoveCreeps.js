'use strict';

export default function() {
    return {
        process(entities, { deltatime }) {

            for(let i = 0; i < entities.length; i++) {

                if(!entities[i].creep) continue;

                const creep = entities[i];

                const newpos = creep.lane.getPointAtLengthLoop(creep.pixelswalked);
                const prevpos = creep.prevpos;

                // On détermine la direction du mouvement

                let left = false, right = false;
                if(newpos.x > prevpos.x) {
                    right = true
                } else if(newpos.x < prevpos.x) {
                    left = true;
                }

                if(left) {
                    creep.displayobject.scale.x = Math.abs(creep.displayobject.scale.x) * -1;
                } else if(right) {
                    creep.displayobject.scale.x = Math.abs(creep.displayobject.scale.x);
                }

                creep.setPosition(newpos.x, newpos.y);
                creep.prevpos = newpos;
                creep.pixelswalked += deltatime * creep.velocitypermillisecond;
            }
        }
    };
}

'use strict';

import eventbus from '../Singleton/eventbus';

export default function() {
    return {
        process(entities, { deltatime }) {

            for(let i = 0; i < entities.length; i++) {

                if(!entities[i].creep) continue;
                if(entities[i].dead) continue;

                const creep = entities[i];
                if(creep.pixelswalked > creep.lane.pathlength) {
                    eventbus.emit('creep.succeeded', { creep });
                    continue;
                }

                const newpos = creep.lane.getPointAtLength(creep.pixelswalked);
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

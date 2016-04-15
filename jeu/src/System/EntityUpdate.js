'use strict';

export default function() {
    return {
        process(entities, { deltatime }) {
            for(let i = 0; i < entities.length; i++) {
                if('update' in entities[i]) entities[i].update(deltatime);
            }
        }
    };
}
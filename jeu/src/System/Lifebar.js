'use strict';

import { Graphics } from 'pixi.js';
import GenericEntity from '../Entity/Generic';

export default function({ layer }) {

    // Lifebar
    const lifebarwidth = 16;
    const lifebarheight = 2;
    const halfwidth = lifebarwidth/2;
    const lifebar = new Graphics();
    layer.addEntity(GenericEntity({
        displayobject: lifebar
    }));

    return {
        process(entities) {

            lifebar.clear();
            for(let i = 0; i < entities.length; i++) {

                if(!entities[i].maxlife) continue;

                const maxlife = entities[i].maxlife;
                const life = entities[i].life;
                const displayobject = entities[i].displayobject;

                const xstart = displayobject.x - halfwidth;
                const xend = displayobject.x + halfwidth;
                const y = displayobject.y - displayobject.height - 3;

                lifebar.lineStyle(lifebarheight, 0x62AA21);
                lifebar.moveTo(xstart, y);
                lifebar.lineTo(xend, y);

                lifebar.lineStyle(lifebarheight, 0xC32427);
                lifebar.moveTo(xstart + Math.ceil((life/maxlife)*lifebarwidth), y);
                lifebar.lineTo(xend, y);
            }
        }
    };
}
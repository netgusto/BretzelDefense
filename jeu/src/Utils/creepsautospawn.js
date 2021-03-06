'use strict';

import Mummy from '../Entity/Mummy';

export default function({ layer, resolution, spatialhash, lanes, vps, frequency }) {
    // Vagues de creeps
    let mummyindex = 0;

    window.setInterval(function() {
        if(layer.entities.length >= 100) return;

        const mummy = Mummy({
            worldscale: resolution.worldscale
        })
            .setVelocityPerSecond((vps + Math.floor(Math.random() * 50)) * resolution.worldscale);
        layer.addEntity(mummy);
        mummy.creep = true;
        mummy.lane = lanes[mummyindex % lanes.length];
        mummy.prevpos = { x: 0, y: 0 };
        mummy.pixelswalked = 0;
        mummy.matchcount = 0;
        mummy.maxlife = 100;
        mummy.life = mummy.maxlife;

        mummyindex++;

        const bounds = mummy.displayobject.getBounds();
        spatialhash.insert(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            mummy.id,
            mummy
        );
    }, frequency);
}

'use strict';

import { vec2 } from 'gl-matrix';

export default class Ballistic {

    constructor({ container }) {
        this.container = container;
        this.pendinglaunch = [];
        this.inflight = [];
        this.inflightbyid = {};
    }

    fire(projectileprops) {
        projectileprops.speedperms = projectileprops.speed / 1000;
        this.pendinglaunch.push(projectileprops);
    }

    process(entities, { deltatime }) {
        while(this.pendinglaunch.length) {
            const projectileprops = this.pendinglaunch.pop();
            this.container.addChild(projectileprops.displayobject);
            this.inflight.push(projectileprops);

            if(projectileprops.target.id in this.inflightbyid) {
                this.inflightbyid[projectileprops.target.id]++;
                console.log(projectileprops.target.id, this.inflightbyid);
            } else {
                this.inflightbyid[projectileprops.target.id] = 1;
            }
        }

        const hits = []
        for(let i = 0; i < this.inflight.length; i++) {

            const veclength = deltatime * speedperms;

            const { target, displayobject, speedperms } = this.inflight[i];
            const bounds = target.displayobject.getBounds();

            const targetx = (bounds.x + bounds.width/2)|0;
            const targety = (bounds.y + bounds.height/2)|0;

            const bulletx = displayobject.x;
            const bullety = displayobject.y;

            const distance = vec2.distance([bulletx, bullety], [targetx, targety]);
            let nextx, nexty;

            if(distance <= veclength || distance < 3) {
                nextx = targetx;
                nexty = targety;
                hits.push(i);
            } else {
                const normvec = vec2.normalize({}, [targetx-bulletx, targety-bullety]);
                nextx = bulletx + (normvec[0] || 0) * deltatime * speedperms;
                nexty = bullety + (normvec[1] || 0) * deltatime * speedperms;
            }

            displayobject.rotation = Math.atan2(bullety-nexty,bulletx-nextx) + 2 * Math.PI;
            displayobject.position.set(nextx, nexty);
        }

        const inflightdelete = [];

        for(let i = 0; i < hits.length; i++) {
            const hit = this.inflight[hits[i]];
            if(!hit) continue;

            if(this.inflightbyid[hit.target.id] === 0) {
                this.inflight.splice(hits[i], 1);
                if(hit.displayobject) {
                    this.container.removeChild(hit.displayobject);
                }

                inflightdelete.push(hit.target.id);
            } else {
                this.inflightbyid[hit.target.id] = this.inflightbyid[hit.target.id] - 1;
            }

            hit.target.life -= hit.damage;
            if(hit.target.life < 0) hit.target.life = 0;
        }

        for(let i = 0; i < inflightdelete.length; i++) {
            this.inflightbyid[inflightdelete[i]] = 0;
        }
    }
}
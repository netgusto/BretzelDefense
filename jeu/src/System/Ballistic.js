'use strict';

//import { vec2 } from 'gl-matrix';

import { Graphics } from 'pixi.js';

export default class Ballistic {

    constructor({ container }) {
        this.container = container;
        this.debuggraphics = new Graphics();
        this.debuggraphics.lineStyle(1, 0xFF0000);
        this.container.addChild(this.debuggraphics);
        this.pendinglaunch = [];
        this.inflight = [];
    }

    fire(projectileprops) {
        this.pendinglaunch.push(projectileprops);
    }

    process(entities, { deltatime }) {

        const now = performance.now();

        while(this.pendinglaunch.length) {

            const projectileprops = this.pendinglaunch.pop();

            if(!projectileprops.homing) {
                // Predictive
                // On détermine la position supposée de la cible en T+flightduration

                const { target, hunter, flightduration } = projectileprops;
                const targetpixelswalkedwhenprojectilehits = target.pixelswalked + (target.walk.velocityms * flightduration);

                const pointatlength = target.lane.getPointAtLengthLoop(targetpixelswalkedwhenprojectilehits);
                const predictiveimpact = [pointatlength.x, pointatlength.y - (target.displayobject.height / 2)];
                projectileprops.predictiveimpact = predictiveimpact;

                if(projectileprops.parabolic) {

                    const startpoint = [projectileprops.displayobject.x, projectileprops.displayobject.y];

                    const aimvec = [predictiveimpact[0] - startpoint[0], predictiveimpact[1] - startpoint[1]];
                    const vertexbasepoint = [startpoint[0] + aimvec[0]/2, startpoint[1] + aimvec[1]/2];
                    const vertexapex = [vertexbasepoint[0], vertexbasepoint[1] - hunter.displayobject.height - projectileprops.parabolicapex];  // 120: hauteur de l'apex  // ajout de la hauteur de la tour pour viser vers le haut

                    projectileprops.parabolicstart = startpoint;
                    projectileprops.parabolicvertex = vertexapex;
                    projectileprops.parabolicend = [predictiveimpact[0], predictiveimpact[1]];

                    projectileprops.parabolicwidth = aimvec[0];
                }
            }

            projectileprops.firetime = now;
            this.inflight.push(projectileprops);
            this.container.addChild(projectileprops.displayobject);
        }

        //console.log('LENGTH', this.inflight.length);

        const hits = [];
        for(let i = this.inflight.length-1; i > 0; --i) {  // reverse order to allow splice while looping below

            const projectileprops = this.inflight[i];
            const { target, displayobject, orient, homing, firetime, flightduration, parabolic } = projectileprops;
            const bounds = target.displayobject.getBounds();

            const elapsedtime = now - firetime;
            const remainingtime = flightduration - elapsedtime;

            let targetx = (bounds.x + bounds.width/2);
            let targety = (bounds.y + bounds.height/2);

            let aimx, aimy;

            if(homing) {
                // homing
                aimx = targetx;
                aimy = targety;
            } else {
                // predictive
                aimx = projectileprops.predictiveimpact[0];
                aimy = projectileprops.predictiveimpact[1];
            }

            const bulletx = displayobject.x;
            const bullety = displayobject.y;

            let nextx, nexty;

            //console.log(projectileprops.uniqid, remainingtime);

            if(remainingtime <= deltatime) {

                // Distance from target to aimed point
                const aimtargetvec = [targetx-aimx, targety-aimy];
                const aimtargetdistancesquared = Math.pow(aimtargetvec[0], 2) + Math.pow(aimtargetvec[1], 2);

                if(aimtargetdistancesquared > 25) { // 25 = 5^2 = 5 px radius
                    hits.push({ index: i, missed: true });
                } else {
                    hits.push({ index: i, missed: false });
                }

                nextx = targetx;
                nexty = targety;
            } else {

                // Distance from bullet to aimed point
                const aimvec = [aimx-bulletx, aimy-bullety];
                const aimdistance = Math.sqrt(Math.pow(aimvec[0], 2) + Math.pow(aimvec[1], 2));

                const speedperms = aimdistance / remainingtime;
                const displacementthisround = deltatime * speedperms;

                const normalizedaimvec = aimdistance !== 0 ? [aimvec[0] / aimdistance, aimvec[1] / aimdistance] : [aimvec[0], aimvec[1]];

                nextx = bulletx + (normalizedaimvec[0] * displacementthisround);

                if(parabolic) {
                    const { parabolicstart, parabolicvertex, parabolicend, parabolicwidth } = projectileprops;
                    //this.debuggraphics.moveTo(parabolicstart[0], parabolicstart[1]);
                    //this.debuggraphics.quadraticCurveTo(parabolicvertex[0], parabolicvertex[1], parabolicend[0], parabolicend[1]);

                    const relativex = nextx-parabolicstart[0];
                    const fromY = parabolicstart[1];
                    const cpY = parabolicvertex[1];
                    const toY = parabolicend[1];

                    let j = relativex / parabolicwidth;
                    let ya = fromY + ((cpY - fromY) * j);
                    nexty = ya + (((cpY + ((toY - cpY) * j)) - ya) * j);
                } else {
                    nexty = bullety + (normalizedaimvec[1] * displacementthisround);
                }

                if(orient) {
                    displayobject.rotation = Math.atan2(bullety - nexty, bulletx - nextx);
                }
            }

            displayobject.position.set(nextx, nexty);
        }

        for(let i = 0; i < hits.length; i++) {

            const hitinfo = hits[i];
            const projectileprops = this.inflight[hitinfo.index];

            if(hitinfo.missed) {
                projectileprops.hunter.ballisticMiss(projectileprops);
            } else {
                projectileprops.hunter.ballisticHit(projectileprops);
                //projectileprops.target.life -= projectileprops.damage;
                //if(projectileprops.target.life < 0) projectileprops.target.life = 0;
            }

            //this.container.removeChild(projectileprops.displayobject);
            this.inflight.splice(hitinfo.index, 1);
        }
    }
}
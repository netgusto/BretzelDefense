'use strict';

export default function({ layer }) {

    const pendinglaunch = [];
    const inflight = [];

    return {
        fire(projectileprops) {
            pendinglaunch.push(projectileprops);
        },

        process(entities, { worldscale, deltatime, timescale }) {

            const now = performance.now();

            while(pendinglaunch.length) {

                const projectileprops = pendinglaunch.pop();

                if(!projectileprops.homing) {
                    // Predictive
                    // On détermine la position supposée de la cible en T+flightduration

                    const { target, hunter, flightduration } = projectileprops;
                    const targetpixelswalkedwhenprojectilehits = target.pixelswalked + (target.velocitypermillisecond * flightduration * timescale);

                    const pointatlength = target.lane.getPointAtLength(targetpixelswalkedwhenprojectilehits);
                    const predictiveimpact = [pointatlength.x + target.offsetx, pointatlength.y - (target.displayobject.height / 2) + target.offsety];    // tir au centre vertical de la cible
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
                inflight.push(projectileprops);
                layer.addChild(projectileprops.displayobject);
            }

            const hits = [];
            for(let i = inflight.length-1; i >= 0; --i) {  // reverse order to allow splice while looping below

                const projectileprops = inflight[i];
                const { target, displayobject, orient, homing, firetime, flightduration, parabolic } = projectileprops;
                const bounds = target.displayobject.getBounds();

                const elapsedtime = (now - firetime) * timescale;
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

                    if(aimtargetdistancesquared > (64 * worldscale)) { // 64 = 8^2 = 8 px radius
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
                const projectileprops = inflight[hitinfo.index];

                if(hitinfo.missed) {
                    projectileprops.hunter.ballisticMiss(projectileprops);
                } else {
                    projectileprops.hunter.ballisticHit(projectileprops);
                }

                inflight.splice(hitinfo.index, 1);
            }
        }
    };
}
'use strict';

//import { vec2 } from 'gl-matrix';

import { Graphics } from 'pixi.js';

export default class Ballistic {

    constructor({ container }) {
        this.container = container;
        this.debuggraphics = new Graphics();
        this.debuggraphics.lineStyle(2, 0xFF0000);
        this.container.addChild(this.debuggraphics);
        this.pendinglaunch = [];
        this.inflight = [];
    }

    fire(projectileprops) {
        this.pendinglaunch.push(projectileprops);
    }

    process(entities, { deltatime }) {
        while(this.pendinglaunch.length) {

            const projectileprops = this.pendinglaunch.pop();

            if(!projectileprops.homing) {
                // Predictive
                // On détermine la position supposée de la cible en T+flightduration

                const { target, hunter } = projectileprops;
                const targetspeedperms = target.walk.velocityms;
                const targetpixelswalked = target.pixelswalked;
                const targetpixelswalkedwhenprojectilehits = targetpixelswalked + (targetspeedperms * projectileprops.flightduration);

                const { x: predictivex, y: predictivey } = target.lane.getPointAtLengthLoop(targetpixelswalkedwhenprojectilehits);
                projectileprops.predictiveimpact = { x: predictivex, y: predictivey - 10 };

                if(projectileprops.parabolic) {

                    const startpoint = [projectileprops.displayobject.x, projectileprops.displayobject.y];

                    const aimvec = [projectileprops.predictiveimpact.x-startpoint[0], projectileprops.predictiveimpact.y-startpoint[1]];
                    const vertexbasepoint = [startpoint[0] + aimvec[0]/2, startpoint[1] + aimvec[1]/2];
                    const vertexapex = [vertexbasepoint[0], vertexbasepoint[1] - hunter.displayobject.height - projectileprops.parabolicapex];  // 120: hauteur de l'apex  // ajout de la hauteur de la tour pour viser vers le haut

                    projectileprops.parabolicstart = startpoint;
                    projectileprops.parabolicvertex = vertexapex;
                    projectileprops.parabolicend = [projectileprops.predictiveimpact.x, projectileprops.predictiveimpact.y];

                    projectileprops.parabolicstartzero = [0, 0];
                    projectileprops.parabolicvertexzero = [vertexapex[0]-startpoint[0], vertexapex[1] - startpoint[1]];
                    projectileprops.parabolicendzero = aimvec;

                    projectileprops.parabolicwidth = projectileprops.parabolicendzero[0] - projectileprops.parabolicstartzero[0];
                }
            }

            projectileprops.firetime = performance.now();

            this.inflight.push(projectileprops);

            this.container.addChild(projectileprops.displayobject);
        }

        //console.log('LENGTH', this.inflight.length);

        const hits = []
        for(let i = this.inflight.length-1; i >= 0; i--) {  // reverse order to allow splice while looping below

            const projectileprops = this.inflight[i];
            const { target, displayobject, orient, homing, firetime, flightduration, parabolic } = projectileprops;
            const bounds = target.displayobject.getBounds();

            const elapsedtime = performance.now() - firetime;
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
                const { predictiveimpact } = projectileprops;
                aimx = predictiveimpact.x;
                aimy = predictiveimpact.y;
            }

            const bulletx = displayobject.x;
            const bullety = displayobject.y;

            const aimvec = [aimx-bulletx, aimy-bullety];
            const aimdistance = Math.sqrt(Math.pow(aimvec[0], 2) + Math.pow(aimvec[1], 2));

            const speedperms = aimdistance / remainingtime;
            const displacementthisround = deltatime * speedperms;
            let nextx, nexty;

            //console.log(projectileprops.uniqid, remainingtime);

            if(remainingtime <= deltatime) {
                const aimtargetvec = [targetx-aimx, targety-aimy];
                const aimtargetdistance = Math.sqrt(Math.pow(aimtargetvec[0], 2) + Math.pow(aimtargetvec[1], 2));
                if(aimtargetdistance > 5) {
                    console.log('missed !!!', aimtargetdistance)
                    hits.push({ index: i, missed: true });
                } else {
                    hits.push({ index: i, missed: false });
                }
            } else {

                const normalizedaimvec = aimdistance !== 0 ? [aimvec[0] / aimdistance, aimvec[1] / aimdistance] : [aimvec[0], aimvec[1]];

                nextx = bulletx + (normalizedaimvec[0] * displacementthisround);
                if(parabolic) {

                    const { parabolicstart, parabolicstartzero, parabolicvertex, parabolicvertexzero, parabolicend, parabolicleadcoeffa, parabolicwidth } = projectileprops;
                    //this.debuggraphics.moveTo(parabolicstart[0], parabolicstart[1]);
                    //this.debuggraphics.quadraticCurveTo(parabolicvertex[0], parabolicvertex[1], parabolicend[0], parabolicend[1]);

                    const relativex = nextx-parabolicstart[0];
                    const fromY = parabolicstart[1];
                    const cpY = parabolicvertex[1];
                    const toY = parabolicend[1];

                    let j = relativex / parabolicwidth;

                    let ya = fromY + ( (cpY - fromY) * j );
                    nexty = ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j );
                } else {
                    nexty = bullety + (normalizedaimvec[1] * displacementthisround);
                }

                //console.log(nexty);

                if(orient) {
                    displayobject.rotation = Math.atan2(bullety-nexty, bulletx-nextx) + (2 * Math.PI);
                }
            }

            displayobject.position.set(nextx, nexty);
        }

        const inflightdelete = [];

        for(let i = 0; i < hits.length; i++) {

            const hitinfo = hits[i];
            const projectileprops = this.inflight[hitinfo.index];

            if(!hitinfo.missed) {
                projectileprops.target.life -= projectileprops.damage;
                if(projectileprops.target.life < 0) projectileprops.target.life = 0;
            }

            inflightdelete.push(hitinfo.index);
        }

        for(let i = 0; i < inflightdelete.length; i++) {
            const projectileprops = this.inflight[inflightdelete[i]];
            this.container.removeChild(projectileprops.displayobject);
            this.inflight.splice(inflightdelete[i], 1);
        }
    }
}
'use strict';

export default function() {

    const pendingfight = [];
    const infight = [];

    const pendingrelease = [];
    const pendingreleaseindexes = [];
    let inrepositionhunter = [];

    return {
        isEngaged(creep) {
            return creep.melecount > 0;
        },
        fight({ hunter, creep }) {
            pendingfight.push({
                hunter,
                creep
            });
        },
        forfait(entityids) {
            for(let entityindex = 0; entityindex < entityids.length; entityindex++) {
                const entityid = entityids[entityindex];

                for(let i = infight.length-1; i >= 0; i--) {    // reverse order to allow splice while looping below

                    if(infight[i].creep.id !== entityid && infight[i].hunter.id !== entityid) continue;

                    if(pendingreleaseindexes.indexOf(i) > -1) continue;
                    pendingreleaseindexes.push(i);

                    const { hunter, creep } = infight[i];

                    if(hunter.id === entityid) {
                        // hunter died
                        // check if creep died too
                        let creepforfait = (entityids.indexOf(creep.id) > -1);
                        pendingrelease.push({ fightindex: i, hunterforfait: true, creepforfait });
                    } else {
                        // creep died
                        let hunterforfait = (entityids.indexOf(hunter.id) > -1);
                        pendingrelease.push({ fightindex: i, hunterforfait, creepforfait: true });
                    }
                }
            }
        },
        process(entities, { deltatime }) {

            /*****************************************************************/
            /* On traite les libérations                                     */
            /*****************************************************************/

            const creepsreleased = [];
            const huntersreleased = [];

            // sorting pendingrelease descending on fightindex (order scrambled by forfait, following the order of the given entityids batch)
            pendingrelease.sort(function(a, b) {
                return b.fightindex - a.fightindex;
            });

            for(let i = 0; i < pendingrelease.length; i++) {

                const { fightindex, hunterforfait, creepforfait } = pendingrelease[i];
                const { creep, hunter } = infight[fightindex];

                infight.splice(fightindex, 1);

                if(hunterforfait) {
                    creepsreleased.push(creep);
                }

                if(creepforfait) {
                    huntersreleased.push(hunter);
                }
            }

            pendingrelease.length = 0;
            pendingreleaseindexes.length = 0;

            for(let i = 0; i < creepsreleased.length; i++) {
                // On vérifie que le creep n'est pas encore engagé par ailleurs
                // TODO: perf optim by keeping local indexes of number of engagement per entity
                const creep = creepsreleased[i];
                if(!this.isEngaged(creep)) creep.releaseMelee();
            }

            for(let i = 0; i < huntersreleased.length; i++) {
                const hunter = huntersreleased[i];
                inrepositionhunter.push(hunter);
                // Pas nécessaire de vérifier les engagements résiduels éventuels
                // Un hunter ne peut être engagé qu'avec un seul creep à la fois puisque c'est toujours le hunter qui engage le creep
                hunter.releaseMelee();
            }

            /*****************************************************************/
            /* On prend en compte les nouveaux engagements                   */
            /*****************************************************************/

            while(pendingfight.length) {
                const fightprops = pendingfight.pop();
                const { hunter, creep } = fightprops;
                infight.push(fightprops);
                creep.engageMelee(hunter);
                // On retire le hunter des repositionnements en cours s'il s'y trouve référencé
                inrepositionhunter = inrepositionhunter.filter(item => item.id !== hunter.id);
            }

            /*****************************************************************/
            /* On déplace les hunters en cours de repositionnement           */
            /*****************************************************************/

            const achievedinrepositions = [];

            for(let i = 0; i < inrepositionhunter.length; i++) {
                const hunter = inrepositionhunter[i];
                const vec = [hunter.rallypoint.x - hunter.displayobject.x, hunter.rallypoint.y - hunter.displayobject.y];
                const distance = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
                if(distance > 1) {
                    const normalizedvec = distance !== 0 ? [vec[0] / distance, vec[1] / distance] : [vec[0], vec[1]];
                    const displacementthisround = deltatime * hunter.speedperms;
                    const nextx = hunter.displayobject.x + (normalizedvec[0] * displacementthisround);
                    const nexty = hunter.displayobject.y + (normalizedvec[1] * displacementthisround);
                    hunter.setPosition(nextx, nexty);
                } else {
                    achievedinrepositions.push(i);
                }
            }

            while(achievedinrepositions.length) {
                // reverse loop to allow for splice
                const achievedindex = achievedinrepositions.pop()
                inrepositionhunter.splice(achievedindex, 1);
            }


            /*****************************************************************/
            /* On traite les engagements en cours                            */
            /*****************************************************************/
            console.log('INFIGHT', infight.length);

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
                    const displacementthisround = deltatime * hunter.speedperms;
                    const nextx = hunter.displayobject.x + (normalizedvec[0] * displacementthisround);
                    const nexty = hunter.displayobject.y + (normalizedvec[1] * displacementthisround);
                    hunter.setPosition(nextx, nexty);
                } else {
                    hunter.fightMelee(creep);
                    creep.fightMelee(hunter);
                }
            }
        }
    };
}
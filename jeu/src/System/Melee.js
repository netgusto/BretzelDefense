'use strict';

const closestsort = function(a, b) {
    return a.distance - b.distance
};

export default function() {

    const pendingfight = [];
    const infight = [];

    const creepforhunter = {};
    const huntersbycreep = {};

    const pendingrelease = [];
    const pendingreleaseindexes = [];
    let inrepositionhunter = [];

    return {
        isCreepEngaged(creep) {
            return creep.id in huntersbycreep;
        },
        isHunterEngaged(hunter) {
            return hunter.id in creepforhunter;
        },
        fight({ hunter, creep }) {
            pendingfight.push({
                hunter,
                creep
            });
        },
        selectForEngagement(hunter, matches) {

            let newcreep = null;

            if(this.isHunterEngaged(hunter)) {
                const currentcreepid = creepforhunter[hunter.id];
                const hunterrankforthiscreep = huntersbycreep[currentcreepid].indexOf(hunter.id);
                //console.log({ huntersbycreep, hunterrankforthiscreep, huntersbycreep, currentcreepid });
                if(hunterrankforthiscreep > 0) {

                    // Not the first hunter on this creep
                    // Let's see if we can block an unengaged creep in our range
                    const unengaged = matches.filter(match => !this.isCreepEngaged(match.entity));
                    if(!unengaged.length) return null;

                    unengaged.sort(closestsort);
                    newcreep = unengaged[0].entity;

                    huntersbycreep[currentcreepid].splice(hunterrankforthiscreep, 1);
                    if(huntersbycreep[currentcreepid].length === 0) delete huntersbycreep[currentcreepid];
                    delete creepforhunter[hunter.id];

                    for(let i = 0; i < infight.length; i++) {
                        if(infight[i].hunter.id === hunter.id && infight[i].creep.id === currentcreepid) {
                            pendingrelease.push({ fightindex: i, hunterforfait: false, creepforfait: false });
                            break;
                        }
                    }

                    //console.log('SWITCH !', hunter.id, currentcreepid, hunterrankforthiscreep);
                } else {
                    return null;
                }
            } else {
                matches.sort(closestsort);
                newcreep = matches[0].entity;
            }

            // Indexes bookkeeping

            if(!(newcreep.id in huntersbycreep)) huntersbycreep[newcreep.id] = new Array();
            huntersbycreep[newcreep.id].push(hunter.id);
            creepforhunter[hunter.id] = newcreep.id;
            //console.log(creepforhunter);

            return newcreep;
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

                    huntersbycreep[creep.id].splice(huntersbycreep[creep.id].indexOf(hunter.id), 1);
                    if(huntersbycreep[creep.id].length === 0) delete huntersbycreep[creep.id];
                    delete creepforhunter[hunter.id];

                    //console.log(huntersbycreep);
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

            // Indexes bookkeeping

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
                if(!this.isCreepEngaged(creep)) creep.releaseMelee();
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

                // Indexes bookkeeping

                // if(!(creep.id in huntersbycreep)) huntersbycreep[creep.id] = new Array();
                // huntersbycreep[creep.id].push(hunter.id);
                // creepforhunter[hunter.id] = creep.id;
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
            //console.log('INFIGHT', infight.length);

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
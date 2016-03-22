'use strict';

const closestsort = function(a, b) {
    return a.distance - b.distance;
};

const fightindexsort = function(a, b) {
    return b.fightindex - a.fightindex;
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
        repositionHunter(hunter) {
            inrepositionhunter.push(hunter);
        },
        selectForEngagement(hunter, matches) {

            if(matches.length === 0) return null;

            let newcreep = null;

            if(this.isHunterEngaged(hunter)) {

                // The hunter is already engaged; let's see if we can collaboratively maximize the number of intercepted creeps

                const currentcreepid = creepforhunter[hunter.id];
                const hunterrankforthiscreep = huntersbycreep[currentcreepid].indexOf(hunter.id);

                if(hunterrankforthiscreep > 0) {

                    // Not the first hunter on this creep
                    // Let's see if we can block an unengaged creep in our range

                    const unengaged = matches.filter(match => !this.isCreepEngaged(match.entity));
                    if(!unengaged.length) return null;  // Nope ! Keeping the engagement to the current creep

                    unengaged.sort(closestsort);
                    newcreep = unengaged[0].entity; // Yep ! Let's switch to the closest unengaged creep

                    // Releasing the engagement between the hunter and its current creep
                    huntersbycreep[currentcreepid].splice(hunterrankforthiscreep, 1);
                    if(huntersbycreep[currentcreepid].length === 0) delete huntersbycreep[currentcreepid];
                    delete creepforhunter[hunter.id];

                    for(let i = 0; i < infight.length; i++) {
                        if(infight[i].hunter.id === hunter.id && infight[i].creep.id === currentcreepid) {
                            pendingrelease.push({ fightindex: i, hunterforfait: false, creepforfait: false });
                            break;
                        }
                    }
                } else {
                    // Hunter is not ranked on this creep interception; should not happen
                    return null;
                }
            } else {
                // Hunter is not yet engaged; let's engage the closest creep
                matches.sort(closestsort);
                newcreep = matches[0].entity;
            }

            // Referencing the engagement between the hunter and the creep

            if(!(newcreep.id in huntersbycreep)) huntersbycreep[newcreep.id] = new Array();
            huntersbycreep[newcreep.id].push(hunter.id);
            creepforhunter[hunter.id] = newcreep.id;

            return newcreep;
        },
        forfait(entityids) {
            // Processed as a batch to handle case when both hunter and creep die at the same time
            for(let entityindex = 0; entityindex < entityids.length; entityindex++) {
                const entityid = entityids[entityindex];

                for(let i = 0; i < infight.length; i++) {

                    if(infight[i].creep.id !== entityid && infight[i].hunter.id !== entityid) continue;

                    if(pendingreleaseindexes.indexOf(i) > -1) continue;
                    pendingreleaseindexes.push(i);

                    const { hunter, creep } = infight[i];

                    if(hunter.id === entityid) {
                        // hunter died; check if creep died too
                        let creepforfait = (entityids.indexOf(creep.id) > -1);
                        pendingrelease.push({ fightindex: i, hunterforfait: true, creepforfait });
                    } else {
                        // creep died; check if hunter died too
                        let hunterforfait = (entityids.indexOf(hunter.id) > -1);
                        pendingrelease.push({ fightindex: i, hunterforfait, creepforfait: true });
                    }

                    // Releasing the engagement between the hunter and its creep
                    huntersbycreep[creep.id].splice(huntersbycreep[creep.id].indexOf(hunter.id), 1);
                    if(huntersbycreep[creep.id].length === 0) delete huntersbycreep[creep.id];
                    delete creepforhunter[hunter.id];
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
            pendingrelease.sort(fightindexsort);

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

                infight.push(fightprops);

                fightprops.creep.engageMelee(fightprops.hunter);

                // On retire le hunter des repositionnements en cours s'il s'y trouve référencé
                inrepositionhunter = inrepositionhunter.filter(item => item.id !== fightprops.hunter.id);
            }

            /*****************************************************************/
            /* On déplace les hunters en cours de repositionnement           */
            /*****************************************************************/

            const achievedinrepositions = [];

            for(let i = 0; i < inrepositionhunter.length; i++) {
                const hunter = inrepositionhunter[i];
                const vec = [hunter.rallypoint.x - hunter.displayobject.x, hunter.rallypoint.y - hunter.displayobject.y];
                const distancesquared = Math.pow(vec[0], 2) + Math.pow(vec[1], 2);
                if(distancesquared > 1) {

                    const distance = Math.sqrt(distancesquared);
                    const normalizedvec = distance !== 0 ? [vec[0] / distance, vec[1] / distance] : [vec[0], vec[1]];
                    const displacementthisround = deltatime * hunter.speedperms;

                    const prevx = hunter.displayobject.x;
                    const prevy = hunter.displayobject.y;

                    const nextx = prevx + (normalizedvec[0] * displacementthisround);
                    const nexty = prevy + (normalizedvec[1] * displacementthisround);

                    if(prevx < nextx) {
                        console.log('RIGHT');
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x);
                    } else if(prevx > nextx) {
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x) * -1;
                        console.log('LEFT');
                    } else {
                        // pas de changement de direction
                    }

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

                // Determining fight position
                // * if creep unengaged, pick the closest point between the hunter and the left and right sides of the creep
                // * if creep engaged, pick the side the creep is already fighting

                let offset = (creep.displayobject.width / 2) + 5;   // 5px: margin
                let side = 1;   // 1: right, -1: left

                if(this.isCreepEngaged(creep) && huntersbycreep[creep.id].length > 1) {
                    if(creep.displayobject.scale.x < 0) {
                        side = -1;
                    }
                } else {
                    if(creep.displayobject.x > hunter.displayobject.x) {
                        side = -1
                    }
                }

                const fightpoint = { x: creep.displayobject.x + (offset * side), y: creep.displayobject.y };
                const vec = [fightpoint.x - hunter.displayobject.x, fightpoint.y - hunter.displayobject.y];
                const distancesquared = Math.pow(vec[0], 2) + Math.pow(vec[1], 2);

                if(distancesquared > 1) {
                    const distance = Math.sqrt(distancesquared);
                    const normalizedvec = distance !== 0 ? [vec[0] / distance, vec[1] / distance] : [vec[0], vec[1]];
                    const displacementthisround = deltatime * hunter.speedperms;

                    const prevx = hunter.displayobject.x;
                    const prevy = hunter.displayobject.y;

                    const nextx = prevx + (normalizedvec[0] * displacementthisround);
                    const nexty = prevy + (normalizedvec[1] * displacementthisround);

                    if(prevx < nextx) {
                        // face right
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x);
                    } else if(prevx > nextx) {
                        // face left
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x) * -1;
                    } else {
                        // pas de changement de direction
                    }

                    hunter.setPosition(nextx, nexty);
                } else {

                    if(creep.displayobject.x > hunter.displayobject.x) {
                        // hunter face right and creep face left
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x);
                        creep.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x) * -1;
                    } else{
                        // hunter face left and creep face right
                        hunter.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x) * -1;
                        creep.displayobject.scale.x = Math.abs(hunter.displayobject.scale.x);
                    }

                    hunter.fightMelee(creep);
                    creep.fightMelee(hunter);
                }
            }
        }
    };
}
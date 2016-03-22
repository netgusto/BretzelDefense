'use strict';

import { GameStage, GameLayer, cursorkeys } from 'bobo';

import Level01 from '../Level/level01';
import SpatialHash from '../Utils/spatialhash';

import BallisticSystem from '../System/Ballistic';
import MeleeSystem from '../System/Melee';
import DeathSystem from '../System/Death';
import DebugSystem from '../System/Debug';
import LifebarSystem from '../System/Lifebar';
import MoveCreepsSystem from '../System/MoveCreeps';
import RangeDetectionSystem from '../System/RangeDetection';
import SpatialTrackingSystem from '../System/SpatialTracking';
import HUDSystem from '../System/HUD';
import ZIndexSystem from '../System/ZIndex';

const gridcellsize = 128;

export default function({ resolution, canvas, debug, eventbus }) {
    const state = {
        life: 20,
        coins: 100
    };

    const stage = new GameStage(canvas);
    const cursor = cursorkeys();

    const layers = {
        background: new GameLayer(stage),
        lifebar: new GameLayer(stage),
        creeps: new GameLayer(stage),
        projectiles: new GameLayer(stage),
        interface: new GameLayer(stage),
        debug: new GameLayer(stage)
    };

    Object.values(layers).map(layer => stage.addLayer(layer));

    const level = Level01({ resolution, eventbus, state });

    return stage
        .require(level)
        .load({
            onbegin() {
                console.log('begin');
            },
            onprogress(progress, loadedresource) {
                console.log('progress', progress, loadedresource);
            },
            oncomplete() {
                console.log('end');
            }
        })
        .then(function(/*{ loader, resources }*/) {

            const spatialhash = new SpatialHash({
                cellwidth: (gridcellsize * resolution.worldscale)|0,
                cellheight: (gridcellsize * resolution.worldscale)|0,
                worldwidth: resolution.width,
                worldheight: resolution.height
            });

            const ballisticSystem = BallisticSystem({ layer: layers.projectiles });
            const meleeSystem = MeleeSystem();

            stage
                .addSystem(MoveCreepsSystem())
                .addSystem(SpatialTrackingSystem({ spatialhash }))
                .addSystem(RangeDetectionSystem({
                    spatialhash,
                    onenter: function(/*entity, hunterentity, distance*/) { },
                    onrange: function(/*entity, hunterentity, distance*/) { },
                    onrangebulk: function(matches, hunter) {
                        // engagement for both ballistic and melee systems
                        if(matches.length) hunter.engage(matches, { ballisticSystem, meleeSystem });
                    },
                    onleave: function(/*entityid, hunterentity*/) { }
                }))
                .addSystem(ballisticSystem)
                .addSystem(meleeSystem)
                .addSystem(DeathSystem({ eventbus }))
                .addSystem(LifebarSystem({ layer: layers.lifebar }))
                .addSystem(HUDSystem({ layer: layers.interface, state }))
                .addSystem(ZIndexSystem(layers.creeps));

            // Debug
            if(debug) {
                stage.addSystem(DebugSystem({ layer: layers.debug, cbk: (msg) => msg += '; '  + layers.creeps.entities.length + ' creeps' }));
                // const graphics = new Graphics(); stage.addEntity(GenericEntity({ displayobject: graphics })); level.lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, 0, 0));
            }

            // Events
            eventbus.on('entity.death.batch', function(entities) {

                meleeSystem.forfait(entities.map(entity => entity.id));

                for(let i = entities.length - 1; i >= 0; i--) {
                    const entity = entities[i];
                    spatialhash.remove(entity.id);
                    entity.die();
                    if(entity.creep) state.coins += 4;
                }
            });

            /*****************************************************************/
            /* Setup du level                                                */
            /*****************************************************************/
            return level
                .init()
                .then(() => { console.log('laaa'); level.setup({
                    creepslayer: layers.creeps,
                    backgroundlayer: layers.background,
                    spatialhash,
                    cursor,
                    meleeSystem
                })})
                .then(() => stage);
        });
}
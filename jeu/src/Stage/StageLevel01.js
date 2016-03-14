'use strict';

import { GameStage, GameLayer, cursorkeys } from 'bobo';

import Level01 from '../Level/level01';
import SpatialHash from '../Utils/spatialhash';

import BallisticSystem from '../System/Ballistic';
import DeathSystem from '../System/Death';
import DebugSystem from '../System/Debug';
import LifebarSystem from '../System/Lifebar';
import MoveCreepsSystem from '../System/MoveCreeps';
import RangeDetectionSystem from '../System/RangeDetection';
import SpatialTrackingSystem from '../System/SpatialTracking';
import ZIndexSystem from '../System/ZIndex';

const gridcellsize = 128;

export default function({ resolution, canvas, debug }) {
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

    const level = Level01({ resolution });

    return stage
        .require(level)
        .load()
        .then(function(/*{ loader, resources }*/) {

            const spatialhash = new SpatialHash({
                cellwidth: (gridcellsize * resolution.worldscale)|0,
                cellheight: (gridcellsize * resolution.worldscale)|0,
                worldwidth: resolution.width,
                worldheight: resolution.height
            });

            const ballisticSystem = new BallisticSystem({ layer: layers.projectiles });

            stage.addSystem(ballisticSystem)
                .addSystem(MoveCreepsSystem())
                .addSystem(LifebarSystem({ layer: layers.lifebar }))
                .addSystem(SpatialTrackingSystem({ spatialhash }))
                .addSystem(new RangeDetectionSystem({
                    spatialhash,
                    onenter: function(entity/*, hunterentity, distance*/) { entity.matchcount++; },
                    onrange: function(/*entity, hunterentity, distance*/) { },
                    onrangebulk: function(matches, hunter) {
                        if(matches.length) hunter.engage(matches, { ballisticSystem });
                    },
                    onleave: function(/*entityid, hunterentity*/) { }
                }))
                .addSystem(DeathSystem({ spatialhash }))
                .addSystem(new ZIndexSystem(layers.creeps));

            // Debug
            if(debug) {
                stage.addSystem(new DebugSystem({ layer: layers.debug, cbk: (msg) => msg += '; '  + layers.creeps.entities.length + ' creeps' }));
                // const graphics = new Graphics(); stage.addEntity(GenericEntity({ displayobject: graphics })); level.lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, 0, 0));
            }

            /*****************************************************************/
            /* Setup du level                                                */
            /*****************************************************************/
            level.setup({
                creepslayer: layers.creeps,
                backgroundlayer: layers.background,
                spatialhash,
                cursor
            });

            return stage;
        });
}
'use strict';

import 'babel-polyfill';
import 'perfnow';

import { Container } from 'pixi.js';
import { GameSet, GameLayer, gameloop, cursorkeys } from 'bobo';

import resolutionFinder from './Utils/resolution';
import SpatialHash from './Utils/spatialhash';

import BallisticSystem from './System/Ballistic';
import DeathSystem from './System/Death';
import DebugSystem from './System/Debug';
import LifebarSystem from './System/Lifebar';
import MoveCreepsSystem from './System/MoveCreeps';
import RangeDetectionSystem from './System/RangeDetection';
import SpatialTrackingSystem from './System/SpatialTracking';
import ZIndexSystem from './System/ZIndex';

import Level from './Level/level01';

const debug = true;
const gridcellsize = 128;
const cursor = cursorkeys();

(function(mountnode: HTMLElement, resolution) {

    const level = Level({ resolution });

    /* Le stage */
    const canvas = new Container(0xFF0000 /* white */, true /* interactive */);
    const game = new GameSet(mountnode, resolution.width, resolution.height, canvas);
    const layers = {
        background: new GameLayer(game),
        lifebar: new GameLayer(game),
        creeps: new GameLayer(game),
        projectiles: new GameLayer(game),
        interface: new GameLayer(game)
    };

    Object.values(layers).map(layer => game.addLayer(layer));

    game
        .requires(level)
        .load()
        .then(function(/*{ loader, resources }*/) {

            level.lanes.map(lane => lane.memoizeAll());
            const spatialhash = new SpatialHash({
                cellwidth: (gridcellsize * resolution.worldscale)|0,
                cellheight: (gridcellsize * resolution.worldscale)|0,
                worldwidth: resolution.width,
                worldheight: resolution.height
            });

            // Les systèmes
            const ballisticSystem = new BallisticSystem({ layer: layers.projectiles });

            game.addSystem(ballisticSystem);
            game.addSystem(MoveCreepsSystem());
            game.addSystem(LifebarSystem({ layer: layers.lifebar }));
            game.addSystem(SpatialTrackingSystem({ spatialhash }));
            game.addSystem(new RangeDetectionSystem({
                spatialhash,
                onenter: function(entity/*, hunterentity, distance*/) { entity.matchcount++; },
                onrange: function(/*entity, hunterentity, distance*/) { },
                onrangebulk: function(matches, hunter) {
                    if(matches.length) hunter.engage(matches, { ballisticSystem });
                },
                onleave: function(/*entityid, hunterentity*/) { }
            }));

            game.addSystem(DeathSystem({ spatialhash }));
            game.addSystem(new ZIndexSystem(layers.creeps));

            // Debug
            if(debug) {
                game.addSystem(new DebugSystem({ stage: canvas, cbk: (msg) => msg += '; '  + game.entities.length + ' entities' }));
                // const graphics = new Graphics();
                // game.addEntity(GenericEntity({ displayobject: graphics }));
                // level.lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, 0, 0));
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

        }).then(() => game.run(gameloop()));

})(document.getElementById('app'), resolutionFinder());

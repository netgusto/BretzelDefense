'use strict';

import { Graphics, RenderTexture } from 'pixi.js';
//import GenericEntity from '../Entity/Generic';
import { GameStage, GameLayer, cursorkeys } from '../../Utils/bobo';
import { drawSVGPath } from '../../Utils/svg';

import eventbus from '../../Singleton/eventbus';

import SpatialHash from '../../Utils/spatialhash';
import { curveToLane } from '../../Utils/lane';

import BallisticSystem from '../../System/Ballistic';
import MeleeSystem from '../../System/Melee';
import DeathSystem from '../../System/Death';
import DebugSystem from '../../System/Debug';
import LifebarSystem from '../../System/Lifebar';
import MoveCreepsSystem from '../../System/MoveCreeps';
import RangeDetectionSystem from '../../System/RangeDetection';
import SpatialTrackingSystem from '../../System/SpatialTracking';
import RealEstateSystem from '../../System/RealEstate';
import HUDSystem from '../../System/HUD';
import ZIndexSystem from '../../System/ZIndex';

import Background from '../../Entity/Background';
import Mummy from '../../Entity/Creep/Mummy';
import FireballTower from '../../Entity/Tower/FireballTower';
import ArcherTower from '../../Entity/Tower/ArcherTower';
import BarrackTower from '../../Entity/Tower/BarrackTower';
import SpotMenu from '../../Entity/Menu/SpotMenu';

import { gridcellsize, whratio, lanesprops } from './props';

export default function({ resolution, canvas, debug, renderer }) {

    const state = {
        life: 20,
        coins: 100
    };

    const stage = new GameStage(canvas);
    const cursor = cursorkeys();

    const layers = {
        background: new GameLayer(stage),
        lifebar: new GameLayer(stage),
        ranges: new GameLayer(stage),
        creeps: new GameLayer(stage),
        projectiles: new GameLayer(stage),
        ingamemenus: new GameLayer(stage),
        interface: new GameLayer(stage),
        debug: new GameLayer(stage)
    };

    Object.values(layers).map(layer => stage.addLayer(layer));

    Background.setTexturePath('/assets/sprites/level-' + resolution.width + '-' + resolution.height + '.jpg');
    let buildspotHighlightTexture;
    let compiledlevel;

    const lanes = lanesprops.map(curveToLane(resolution.width, resolution.height, resolution.offsetx, resolution.offsety));

    const buildspots = [
        { x: 741 * resolution.worldscale + resolution.offsetx, y: 695 * resolution.worldscale + resolution.offsety, deploy: [540 * resolution.worldscale + resolution.offsetx, 701 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 874 * resolution.worldscale + resolution.offsetx, y: 409 * resolution.worldscale + resolution.offsety, deploy: [912 * resolution.worldscale + resolution.offsetx, 546 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 887 * resolution.worldscale + resolution.offsetx, y: 988 * resolution.worldscale + resolution.offsety, deploy: [856 * resolution.worldscale + resolution.offsetx, 843 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1082 * resolution.worldscale + resolution.offsetx, y: 949 * resolution.worldscale + resolution.offsety, deploy: [1285 * resolution.worldscale + resolution.offsetx, 945 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1108 * resolution.worldscale + resolution.offsetx, y: 1237 * resolution.worldscale + resolution.offsety, deploy: [954 * resolution.worldscale + resolution.offsetx, 1148 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1224 * resolution.worldscale + resolution.offsetx, y: 527 * resolution.worldscale + resolution.offsety, deploy: [1444 * resolution.worldscale + resolution.offsetx, 480 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1228 * resolution.worldscale + resolution.offsetx, y: 369 * resolution.worldscale + resolution.offsety, deploy: [1225 * resolution.worldscale + resolution.offsetx, 224 * resolution.worldscale + resolution.offsety], tower: null, current: false }
    ];

    /*const init = function() {
        const before = performance.now();
        const promises = lanes.map(lane => lane.memoizeAllAsync());
        return Promise.all(promises).then(() => console.log('Lanes async memoization took ' + (performance.now() - before) + ' ms'));
    };*/

    const init = function() {
        for(var laneindex in compiledlevel) {
            lanes[laneindex].memoizePrecalc(compiledlevel[laneindex]);
        }
        return Promise.resolve();
    };

    return stage
        .require({
            loadAssets(loader) {
                Background.loadAssets(loader);
                Mummy.loadAssets(loader);
                FireballTower.loadAssets(loader);
                ArcherTower.loadAssets(loader);
                BarrackTower.loadAssets(loader);
                loader.add('compiledlevel', '/assets/compiled/level1.' + resolution.width + 'x' + resolution.height + '.json');

                loader.add('buildspothighlight', '/assets/sprites/buildspot-highlight.png');
                loader.once('complete', (_, resources) => {
                    buildspotHighlightTexture = resources.buildspothighlight.texture;
                    compiledlevel = resources.compiledlevel.data;
                });
            }
        })
        .load({
            onbegin() { console.log('begin'); },
            oncomplete() { console.log('end'); }
        })
        .then(init)
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
                .addSystem(RealEstateSystem({
                    rangeslayer: layers.ranges,
                    towerslayer: layers.creeps,
                    backgroundlayer: layers.background,
                    buildspots,
                    buildspotHighlightTexture,
                    cursor,
                    worldscale: resolution.worldscale,
                    whratio,
                    meleeSystem,
                    state
                }))
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
                .addSystem(DeathSystem())
                .addSystem(LifebarSystem({ layer: layers.lifebar, worldscale: resolution.worldscale }))
                .addSystem(HUDSystem({ layer: layers.interface, state }))
                .addSystem(ZIndexSystem(layers.creeps));

            // Debug
            if(debug) {
                stage.addSystem(DebugSystem({ layer: layers.debug, cbk: (msg) => msg += '; '  + layers.creeps.entities.length + ' creeps; ' + resolution.width + 'x' + resolution.height }));
                //const graphics = new Graphics(); layers.debug.addEntity(GenericEntity({ displayobject: graphics })); lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, 0, 0));
            }

            // Building the path texture to have a testable in path / out path reference
            const pathtexture = new RenderTexture(renderer, resolution.width, resolution.height);
            const pathgraphics = new Graphics(); drawSVGPath(pathgraphics, lanes[1].path, 0xFFFFFF, 0, 0, 170 * resolution.worldscale);
            //layers.debug.addEntity(GenericEntity({ displayobject: pathgraphics }));
            pathtexture.render(pathgraphics);

            // Events
            eventbus.on('entity.death.batch', function(entities) {
                eventbus.emit('entity.untrack.batch', entities);
                for(let i = entities.length - 1; i >= 0; i--) {
                    entities[i].die();
                    if(entities[i].creep) state.coins += 4;
                }
            });

            eventbus.on('entity.untrack.batch', function(entities) {
                const entityids = entities.map(entity => entity.id);
                meleeSystem.forfaitbatch(entityids);
                spatialhash.removebatch(entityids);
            });

            eventbus.on('entity.remove.batch', function(entities) {
                for(let i = entities.length - 1; i >= 0; i--) {
                    entities[i].remove()
                }
            });

            const towermenu = SpotMenu({ worldscale: resolution.worldscale });
            layers.ingamemenus.addEntity(towermenu);

            eventbus.on('buildspot.focus', function({ spot }) {

                if(spot.tower) {
                    towermenu.setPosition(spot.x, spot.y - 20 * resolution.worldscale);
                } else {
                    towermenu.setPosition(spot.x, spot.y);
                }

                towermenu.enable(spot);
            });

            eventbus.on('buildspot.blur', function(/*{ spot }*/) {
                towermenu.disable();
            });

            eventbus.on('tower.add', function({ spot, type }) {
                if(spot.tower !== null) return;

                let tower = null;
                switch(type) {
                    case 'ArcherTower': {
                        if(state.coins < 70) return;
                        state.coins -= 70;
                        tower = ArcherTower({ worldscale: resolution.worldscale, whratio })
                            .mount({
                                worldscale: resolution.worldscale,
                                clickpoint: { x: spot.x, y: spot.y },
                                creepslayer: layers.creeps
                            });
                        break;
                    }

                    case 'BarrackTower': {
                        if(state.coins < 70) return;
                        state.coins -= 70;
                        tower = BarrackTower({ worldscale: resolution.worldscale, whratio, meleeSystem })
                            .mount({
                                worldscale: resolution.worldscale,
                                clickpoint: { x: spot.x, y: spot.y },
                                deploypoint: { x: spot.deploy[0], y: spot.deploy[1] },
                                creepslayer: layers.creeps
                            });
                        break;
                    }
                }

                if(tower !== null) {
                    eventbus.emit('tower.added', { spot, tower });
                }

            });

            eventbus.on('tower.sell', function({ spot }) {
                console.log('SELLING TOWER !', spot);
                spot.tower.unmount();
                eventbus.emit('tower.sold', { spot });
            });

            eventbus.on('tower.redeploy', function({ spot }) {
                console.log('REDEPLOYING TOWER !', spot);
                // 1. Fermeture du menu
                towermenu.disable();

                // 2. Surveillance du clic sur le background
                eventbus.once('background.click.preemption', function(e) {
                    if(spot.current === false) return; // focus has changed since premption was set up; just ignoring the premption, that is now consumed
                    e.stopPropagation();

                    const rangecenter = spot.tower.getRangeCenterPoint();

                    if(spatialhash.iswithinrange(
                        rangecenter.x, rangecenter.y,
                        e.data.global.x, e.data.global.y,
                        spot.tower.rangeX, spot.tower.rangeY
                    ) !== false) {
                        // click is within range; check if it is on the path

                        const pixel = pathtexture.getPixel(e.data.global.x, e.data.global.y);
                        if(pixel[0] === 255) {
                            console.log('Dans le chemin !');
                            spot.tower.setDeployPoint({ x: e.data.global.x, y: e.data.global.y });
                        } else {
                            console.log('Hors du chemin !');
                        }

                        eventbus.emit('tower.redeployed', { spot });
                    }

                    //towermenu.enable(spot);
                });
            });

            /*****************************************************************/
            /* Setup du level                                                */
            /*****************************************************************/

            const setup = function({ spatialhash, backgroundlayer, creepslayer }) {

                const background = Background({
                    viewwidth: resolution.width,
                    viewheight: resolution.height
                });

                background.displayobject.interactive = true;
                background.displayobject.click = function(e) {
                    eventbus.emit('background.click.preemption', e);
                    if(e.stopped === false) {
                        eventbus.emit('background.click', e);
                    }
                };

                //creepsautospawn({ layer: creepslayer, resolution, spatialhash, lanes: this.lanes, vps: 20, frequency: 50 });
                waves({ layer: creepslayer, resolution, spatialhash });

                backgroundlayer.addEntity(background);

                return Promise.resolve();
            };

            const waves = function({ layer, spatialhash }) {

                const wavesprops = [
                    { number: 9, frequency: 400, vps: 20, delay: 0 },
                    { number: 15, frequency: 400, vps: 23, delay: 20000 },
                    { number: 25, frequency: 400, vps: 30, delay: 30000 },
                    { number: 40, frequency: 400, vps: 35, delay: 50000 },
                    { number: 70, frequency: 400, vps: 38, delay: 75000 }
                ];

                // Vagues de creeps
                let mummyindex = 0;

                const spawn = function({ vps, frequency, number }) {
                    let count = 0;
                    let interval = window.setInterval(function() {
                        if(count >= number) return;
                        const mummy = Mummy({
                            worldscale: resolution.worldscale
                        })
                            .setVelocityPerSecond((vps + Math.floor(Math.random() * 50)) * resolution.worldscale);
                        layer.addEntity(mummy);
                        mummy.creep = true;
                        mummy.lane = lanes[mummyindex % lanes.length];
                        mummy.prevpos = { x: 0, y: 0 };
                        mummy.pixelswalked = 0;

                        mummyindex++;

                        const trackpoint = mummy.getSpatialTrackPoint();
                        spatialhash.insert(
                            trackpoint.x,
                            trackpoint.y,
                            mummy.id,
                            mummy
                        );

                        count++;

                        if(count === number) window.clearInterval(interval);
                    }, frequency);
                };

                wavesprops.map(waveprops => {
                    window.setTimeout(function() {
                        spawn(waveprops)
                    }, waveprops.delay);
                });
            };

            return setup({
                backgroundlayer: layers.background,
                creepslayer: layers.creeps,
                spatialhash,
                resolution
            })
            .then(() => stage);
        });
}
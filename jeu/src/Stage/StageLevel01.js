'use strict';

import { GameStage, GameLayer, cursorkeys } from 'bobo';
import { Graphics, RenderTexture } from 'pixi.js';
//import GenericEntity from '../Entity/Generic';
import { drawSVGPath } from '../Utils/svg';

import eventbus from '../Singleton/eventbus';

import SpatialHash from '../Utils/spatialhash';
import { curveToLane } from '../Utils/lane';

import BallisticSystem from '../System/Ballistic';
import MeleeSystem from '../System/Melee';
import DeathSystem from '../System/Death';
import DebugSystem from '../System/Debug';
import LifebarSystem from '../System/Lifebar';
import MoveCreepsSystem from '../System/MoveCreeps';
import RangeDetectionSystem from '../System/RangeDetection';
import SpatialTrackingSystem from '../System/SpatialTracking';
import RealEstateSystem from '../System/RealEstate';
import HUDSystem from '../System/HUD';
import ZIndexSystem from '../System/ZIndex';

import Background from '../Entity/Background';
import Mummy from '../Entity/Creep/Mummy';
import FireballTower from '../Entity/Tower/FireballTower';
import ArcherTower from '../Entity/Tower/ArcherTower';
import BarrackTower from '../Entity/Tower/BarrackTower';
import SpotMenu from '../Entity/Menu/SpotMenu';

const gridcellsize = 128;

export default function({ resolution, canvas, debug, renderer }) {

    const whratio = 36/25;

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

    const lanes = [
        { name: 'red',      width: 2048, height: 1536, color: 0xFF0000, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M2276.65616,357.166917 C2082.14438,484.51356 1659.32294,534.252411 1530.08137,501.5071 C1400.83979,468.76179 1475.63003,241.634048 1364.54643,189.102672 C1253.46283,136.571296 1174.69682,144.155127 1087.60182,212.639606 C1000.50682,281.124085 1076.87659,432.070036 947.57263,493.733283 C886.15357,523.023171 816.895948,502.653254 754.32565,501.507105 C685.168314,500.240295 623.534217,517.867285 575.331707,550.038229 C483.517837,611.315925 468.924267,743.803707 553.660052,814.336812 C638.395837,884.869917 694.522993,891.366362 821.047811,880.859423 C947.57263,870.352484 1047.47437,810.600144 1138.92525,831.307672 C1230.37613,852.015199 1286.4468,942.426278 1198.08134,1025.05219 C1109.71588,1107.67811 1020.11398,1032.85437 917.126816,1103.09093 C814.139652,1173.32749 866.325184,1399.12555 853.370966,1584.01323' },
        { name: 'yellow',   width: 2048, height: 1536, color: 0xFFFF00, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M2317.62852,383.918842 C2222.36978,442.933659 2045.32055,492.874547 1872.29619,524.216196 C1720.35579,551.738691 1570.66481,566.871992 1493.85607,534.53593 C1329.58026,465.3767 1443.74639,208.143149 1236.71712,208.143149 C1029.68785,208.143149 1099.76369,469.944388 981.308041,524.216206 C871.446738,574.550426 710.528598,514.743787 604.752204,589.922294 C524.57204,646.90878 505.416369,739.442191 631.198193,820.488961 C756.980018,901.535731 1027.55529,769.13681 1136.88912,794.712306 C1246.22295,820.287803 1338.31472,892.256486 1260.49866,1019.45572 C1182.68261,1146.65494 1059.42461,1083.90763 962.387178,1138.56926 C865.349741,1193.2309 913.552481,1434.00814 901.637342,1594.92832' },
        { name: 'blue',     width: 2048, height: 1536, color: 0x0000FF, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M2341.68235,424.693132 C2201.65883,526.881182 1600.58212,630.314867 1451.11392,571.244699 C1301.64573,512.174531 1419.31121,263.223313 1230.9433,263.223313 C1042.57539,263.223313 1130.47848,517.178693 1022.70028,563.533249 C922.741742,606.524631 714.493125,563.533249 647.91501,612.699411 C581.336895,661.865574 572.047781,754.822564 668.858439,795.279325 C765.669098,835.736085 1028.33799,733.100091 1156.33746,759.94274 C1284.33693,786.78539 1381.05679,888.026519 1309.97312,1032.81466 C1238.88945,1177.6028 1092.44549,1113.20652 1002.53165,1167.58358 C912.617807,1221.96064 967.034763,1452.13644 956.19364,1589.58133' }
    ].map(curveToLane(resolution.width, resolution.height));

    const buildspots = [
        { x: 741 * resolution.worldscale + resolution.offsetx, y: 695 * resolution.worldscale + resolution.offsety, deploy: [540 * resolution.worldscale + resolution.offsetx, 701 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 874 * resolution.worldscale + resolution.offsetx, y: 409 * resolution.worldscale + resolution.offsety, deploy: [912 * resolution.worldscale + resolution.offsetx, 546 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 887 * resolution.worldscale + resolution.offsetx, y: 988 * resolution.worldscale + resolution.offsety, deploy: [856 * resolution.worldscale + resolution.offsetx, 843 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1082 * resolution.worldscale + resolution.offsetx, y: 949 * resolution.worldscale + resolution.offsety, deploy: [1285 * resolution.worldscale + resolution.offsetx, 945 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1108 * resolution.worldscale + resolution.offsetx, y: 1237 * resolution.worldscale + resolution.offsety, deploy: [954 * resolution.worldscale + resolution.offsetx, 1148 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1224 * resolution.worldscale + resolution.offsetx, y: 527 * resolution.worldscale + resolution.offsety, deploy: [1444 * resolution.worldscale + resolution.offsetx, 480 * resolution.worldscale + resolution.offsety], tower: null, current: false },
        { x: 1228 * resolution.worldscale + resolution.offsetx, y: 369 * resolution.worldscale + resolution.offsety, deploy: [1225 * resolution.worldscale + resolution.offsetx, 224 * resolution.worldscale + resolution.offsety], tower: null, current: false }
    ];

    const init = function() {
        const before = performance.now();
        const promises = lanes.map(lane => lane.memoizeAllAsync());
        return Promise.all(promises).then(() => console.log('Lanes async memoization took ' + (performance.now() - before) + ' ms'));
    };

    return stage
        .require({
            loadAssets(loader) {
                Background.loadAssets(loader);
                Mummy.loadAssets(loader);
                FireballTower.loadAssets(loader);
                ArcherTower.loadAssets(loader);
                BarrackTower.loadAssets(loader);

                loader.add('buildspothighlight', '/assets/sprites/buildspot-highlight.png');
                loader.once('complete', (_, resources) => {
                    buildspotHighlightTexture = resources.buildspothighlight.texture;
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
                stage.addSystem(DebugSystem({ layer: layers.debug, cbk: (msg) => msg += '; '  + layers.creeps.entities.length + ' creeps' }));
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
                background.displayobject.click = background.displayobject.tap = function(e) {
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
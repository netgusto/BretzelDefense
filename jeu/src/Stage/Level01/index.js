'use strict';

import { Graphics, RenderTexture } from 'pixi.js';
import { GameStage, cursorkeys } from '../../Utils/bobo';
import { drawSVGPath } from '../../Utils/svg';

import eventbus from '../../Singleton/eventbus';
import timers from '../../Singleton/timers';

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
import EntityUpdateSystem from '../../System/EntityUpdate';
import HUDSystem from '../../System/HUD';
import ZIndexSystem from '../../System/ZIndex';

import Background from '../../Entity/Background';
import Mummy from '../../Entity/Creep/Mummy';
import FireballTower from '../../Entity/Tower/FireballTower';
import ArcherTower from '../../Entity/Tower/ArcherTower';
import BarrackTower from '../../Entity/Tower/BarrackTower';
import SpotMenu from '../../Entity/Menu/SpotMenu';

import TitleScreen from '../../Stage/TitleScreen';
import createLayers from '../LevelRuntime/createLayers';
import setupInterface from '../LevelRuntime/setupInterface';
import registerEntityLifecycleEvents from '../LevelRuntime/registerEntityLifecycleEvents';
import registerTowerEvents from '../LevelRuntime/registerTowerEvents';
import registerGameStateEvents from '../LevelRuntime/registerGameStateEvents';
import startWaveSchedule from '../LevelRuntime/startWaveSchedule';

import { gridcellsize, whratio, lanesprops } from './props';
import { economy, spawnBalance, startingState, towerCosts, waveSchedule } from './balance';

let loaded = false;
let buildspotHighlightTexture;
let fullscreenButtonTexture;
let pausebuttonTexture;
let compiledlevel;

export default function({ world, canvas, renderer, swapstage }) {

    const state = {
        life: startingState.life,
        coins: startingState.coins,
        pause: false
    };

    const stage = new GameStage(canvas);
    const cursor = cursorkeys();
    const layers = createLayers({ stage });

    Background.setTexturePath('/assets/sprites/level-' + world.resolution.width + '-' + world.resolution.height + '.jpg');

    const lanes = lanesprops.map(curveToLane(world.resolution.lanescale, world.scale, world.resolution.offsetx, world.resolution.offsety));

    const buildspots = [
        { x: 741 * world.scale + world.resolution.offsetx, y: 695 * world.scale + world.resolution.offsety, deploy: [540 * world.scale + world.resolution.offsetx, 701 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 874 * world.scale + world.resolution.offsetx, y: 409 * world.scale + world.resolution.offsety, deploy: [912 * world.scale + world.resolution.offsetx, 546 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 887 * world.scale + world.resolution.offsetx, y: 988 * world.scale + world.resolution.offsety, deploy: [856 * world.scale + world.resolution.offsetx, 843 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1082 * world.scale + world.resolution.offsetx, y: 949 * world.scale + world.resolution.offsety, deploy: [1285 * world.scale + world.resolution.offsetx, 945 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1108 * world.scale + world.resolution.offsetx, y: 1237 * world.scale + world.resolution.offsety, deploy: [954 * world.scale + world.resolution.offsetx, 1148 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1224 * world.scale + world.resolution.offsetx, y: 527 * world.scale + world.resolution.offsety, deploy: [1444 * world.scale + world.resolution.offsetx, 480 * world.scale + world.resolution.offsety], tower: null, current: false },
        { x: 1228 * world.scale + world.resolution.offsetx, y: 369 * world.scale + world.resolution.offsety, deploy: [1225 * world.scale + world.resolution.offsetx, 224 * world.scale + world.resolution.offsety], tower: null, current: false }
    ];

    let respromise;

    if(loaded) {
        respromise = Promise.resolve();
    } else {
        respromise = stage
            .require({
                loadAssets(loader) {
                    Background.loadAssets(loader);
                    Mummy.loadAssets(loader);
                    FireballTower.loadAssets(loader);
                    ArcherTower.loadAssets(loader);
                    BarrackTower.loadAssets(loader);

                    loader.add('compiledlevel', '/assets/compiled/level1.' + world.resolution.width + 'x' + world.resolution.height + '.json');

                    loader.add('buildspothighlight', '/assets/sprites/buildspot-highlight.png');
                    loader.add('fullscreenbutton', '/assets/sprites/button-fullscreen.png');
                    loader.add('pausebutton', '/assets/sprites/pausebutton.png');

                    loader.once('complete', (_, resources) => {
                        loaded = true;
                        buildspotHighlightTexture = resources.buildspothighlight.texture;
                        fullscreenButtonTexture = resources.fullscreenbutton.texture;
                        pausebuttonTexture = resources.pausebutton.texture;
                        compiledlevel = resources.compiledlevel.data;
                    });
                }
            })
            .load({
                onbegin() { console.log('begin'); },
                oncomplete() { console.log('end'); }
            });
    }

    return respromise
        .then(function() {
            for(var laneindex in compiledlevel) {
                lanes[laneindex].memoizePrecalc(compiledlevel[laneindex]);
            }
            return Promise.resolve();
        })
        .then(function(/*{ loader, resources }*/) {

            const spatialhash = new SpatialHash({
                cellwidth: (gridcellsize * world.scale)|0,
                cellheight: (gridcellsize * world.scale)|0,
                worldwidth: world.resolution.width,
                worldheight: world.resolution.height
            });

            const ballisticSystem = BallisticSystem({ layer: layers.projectiles });
            const meleeSystem = MeleeSystem();

            stage
                .addSystem(MoveCreepsSystem())
                .addSystem(RealEstateSystem({
                    rangeslayer: layers.ranges,
                    towerslayer: layers.creeps,
                    backgroundlayer: layers.spots,
                    buildspots,
                    buildspotHighlightTexture,
                    cursor,
                    worldscale: world.scale,
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
                        if(matches.length) hunter.engage(matches, { ballisticSystem, meleeSystem, timescale: world.timescale });
                    },
                    onleave: function(/*entityid, hunterentity*/) { }
                }))
                .addSystem(ballisticSystem)
                .addSystem(meleeSystem)
                .addSystem(DeathSystem())
                .addSystem(EntityUpdateSystem())
                .addSystem(LifebarSystem({ layer: layers.lifebar, worldscale: world.scale }))
                .addSystem(HUDSystem({ layer: layers.interface, state }))
                .addSystem(ZIndexSystem(layers.creeps));

            // Debug
            if(world.debug) {
                stage.addSystem(DebugSystem({ layer: layers.debug, cbk: (msg) => msg += '; '  + layers.creeps.entities.length + ' creeps; Assets: ' + world.resolution.width + 'x' + world.resolution.height + '; Effective: ' + world.resolution.effectivewidth + 'x' + world.resolution.effectiveheight + '; Screen: ' + world.resolution.screenwidth + 'x' + world.resolution.screenheight + '; ' + (window.performance.memory ? (window.performance.memory.usedJSHeapSize/1024).toFixed(1) + 'KB' : '') }));
                //const graphics = new Graphics(); layers.debug.addEntity(GenericEntity({ displayobject: graphics })); lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, 0, 0, 5 * world.scale));
            }

            setupInterface({
                layers,
                world,
                fullscreenButtonTexture,
                pausebuttonTexture
            });

            // Building the path texture to have a testable in path / out path reference
            const pathtexture = new RenderTexture(renderer, world.resolution.width, world.resolution.height);
            const pathgraphics = new Graphics(); drawSVGPath(pathgraphics, lanes[1].path, 0xFFFFFF, 0, 0, 170 * world.scale);
            //layers.debug.addEntity(GenericEntity({ displayobject: pathgraphics }));
            pathtexture.render(pathgraphics);

            // Events

            eventbus.on('background.click', function(e) {
                console.log('CLICK COORDS :' + (e.data.global.x|0) + 'x' + (e.data.global.y|0));
            });

            registerEntityLifecycleEvents({
                state,
                economy,
                meleeSystem,
                spatialhash
            });

            const towermenu = SpotMenu({ worldscale: world.scale });
            layers.ingamemenus.addEntity(towermenu);

            const towerBuilders = {
                ArcherTower: function({ spot }) {
                    return ArcherTower({ worldscale: world.scale, whratio })
                        .mount({
                            worldscale: world.scale,
                            clickpoint: { x: spot.x, y: spot.y },
                            creepslayer: layers.creeps
                        });
                },

                BarrackTower: function({ spot }) {
                    return BarrackTower({ worldscale: world.scale, whratio, meleeSystem })
                        .mount({
                            worldscale: world.scale,
                            clickpoint: { x: spot.x, y: spot.y },
                            deploypoint: { x: spot.deploy[0], y: spot.deploy[1] },
                            creepslayer: layers.creeps
                        });
                },

                FireballTower: function({ spot }) {
                    return FireballTower({ worldscale: world.scale, whratio })
                        .mount({
                            clickpoint: { x: spot.x, y: spot.y },
                            creepslayer: layers.creeps
                        });
                }
            };

            registerTowerEvents({
                towermenu,
                worldscale: world.scale,
                state,
                towerCosts,
                economy,
                towerBuilders,
                spatialhash,
                pathtexture
            });

            registerGameStateEvents({
                state,
                world,
                timers,
                layers,
                economy,
                onGameOver: function() {
                    swapstage(TitleScreen);
                },
                onGameWin: function() {
                    alert('Success !');
                    swapstage(TitleScreen);
                }
            });

            /*****************************************************************/
            /* Setup du level                                                */
            /*****************************************************************/

            const setup = function({ spatialhash, backgroundlayer, creepslayer }) {

                const background = Background({
                    viewwidth: world.resolution.effectivewidth,
                    viewheight: world.resolution.effectiveheight,
                    renderer
                });

                background.displayobject.interactive = true;
                background.displayobject.click = background.displayobject.tap = function(e) {
                    eventbus.emit('background.click.preemption', e);
                    if(e.stopped === false) {
                        eventbus.emit('background.click', e);
                    }
                };

                waves({ layer: creepslayer, spatialhash });

                backgroundlayer.addEntity(background);

                return Promise.resolve();
            };

            const waves = function({ layer, spatialhash }) {
                // Vagues de creeps
                let mummyindex = 0;

                const spawn = function({ vps, frequency, number }) {
                    let count = 0;
                    let intervalid = timers.addInterval(function() {
                        console.log('ADD MUMMY !');
                        if(count >= number) return;
                        const mummy = Mummy({
                            worldscale: world.scale
                        })
                            .setVelocityPerSecond((vps + Math.random() * spawnBalance.speedVariance) * world.scale);
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

                        if(count === number) timers.remove(intervalid);
                    }, frequency);
                };

                startWaveSchedule({
                    timers,
                    waveSchedule,
                    scheduleTimescale: world.timescale,
                    spawnWave: spawn,
                    isCountedDeath: function(entity) {
                        return entity.creep === true;
                    }
                });
            };

            return setup({
                backgroundlayer: layers.background,
                creepslayer: layers.creeps,
                spatialhash
            })
            .then(() => stage);
        })
        .catch(function(e) { console.error(e); });
}

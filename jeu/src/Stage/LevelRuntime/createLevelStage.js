'use strict';

import { Graphics, RenderTexture } from 'pixi.js';
import { GameStage, cursorkeys } from '../../Utils/bobo';
import { drawSVGPath } from '../../Utils/svg';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';
import timers from '../../Singleton/timers';
import { unlockLevels } from '../progression';

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

import SpotMenu from '../../Entity/Menu/SpotMenu';

import createLayers from './createLayers';
import setupInterface from './setupInterface';
import registerEntityLifecycleEvents from './registerEntityLifecycleEvents';
import registerTowerEvents from './registerTowerEvents';
import registerGameStateEvents from './registerGameStateEvents';
import startWaveSchedule from './startWaveSchedule';

const memoizeLaneFromPath = function(lane) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', lane.path);

    const length = Math.ceil(path.getTotalLength());
    const points = [];

    for(let step = 0; step <= length; step++) {
        const point = path.getPointAtLength(step);
        points.push([point.x, point.y]);
    }

    lane.memoizePrecalc({ length, points });
};

const runtimeassets = {
    sharedassetsloaded: false,
    interfaceassets: null
};

export default function(config) {
    const {
        id = null,
        unlocks = [],
        gridcellsize,
        whratio,
        lanesprops,
        balance,
        titleStage,
        backgroundEntity,
        loadBackgroundAsset = function({ loader }) {
            backgroundEntity.loadAssets(loader);
        },
        loadSharedAssets = function() {},
        getBackgroundTexturePath,
        getBackgroundProps = function() {
            return {};
        },
        getLaneOffsetX = function({ world }) {
            return world.resolution.offsetx;
        },
        getCompiledLevelPath = function() {
            return null;
        },
        getBuildspots,
        createTowerBuilders,
        spawnCreep,
        createSpotMenu = function({ worldscale }) {
            return SpotMenu({ worldscale });
        },
        pathLaneIndex = 1,
        pathStrokeWidth = 170,
        onBackgroundClick = function(e) {
            console.log('CLICK COORDS :' + (e.data.global.x|0) + 'x' + (e.data.global.y|0));
        },
        onGameOver = function({ swapstage, titleStage }) {
            swapstage(titleStage);
        },
        onGameWin = function({ swapstage, titleStage }) {
            swapstage(titleStage);
        }
    } = config;

    const { economy, spawnBalance, startingState, towerCosts, waveSchedule } = balance;

    let buildspotHighlightTexture;
    let fullscreenButtonTexture;
    let pausebuttonTexture;
    const compiledlevelbyresolution = {};
    const levelresourceprefix = id || 'level';

    return function({ world, canvas, renderer, swapstage }) {
        const state = {
            life: startingState.life,
            coins: startingState.coins,
            pause: false
        };

        const stage = new GameStage(canvas);
        const cursor = cursorkeys();
        const layers = createLayers({ stage });

        const resolutionkey = world.resolution.width + 'x' + world.resolution.height;
        const compiledresourcekey = 'compiledlevel-' + levelresourceprefix + '-' + resolutionkey;
        const compiledlevelpath = getCompiledLevelPath({ world });

        backgroundEntity.setTexturePath(getBackgroundTexturePath({ world }));

        if(runtimeassets.interfaceassets) {
            buildspotHighlightTexture = runtimeassets.interfaceassets.buildspotHighlightTexture;
            fullscreenButtonTexture = runtimeassets.interfaceassets.fullscreenButtonTexture;
            pausebuttonTexture = runtimeassets.interfaceassets.pausebuttonTexture;
        }

        if(id) {
            unlockLevels([id]);
        }

        const laneoffsetx = getLaneOffsetX({ world, lanesprops });
        const lanes = lanesprops.map(curveToLane(world.resolution.lanescale, world.scale, laneoffsetx, world.resolution.offsety));
        const buildspots = getBuildspots({ world });

        const shouldloadcompiled = !!compiledlevelpath && !(resolutionkey in compiledlevelbyresolution);
        const shouldloadsharedassets = !runtimeassets.sharedassetsloaded;
        const shouldloadinterfaceassets = !runtimeassets.interfaceassets;

        const loadpromise = stage
            .require({
                loadAssets(loader) {
                    loadBackgroundAsset({ loader, world, backgroundEntity });

                    if(shouldloadsharedassets) {
                        loadSharedAssets({ loader, world });
                    }

                    if(shouldloadinterfaceassets) {
                        loader.add('buildspothighlight', '/assets/sprites/buildspot-highlight.png');
                        loader.add('fullscreenbutton', '/assets/sprites/button-fullscreen.png');
                        loader.add('pausebutton', '/assets/sprites/pausebutton.png');
                    }

                    if(shouldloadcompiled) {
                        loader.add(compiledresourcekey, compiledlevelpath);
                    }

                    loader.once('complete', (_, resources) => {
                        if(shouldloadsharedassets) {
                            runtimeassets.sharedassetsloaded = true;
                        }

                        if(shouldloadinterfaceassets) {
                            buildspotHighlightTexture = resources.buildspothighlight.texture;
                            fullscreenButtonTexture = resources.fullscreenbutton.texture;
                            pausebuttonTexture = resources.pausebutton.texture;

                            runtimeassets.interfaceassets = {
                                buildspotHighlightTexture,
                                fullscreenButtonTexture,
                                pausebuttonTexture
                            };
                        }

                        if(shouldloadcompiled) {
                            compiledlevelbyresolution[resolutionkey] = resources[compiledresourcekey].data;
                        }
                    });
                }
            })
            .load({
                onbegin() { console.log('begin'); },
                oncomplete() { console.log('end'); }
            });

        return loadpromise
            .then(function() {
                const compiledlevel = compiledlevelbyresolution[resolutionkey];

                if(compiledlevel) {
                    for(let laneindex in compiledlevel) {
                        lanes[laneindex].memoizePrecalc(compiledlevel[laneindex]);
                    }
                } else {
                    lanes.map(function(lane) {
                        memoizeLaneFromPath(lane);
                    });
                }

                return Promise.resolve();
            })
            .then(function() {
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
                        onenter: function() { },
                        onrange: function() { },
                        onrangebulk: function(matches, hunter) {
                            if(matches.length) {
                                hunter.engage(matches, { ballisticSystem, meleeSystem, timescale: world.timescale });
                            }
                        },
                        onleave: function() { }
                    }))
                    .addSystem(ballisticSystem)
                    .addSystem(meleeSystem)
                    .addSystem(DeathSystem())
                    .addSystem(EntityUpdateSystem())
                    .addSystem(LifebarSystem({ layer: layers.lifebar, worldscale: world.scale }))
                    .addSystem(HUDSystem({ layer: layers.interface, state }))
                    .addSystem(ZIndexSystem(layers.creeps));

                if(world.debug) {
                    stage.addSystem(DebugSystem({
                        layer: layers.debug,
                        cbk: function(msg) {
                            msg += '; ' + layers.creeps.entities.length + ' creeps; Assets: ' + world.resolution.width + 'x' + world.resolution.height + '; Effective: ' + world.resolution.effectivewidth + 'x' + world.resolution.effectiveheight + '; Screen: ' + world.resolution.screenwidth + 'x' + world.resolution.screenheight + '; ' + (window.performance.memory ? (window.performance.memory.usedJSHeapSize/1024).toFixed(1) + 'KB' : '');
                            return msg;
                        }
                    }));
                }

                setupInterface({
                    layers,
                    world,
                    fullscreenButtonTexture,
                    pausebuttonTexture
                });

                const pathtexture = new RenderTexture(renderer, world.resolution.width, world.resolution.height);
                const pathgraphics = new Graphics();
                const pathlane = lanes[pathLaneIndex] || lanes[0];
                drawSVGPath(pathgraphics, pathlane.path, 0xFFFFFF, 0, 0, pathStrokeWidth * world.scale);
                pathtexture.render(pathgraphics);

                const runtimedisposers = [];
                const addRuntimeDisposer = function(registration) {
                    if(registration && typeof registration.dispose === 'function') {
                        runtimedisposers.push(registration.dispose);
                    }
                };

                const registerRuntimeEvent = function(name, handler) {
                    eventbus.on(name, handler);
                    runtimedisposers.push(function() {
                        eventbus.off(name, handler);
                    });
                };

                const disposeRuntime = function() {
                    while(runtimedisposers.length) {
                        const dispose = runtimedisposers.pop();
                        try {
                            dispose();
                        } catch(e) {
                            console.error(e);
                        }
                    }
                };

                stage.onDestroy(disposeRuntime);

                if(onBackgroundClick) {
                    registerRuntimeEvent(EVENTS.BACKGROUND_CLICK, onBackgroundClick);
                }

                addRuntimeDisposer(registerEntityLifecycleEvents({
                    state,
                    economy,
                    meleeSystem,
                    spatialhash
                }));

                const towermenu = createSpotMenu({ worldscale: world.scale, world, state });
                layers.ingamemenus.addEntity(towermenu);

                const towerBuilders = createTowerBuilders({ world, whratio, layers, meleeSystem, state, timers, buildspots });
                addRuntimeDisposer(registerTowerEvents({
                    towermenu,
                    worldscale: world.scale,
                    state,
                    towerCosts,
                    economy,
                    towerBuilders,
                    spatialhash,
                    pathtexture
                }));

                addRuntimeDisposer(registerGameStateEvents({
                    state,
                    world,
                    timers,
                    layers,
                    economy,
                    onGameOver: function() {
                        disposeRuntime();
                        onGameOver({ world, state, swapstage, titleStage });
                    },
                    onGameWin: function() {
                        if(unlocks.length) {
                            unlockLevels(unlocks);
                        }

                        disposeRuntime();
                        onGameWin({ world, state, swapstage, titleStage });
                    }
                }));

                const setup = function({ spatialhash, backgroundlayer, creepslayer }) {
                    const backgroundprops = getBackgroundProps({ world, state });
                    const background = backgroundEntity({
                        viewwidth: world.resolution.effectivewidth,
                        viewheight: world.resolution.effectiveheight,
                        renderer,
                        ...backgroundprops
                    });

                    background.displayobject.interactive = true;
                    background.displayobject.click = background.displayobject.tap = function(e) {
                        eventbus.emit(EVENTS.BACKGROUND_CLICK_PREEMPTION, e);
                        if(e.stopped === false) {
                            eventbus.emit(EVENTS.BACKGROUND_CLICK, e);
                        }
                    };

                    waves({ layer: creepslayer, spatialhash });

                    backgroundlayer.addEntity(background);

                    return Promise.resolve();
                };

                const waves = function({ layer, spatialhash }) {
                    let laneindex = 0;

                    const spawn = function({ vps, frequency, number }) {
                        let count = 0;
                        const intervalid = timers.addInterval(function() {
                            if(count >= number) {
                                return;
                            }

                            const lane = lanes[laneindex % lanes.length];

                            spawnCreep({
                                world,
                                layer,
                                lane,
                                laneindex,
                                spatialhash,
                                vps,
                                spawnBalance
                            });

                            laneindex++;
                            count++;

                            if(count === number) {
                                timers.remove(intervalid);
                            }
                        }, frequency);
                    };

                    addRuntimeDisposer(startWaveSchedule({
                        timers,
                        waveSchedule,
                        scheduleTimescale: world.timescale,
                        spawnWave: spawn,
                        isCountedDeath: function(entity) {
                            return entity.creep === true;
                        }
                    }));
                };

                return setup({
                    backgroundlayer: layers.background,
                    creepslayer: layers.creeps,
                    spatialhash
                }).then(() => stage);
            })
            .catch(function(e) {
                console.error(e);
            });
    };
}

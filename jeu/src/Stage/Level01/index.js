'use strict';

import { Graphics, RenderTexture, Text, Sprite } from 'pixi.js';
import screenfull from 'screenfull';
import GenericEntity from '../../Entity/Generic';
import { GameStage, GameLayer, cursorkeys } from '../../Utils/bobo';
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

import { gridcellsize, whratio, lanesprops } from './props';

let loaded = false;
let buildspotHighlightTexture;
let fullscreenButtonTexture;
let pausebuttonTexture;
let compiledlevel;

export default function({ world, canvas, renderer, swapstage }) {

    const state = {
        life: 20,
        coins: 100,
        pause: false
    };

    const stage = new GameStage(canvas);
    const cursor = cursorkeys();

    const layers = {
        background: new GameLayer(stage),
        spots: new GameLayer(stage),
        lifebar: new GameLayer(stage),
        ranges: new GameLayer(stage),
        creeps: new GameLayer(stage),
        projectiles: new GameLayer(stage),
        ingamemenus: new GameLayer(stage),
        interface: new GameLayer(stage),
        pause: new GameLayer(stage),
        debug: new GameLayer(stage)
    };

    Object.values(layers).map(layer => stage.addLayer(layer));

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

            // Pause overlay
            const pauseoverlay = new Graphics();
            pauseoverlay.beginFill(0x000000);
            pauseoverlay.alpha = 0.83;
            pauseoverlay.drawRect(0, 0, world.resolution.width, world.resolution.height);
            layers.pause.addChild(pauseoverlay);
            const pausetext = new Text('Pause - Cliquez pour reprendre', { font: '28px Arial', fill: 'white' });
            pausetext.pivot.set(0, 0);
            pausetext.position.set(30, 100);
            layers.pause.addChild(pausetext);
            layers.pause.container.renderable = false;
            layers.pause.container.interactive = false;
            layers.pause.container.click = layers.pause.container.tap = function(e) {
                e.stopPropagation();
                eventbus.emit('game.resume');
            };

            //
            // Interface
            //

            // Fullscreen button
            if(screenfull.enabled) {
                const fullscreenbutton = new Sprite(fullscreenButtonTexture);
                fullscreenbutton.scale.set(world.scale * 0.3);
                fullscreenbutton.pivot.set(fullscreenbutton.width / 2, fullscreenbutton.height / 2);
                fullscreenbutton.position.set(world.resolution.effectivewidth - (180 * world.scale) - fullscreenbutton.width, 10 * world.scale);
                fullscreenbutton.interactive = true;
                layers.interface.addChild(fullscreenbutton);
                fullscreenbutton.click = fullscreenbutton.tap = function(e) {
                    e.stopPropagation();
                    eventbus.emit('game.fullscreentoggle');
                };
            }

            // Pause button
            const pausebutton = new Sprite(pausebuttonTexture);
            pausebutton.scale.set(world.scale * 0.09);
            pausebutton.pivot.set(pausebutton.width / 2, pausebutton.height / 2);
            pausebutton.position.set(world.resolution.effectivewidth - (90 * world.scale) - pausebutton.width, 19 * world.scale);
            pausebutton.interactive = true;
            layers.interface.addChild(pausebutton);
            pausebutton.click = pausebutton.tap = function(e) {
                e.stopPropagation();
                eventbus.emit('game.pausetoggle');
            };

            // Building the path texture to have a testable in path / out path reference
            const pathtexture = new RenderTexture(renderer, world.resolution.width, world.resolution.height);
            const pathgraphics = new Graphics(); drawSVGPath(pathgraphics, lanes[1].path, 0xFFFFFF, 0, 0, 170 * world.scale);
            //layers.debug.addEntity(GenericEntity({ displayobject: pathgraphics }));
            pathtexture.render(pathgraphics);

            // Events

            eventbus.on('background.click', function(e) {
                console.log('CLICK COORDS :' + (e.data.global.x|0) + 'x' + (e.data.global.y|0));
            });

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

            const towermenu = SpotMenu({ worldscale: world.scale });
            layers.ingamemenus.addEntity(towermenu);

            eventbus.on('buildspot.focus', function({ spot }) {

                if(spot.tower) {
                    towermenu.setPosition(spot.x, spot.y - 20 * world.scale);
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
                        let cost = 40;
                        if(state.coins < cost) return;
                        state.coins -= cost;
                        tower = ArcherTower({ worldscale: world.scale, whratio })
                            .mount({
                                worldscale: world.scale,
                                clickpoint: { x: spot.x, y: spot.y },
                                creepslayer: layers.creeps
                            })
                            .addCost(cost);
                        break;
                    }

                    case 'BarrackTower': {
                        let cost = 70;
                        if(state.coins < cost) return;
                        state.coins -= cost;
                        tower = BarrackTower({ worldscale: world.scale, whratio, meleeSystem })
                            .mount({
                                worldscale: world.scale,
                                clickpoint: { x: spot.x, y: spot.y },
                                deploypoint: { x: spot.deploy[0], y: spot.deploy[1] },
                                creepslayer: layers.creeps
                            })
                            .addCost(cost);
                        break;
                    }
                }

                if(tower !== null) {
                    eventbus.emit('tower.added', { spot, tower });
                }

            });

            eventbus.on('tower.sell', function({ spot }) {
                console.log('SELLING TOWER !', spot);
                state.coins += (spot.tower.getTotalCost() * 0.9)|0;
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

            eventbus.on('game.blur', function() {
                eventbus.emit('game.pause');
            });

            eventbus.on('game.focus', function() {
                //eventbus.emit('game.resume');
            });

            eventbus.on('game.pause', function() {
                state.pause = true;
                world.set('_timescale', world.timescale);
                world.set('timescale', 0);
                timers.pauseAll();

                layers.creeps.entities.map(item => item.pause());
                layers.pause.container.renderable = true;
                layers.pause.container.interactive = true;
            });

            eventbus.on('game.pausetoggle', function() {
                if(state.pause) {
                    eventbus.emit('game.resume');
                } else {
                    eventbus.emit('game.pause');
                }
            });

            eventbus.on('game.resume', function() {
                state.pause = false;
                world.set('timescale', 1);
                world.set('timescale', world._timescale);
                timers.resumeAll();

                layers.creeps.entities.map(item => item.resume());
                layers.pause.container.renderable = false;
                layers.pause.container.interactive = false;
            });

            eventbus.on('game.fullscreentoggle', function() {
                screenfull.toggle();
            });

            eventbus.on('creep.succeeded', function({ creep }) {
                eventbus.emit('life.decrease', 1);
                creep.remove();
                console.log('Lifetime:', performance.now() - creep.birth);
            });

            eventbus.on('life.decrease', function(amount) {
                state.life -= amount;
                if(state.life <= 0) {
                    state.life = 0;
                    eventbus.emit('game.over');
                }
            });

            eventbus.on('game.over', function() {
                //alert('Game over !');
                swapstage(TitleScreen);
            });

            eventbus.on('game.win', function() {
                alert('Success !');
                swapstage(TitleScreen);
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

                //creepsautospawn({ layer: creepslayer, resolution, spatialhash, lanes: this.lanes, vps: 20, frequency: 50 });
                waves({ layer: creepslayer, resolution: world.resolution, spatialhash });

                backgroundlayer.addEntity(background);

                return Promise.resolve();
            };

            const waves = function({ layer, spatialhash }) {

                const wavesprops = [
                    { number: 9, frequency: 800, vps: 20, delay: 0 },
                    { number: 35, frequency: 400, vps: 23, delay: 20000 },
                    { number: 2500, frequency: 10, vps: 30, delay: 30000 },
                    { number: 40, frequency: 400, vps: 35, delay: 50000 },
                    { number: 70, frequency: 400, vps: 38, delay: 75000 }
                ];

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
                            .setVelocityPerSecond((vps + Math.random() * 50) * world.scale);
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

                let totalcreeps = 0;

                wavesprops.map(waveprops => {
                    totalcreeps += waveprops.number;
                    timers.addTimeout(function() {
                        spawn(waveprops)
                    }, waveprops.delay / world.timescale);
                });

                eventbus.on('entity.death.batch', function(entities) {
                    totalcreeps -= entities.length;
                    if(totalcreeps <= 0) eventbus.emit('game.win');
                });

                eventbus.on('creep.succeeded', function() {
                    totalcreeps -= 1;
                    if(totalcreeps <= 0) eventbus.emit('game.win');
                });
            };

            return setup({
                backgroundlayer: layers.background,
                creepslayer: layers.creeps,
                spatialhash,
                resolution: world.resolution
            })
            .then(() => stage);
        })
        .catch(function(e) { console.error(e); });
}
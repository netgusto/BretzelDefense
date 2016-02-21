'use strict';

/* @flow */

import 'perfnow';   // Polyfill for high resolution timer

import { Container as PixiContainer, extras as PixiExtras, loader, SCALE_MODES, Rectangle, Sprite, Graphics } from 'pixi.js';
import { GameSet, cursorkeys, loadspritesheet, gameloop } from 'bobo';

import stampit from 'stampit';

import Mummy from './Entity/Mummy';
import GenericEntity from './Entity/Generic';

import CursorSystem from './System/Cursor';
import DebugSystem from './System/Debug';
import CollaborativeDiffusionFieldSystem from './System/CollaborativeDiffusionField';
import CollaborativeDiffusionProcessorSystem from './System/CollaborativeDiffusionProcessor';
import mapblocks from './map-blocks'

const cursor = cursorkeys();

(function(mountnode: HTMLElement, viewwidth: number, viewheight: number) {

    loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
    loader.add('background', '/assets/sprites/level_pagras-v2.png');
    loader.add('flag', '/assets/sprites/flag.png');
    loader.once('complete', (loader, resources) => {

        /* Le stage */
        const stage = new PixiContainer(0xFF0000 /* white */, true /* interactive */);

        /* Les entités */
        const entities = [];

        const addEntity = function(entity) {
            entity.remove = () => {
                entity.getDisplayObject().parent.removeChild(entity.getDisplayObject());
                const index = entities.indexOf(entity);
                if(index === -1) return;
                entities.splice(index, 1);

                //console.log('REMOVED', index, entities.length + ' left', entities);
            };
            entities.push(entity);
            stage.addChild(entity.getDisplayObject());
        };

        /* Entities */

        // Le fond

        const buildFlag = function() {
            const flag = GenericEntity({ displayobject: new Sprite(resources.flag.texture) });
            flag.setPivot(flag.getDisplayObject().width / 2, flag.getDisplayObject().height);
            return flag;
        }

        const exit = buildFlag().setPosition(-20, 400);
        exit.fieldtarget = true;

        addEntity(exit);

        const bgsprite = new PixiExtras.TilingSprite(resources.background.texture, viewwidth, viewheight);
        bgsprite.tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);
        bgsprite.interactive = true;
        bgsprite.click = bgsprite.tap = function(event) {

            const clickpoint = event.data.getLocalPosition(bgsprite);

            if(cursor.shift) {
                const flag = buildFlag()
                    .setPosition(clickpoint.x, clickpoint.y)
                    .setTint(0xFF0000);

                flag.fieldobstacle = true;
                addEntity(flag);
            } else {
                const flag = buildFlag()
                    .setPosition(clickpoint.x, clickpoint.y);

                flag.fieldtarget = true;
                addEntity(flag);
            }
        };

        const fond = new GenericEntity({ displayobject: bgsprite });
        fond.getDisplayObject().tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);

        addEntity(fond);

        // La momie

        // On génère des positions de momies aléatoires sur les espaces praticables
        const positions = [];
        while(positions.length < 20) {
            const x = Math.floor(Math.random() * mapblocks[0].length);
            const y = Math.floor(Math.random() * mapblocks.length);
            if(mapblocks[y][x] === 1) positions.push({ x, y });
        }

        const buildMummy = function() {
            const mummytexture = resources.mummy.texture.baseTexture;
            mummytexture.scaleMode = SCALE_MODES.NEAREST;
            const mummyframes = loadspritesheet(mummytexture, 37, 45, 18);
            return Mummy({ displayobject: new PixiExtras.MovieClip(mummyframes) })
                .setCollisionArea(new Rectangle(10, 10, 20, 20))
                .setCollisionGroup('mummy')
        }

        positions.map(position => {
            addEntity(
                buildMummy()
                    .setPosition(position.x * 20 + 10, position.y * 20 + 10)
            );
        });

        const fielddebug = GenericEntity({
            id: 'fielddebug',
            displayobject: new Graphics()
        });
        
        addEntity(fielddebug);

        /* Les systèmes */

        let field = null;

        const systems = [];
        
        systems.push(new CollaborativeDiffusionFieldSystem({
            cellwidth: 20,
            cellheight: 20,
            worldwidth: viewwidth,
            worldheight: viewheight,
            map: mapblocks,
            onupdate: (newfield, oldfield) => {
                field = newfield;

                /*
                let lightenColor = (color, percent) => {
                    let amt = Math.round(2.55 * percent);
                    //let amt = 0;
                    let R = (color >> 16) + amt;
                    let B = (color >> 8 & 0x00FF) + amt;
                    let G = (color & 0x0000FF) + amt;

                    return (
                        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                        (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 +
                        (G < 255 ? G < 1 ? 0 : G : 255)
                    );
                };

                const peak = Math.pow(2, 32);
                const fielddebuggraphics = fielddebug.getDisplayObject();

                fielddebuggraphics.clear();
                fielddebuggraphics.beginFill(0xFFFFFF);
                fielddebuggraphics.alpha = 0.8;

                field.field.map((xtiles, y) => {
                    xtiles.map((cellvalue, x) => {
                        if(cellvalue === 0) return;

                        const basecolor = 0x000000;

                        const cellalpha = cellvalue / peak;

                        let color = lightenColor(basecolor, cellalpha * 10000);

                        if(cellvalue === peak) {
                            color = 0xFF0000;
                        }

                        if(cellvalue < 100000000) {
                            color = lightenColor(0xFF00FF, 50);
                        }

                        if(cellvalue < 1000000) {
                            color = lightenColor(0xFF0000, 50);
                        }

                        if(cellvalue < 10000) {
                            color = 0x00FFFF;
                        }

                        if(cellvalue < 100) {
                            color = 0xFF00FF;
                        }

                        if(cellvalue < 10) {
                            color = 0x0000FF;
                        }

                        if(cellvalue < 1) {
                            color = 0x00FF00;
                        }

                        if(cellvalue < 0.1) {
                            color = 0xFFFF00;
                        }

                        fielddebuggraphics.beginFill(color);
                        fielddebuggraphics.drawRect(x * 20, y * 20, 20, 20);
                    });
                });
                */
            }
        }));
        systems.push(new CollaborativeDiffusionProcessorSystem({
            getField: () => field
        }));
        systems.push(new DebugSystem({ stage }));

        // Autospawn !
        let timer = 0;
        systems.push({
            process: function(entities, { deltatime }) {
                timer += deltatime;

                if(timer >= 1000) {

                    timer = timer - 1000;

                    addEntity(
                        buildMummy()
                        .setPosition(1300, 400)
                    );

                    addEntity(
                        buildMummy()
                        .setPosition(900, 190)
                        .setTint(0xFF0000)
                    );
                }
            }
        })

        /* Game loop */

        const game = new GameSet(mountnode, viewwidth, viewheight);
        game.run(stage, gameloop({
            systems,
            entities
        }));
    });

    loader.load();

})(document.getElementById('app'), 1280, 720);

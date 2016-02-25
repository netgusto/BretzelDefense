'use strict';

/* @flow */

import 'perfnow';   // Polyfill for high resolution timer
import compose from './compose-js';
/*
let AspectOne = compose({
    init: function() {
        this.bof = 'yes';
    },
    props: {
        hello: 'Hello from A1',
        arr: ['one']
    }
});

let AspectTwo = compose({
    init: function() {
        this.bof = 'no';
        this.super = 'A2';
    },
    props: {
        hello: 'Hello from A2',
        arr: ['two']
    }
});

let Namable = compose({
    expects: {
        name: String
    },
    methods: {
        getName() {
            return this.name;
        }
    }
});

let Greeter = {
    init: function() { },
    props: {},
    methods: {
        sayHello() {
            return 'Hello, ' + this.getName() + ' !!!';
        }
    },
    hey: function() {
        return 'what !';
    }
};

const AspectTwelve = compose(AspectOne, AspectTwo).compose({ yo: () => 'yo' });
const GreeterTwelve = compose(AspectTwelve, Namable).compose(Greeter).compose({ f: () => 'f!' });

const jerome = GreeterTwelve({ name: 'Jérôme' });
const tania = GreeterTwelve({ name: 'Tania' });
const tania2 = GreeterTwelve.create({ name: 'Tania 2' });

console.log(jerome.sayHello(), tania.sayHello(), tania2.sayHello(), GreeterTwelve.hey(), GreeterTwelve.f(), GreeterTwelve.yo());
*/

import { Container as PixiContainer, extras as PixiExtras, SCALE_MODES, Rectangle, Sprite, Graphics, loader } from 'pixi.js';
import { GameSet, cursorkeys, loadspritesheet, gameloop } from 'bobo';

import Mummy from './Entity/Mummy';
import Flag from './Entity/Flag';
import Baikal from './Entity/Baikal';
import GenericEntity from './Entity/Generic';

import CursorSystem from './System/Cursor';
import DebugSystem from './System/Debug';
import CustomRenderSystem from './System/CustomRender';
import CollaborativeDiffusionFieldSystem from './System/CollaborativeDiffusionField';
import CollaborativeDiffusionProcessorSystem from './System/CollaborativeDiffusionProcessor';
import mapblocks from './map-blocks'

const cursor = cursorkeys();

loader.add('background', '/assets/sprites/level_pagras-v2.png');

(function(mountnode: HTMLElement, viewwidth: number, viewheight: number) {

    /* Le stage */
    const canvas = new PixiContainer(0xFF0000 /* white */, true /* interactive */);
    const game = new GameSet(mountnode, viewwidth, viewheight, canvas);
    game
        .requires(Flag, Mummy, Baikal)
        .load()
        .then(function({ loader, resources }) {

            console.log('laaa');
            /* Les entités */

            // Le fond
            /*const buildFlag = function() {
                const flag = GenericEntity({ displayobject: new Sprite(resources.flag.texture) });
                flag.setPivot(flag.getDisplayObject().width / 2, flag.getDisplayObject().height);
                return flag;
            }*/

            const exit = Flag.create().setPosition(-20, 400);
            exit.fieldtarget = true;

            game.addEntity(exit);

            const bgsprite = new PixiExtras.TilingSprite(resources.background.texture, viewwidth, viewheight);
            bgsprite.tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);
            bgsprite.interactive = true;
            bgsprite.click = bgsprite.tap = function(event) {

                const clickpoint = event.data.getLocalPosition(bgsprite);

                if(cursor.shift) {
                    const flag = Flag.create()
                        .setPosition(clickpoint.x, clickpoint.y)
                        .setTint(0xFF0000);

                    flag.fieldobstacle = true;
                    game.addEntity(flag);
                } else {
                    const flag = Flag.create()
                        .setPosition(clickpoint.x, clickpoint.y);

                    flag.fieldtarget = true;
                    game.addEntity(flag);
                }
            };

            const fond = GenericEntity.create({ displayobject: bgsprite });
            fond.getDisplayObject().tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);

            game.addEntity(fond);

            // La momie

            // On génère des positions de momies aléatoires sur les espaces praticables
            const positions = [];
            while(positions.length < 4) {
                const x = Math.floor(Math.random() * mapblocks[0].length);
                const y = Math.floor(Math.random() * mapblocks.length);
                if(mapblocks[y][x] === 1) positions.push({ x, y });
            }

            const buildMummy = function() {
                return Mummy.create()
                    .setCollisionArea(new Rectangle(10, 10, 20, 20))
                    .setCollisionGroup('mummy')
            }

            positions.map(position => {
                game.addEntity(
                    buildMummy()
                        .setPosition(position.x * 20 + 10, position.y * 20 + 10)
                );
            });

            const fielddebug = GenericEntity.create({
                id: 'fielddebug',
                displayobject: new Graphics()
            });

            game.addEntity(fielddebug);

            // Les systèmes 

            let field = null;

            game.addSystem(new CollaborativeDiffusionFieldSystem({
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


            game.addSystem(new CollaborativeDiffusionProcessorSystem({
                getField: () => field
            }));
            game.addSystem(new DebugSystem({ stage: canvas, cbk: (msg) => msg += '; '  + game.entities.length + ' entities' }));
            game.addSystem(new CustomRenderSystem());

            // Autospawn !
            let timer = 0;
            let delay = 1000;
            game.addSystem({
                process: function(entities, { deltatime }) {
                    timer += deltatime;

                    if(timer >= delay) {

                        timer = timer - delay;

                        game.addEntity(
                            buildMummy()
                            .setPosition(1300, 400)
                        );

                        game.addEntity(
                            buildMummy()
                            .setPosition(900, 190)
                            .setTint(0xFF0000)
                        );
                    }
                }
            })
        }).then(() => game.run(gameloop()));

})(document.getElementById('app'), 1280, 720);

'use strict';

/* @flow */

import { autoDetectRenderer, extras as PixiExtras, Texture, Rectangle, loader } from 'pixi.js';

// $FlowFixMe
import keyboardjs from 'keyboardjs';

export class GameSet {

    width: number;
    height: number;
    renderer: WebGLRenderer|CanvasRenderer;

    constructor(node: HTMLElement, width: number, height: number, canvas: PixiContainer ) : void {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.renderer = autoDetectRenderer(width, height);
        this.entities = new Array();
        this.systems = new Array();
        node.appendChild(this.renderer.view);
    }

    addEntity(entity: Object) {
        this.entities.push(entity);
        this.canvas.addChild(entity.getDisplayObject());
        entity.remove = () => {
            entity.getDisplayObject().parent.removeChild(entity.getDisplayObject());
            const index = this.entities.indexOf(entity);
            if(index === -1) return;
            this.entities.splice(index, 1);
        };

        return this;
    }

    getEntities() {
        return this.entities;
    }

    addSystem(system: Object) {
        this.systems.push(system);
        return this;
    }

    requires(...entities) {
        console.log('requires', entities);
        entities.map(entity => {
            console.dir(entity);
            entity.assets && entity.assets.map(cbk => cbk(loader))
        });

        //loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        //loader.add('background', '/assets/sprites/level_pagras-v2.png');
        //loader.add('flag', '/assets/sprites/flag.png');

        return this;
    }

    load() {

        const p = new Promise((resolve, reject) => {
            loader.load();
            loader.once('complete', (loader, resources) => {
                console.log('ioci');
                resolve({ loader, resources });
            });
        });

        return p;
    }

    run(cbk: Function) : void {

        const self = this;

        animate();
        function animate() {
            cbk(self);
            self.renderer.render(self.canvas);
            window.requestAnimationFrame(animate);
        }
    }
};

export function loadspritesheet(basetexture: BaseTexture, width: number, height: number, nbframes: ?number) : Array<Texture> {
    if(!basetexture.hasLoaded) { throw new Error('BaseTexture not loaded in loadspritesheet'); }
    const frames = [];

    const { realWidth, realHeight } = basetexture;

    const maxX = Math.floor(realWidth / width);
    const maxY = Math.floor(realHeight / height);

    if(!nbframes) nbframes = maxX * maxY;

    let counter = 0;

    for(let y = 0; y < maxY; y++) {
        for(let x = 0; x < maxX; x++) {
            if(counter >= nbframes) break;
            frames.push(new Texture(basetexture, new Rectangle(x * width, y * height, width, height)));
            counter++;
        }
    }

    return frames;
}

let cursors = {
    up: false,
    down: false,
    left: false,
    right: false,
    shift: false,
    alt: false,
    ctrl: false
};

keyboardjs.bind('left', () => cursors.left = true, () => cursors.left = false);
keyboardjs.bind('right', () => cursors.right = true, () => cursors.right = false);
keyboardjs.bind('up', () => cursors.up = true, () => cursors.up = false);
keyboardjs.bind('down', () => cursors.down = true, () => cursors.down = false);
keyboardjs.bind('shift', () => cursors.shift = true, () => cursors.shift = false);
keyboardjs.bind('alt', () => cursors.alt = true, () => cursors.alt = false);
keyboardjs.bind('ctrl', () => cursors.ctrl = true, () => cursors.ctrl = false);

export function cursorkeys() : {
    up: boolean; down: boolean; left: boolean; right: boolean;
    shift: boolean; alt: boolean; ctrl: boolean;
} { return cursors; }

export function gameloop() {
    let then = performance.now();
    let start;
    let costtime;

    // Systems

    return (game: GameSet) => {
        const start = performance.now();
        const deltatime = start - then;

        game.systems.map(system => {
            system.process(
                system.match ? game.entities.filter(system.match) : game.entities,
                { deltatime, costtime }
            );
        });

        then = start;
        costtime = performance.now() - start;
    };
};

'use strict';

/* @flow */

import { extras as PixiExtras, Texture, Rectangle, loader, Container } from 'pixi.js';

// $FlowFixMe
import keyboardjs from 'keyboardjs';

export class GameLayer {
    constructor(stage) : void {
        this.stage = stage;
        this.container = new Container();
        this.entities = new Array();
    }

    addEntity(entity: Object) {
        this.entities.push(entity);
        this.stage.entities.push(entity);
        this.stage.entitybyid[entity.id] = entity;
        this.container.addChild(entity.displayobject);
        entity.remove = () => {
            let index;
            entity.displayobject.parent.removeChild(entity.displayobject);

            index = this.entities.indexOf(entity);
            if(index !== -1) {
                this.entities.splice(index, 1);
            }

            index = this.stage.entities.indexOf(entity);
            if(index === -1) return;
            this.stage.entities.splice(index, 1);
            delete this.stage.entitybyid[entity.id];
        };

        return this;
    }

    addChild(displayobject) {
        this.container.addChild(displayobject);
    }

    getContainer() {
        return this.container;
    }

    sort(cbk) {
        this.container.children.sort(cbk);
    }
};

export class GameStage {

    constructor(container) : void {
        this.container = container;
        this.entities = new Array();
        this.entitybyid = {};
        this.systems = new Array();
        this.layers = new Array();
    }

    addLayer(layer) {
        this.layers.push(layer);
        this.container.addChild(layer.getContainer());
        return this;
    }

    getEntities() {
        return this.entities;
    }

    getEntity(id) {
        return this.entitybyid[id];
    }

    addSystem(system: Object) {
        this.systems.push(system);
        return this;
    }

    require(...entities) {
        entities.map(entity => entity.loadAssets && entity.loadAssets(loader));
        return this;
    }

    load({ onbegin = null, onprogress = null, oncomplete = null }) {

        const p = new Promise((resolve, reject) => {
            if(onprogress !== null) loader.onprogress((loader, loadedresource) => onprogress(loader.progress, loadedresource));
            if(onbegin !== null) onbegin();
            loader.load();
            loader.once('complete', (loader, resources) => {
                if(oncomplete !== null) oncomplete();
                resolve({ loader, resources });
            });
        });

        return p;
    }

    run(renderer, cbk) : void {
        const self = this;

        function animate() {
            cbk(self);
            renderer.render(self.container);
            window.requestAnimationFrame(animate);
        }

        animate();
        return this;
    }

    destroy() {
        this.entities.map(entity => entity.remove());
        delete this.entitybyid;

        for(let i = this.systems.length - 1; i >= 0; i--) {
            delete this.systems[i];
        }

        for(let i = this.layers.length - 1; i >= 0; i--) {
            delete this.layers[i];
        }

        delete this;
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

    return (stage: GameStage) => {
        const start = performance.now();
        const deltatime = start - then;

        stage.systems.map(system => {
            system.process(
                system.match ? stage.entities.filter(system.match) : stage.entities,
                { deltatime, costtime, game: stage }
            );
        });

        then = start;
        costtime = performance.now() - start;
    };
};

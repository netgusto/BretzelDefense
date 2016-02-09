'use strict';

/* @flow */

import { autoDetectRenderer, extras as PixiExtras, Texture, Rectangle } from 'pixi.js';

// $FlowFixMe
import keyboardjs from 'keyboardjs';

export class GameSet {

    width: number;
    height: number;
    renderer: WebGLRenderer|CanvasRenderer;

    constructor(node: HTMLElement, width: number, height: number) : void {
        this.width = width;
        this.height = height;
        this.renderer = autoDetectRenderer(width, height);
        node.appendChild(this.renderer.view);
    }

    run(stage: Container, cbk: Function) : void {

        const g = this;

        animate();
        function animate() {
            cbk(g);
            g.renderer.render(stage);
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

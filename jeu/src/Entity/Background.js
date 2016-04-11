'use strict';

/* @flow */

import compose from 'compose-js';

import { Sprite, Graphics, Text } from 'pixi.js';

import GenericEntity from './Generic';

const Background = compose(GenericEntity).compose({
    setTexturePath(texturepath) {
        Background.texturepath = texturepath;
    },
    loadAssets(loader) {
        loader.add('background', Background.texturepath);
        loader.once('complete', (_, resources) => {
            Background.texture = resources.background.texture;
        });
    },
    init: function({ viewwidth, viewheight, renderer, onclick = null }) {

        // using scaled bg as texture
        // Fixes incorrect mouse event coordinates
        const scaledtexture = new Sprite(Background.texture);
        scaledtexture.scale.set(viewwidth / Background.texture.width, viewheight / Background.texture.height);

        this.displayobject = new Sprite(scaledtexture.generateTexture(renderer));

        this.displayobject.interactive = true;
        this.displayobject.click = this.displayobject.tap = onclick;

        const pointer = new Graphics();
        const text = new Text('', { font: '10px Arial', fill: 'red' });
        text.position.set(-25, -20);

        pointer.addChild(text);
        this.displayobject.addChild(pointer);

        this.displayobject.mousemove = e => {
            pointer.clear();
            pointer.lineStyle(2, 0xFF0000);
            const glob = this.displayobject.toLocal(e.data.global);
            pointer.position.set(glob.x, glob.y);
            pointer.drawCircle(0, 0, 2);
            text.text = glob.x + ',' + glob.y;
            text.position.set(-text.width/2, -20);
        };
    }
});

export default Background;

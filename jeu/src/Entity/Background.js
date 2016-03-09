'use strict';

/* @flow */

import compose from 'compose-js';

import { Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const Background = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('background', '/assets/sprites/level_pagras-v2.png');
        loader.once('complete', (_, resources) => {
            Background.texture = resources.background.texture;
        });
    },
    init: function({ viewwidth, viewheight, onclick = null }) {
        this.displayobject = new Sprite(Background.texture);
        this.displayobject.scale.set(viewwidth / Background.texture.width, viewheight / Background.texture.height);

        this.displayobject.interactive = true;
        this.displayobject.click = this.displayobject.tap = onclick;
    }
});

export default Background;

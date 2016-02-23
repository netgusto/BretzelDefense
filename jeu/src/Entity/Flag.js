'use strict';

import stampit from 'stampit';
import { Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const Flag = stampit()
    .compose(GenericEntity)
    .init(function() {
        const sprite = new Sprite(this.texture);
        sprite.pivot.set(sprite.width / 2, sprite.height);
        this.setDisplayObject(sprite);
    });



export default function() {
    this.assets = [loader => {
        loader.add('flagtexture', '/assets/sprites/flag.png');
        loader.once('complete', (_, resources) => {
            Flag.texture = resources.flagtexture.texture;
        });
    }];
};
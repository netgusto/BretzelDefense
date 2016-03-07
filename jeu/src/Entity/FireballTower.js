'use strict';

/* @flow */

import compose from 'compose-js';

import { loadspritesheet } from 'bobo';
import { SCALE_MODES, extras as PixiExtras } from 'pixi.js';

import GenericEntity from './Generic';

const FireballTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('fireball', '/assets/sprites/fireball.png');
        loader.once('complete', (_, resources) => {
            FireballTower.texture = resources.fireball.texture.baseTexture;
            FireballTower.texture.scaleMode = SCALE_MODES.NEAREST;
            FireballTower.spriteframes = loadspritesheet(FireballTower.texture, 16, 16, 4);
        });
    },
    init: function() {
        this.hunter = true;
        this.range = 150;
        this.displayobject = new PixiExtras.MovieClip(FireballTower.spriteframes);
        this.displayobject.tint = 0xFF0000;
        this.displayobject.play();
        this.displayobject.animationSpeed = 0.15;
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height / 2);
    },
    methods: {
        engage(target, distance, centerx, centery, lasers) {
            //target.entity.setTint(0xFF0000);
            lasers.moveTo(this.displayobject.x, this.displayobject.y);
            lasers.lineTo(centerx, centery);

            target.life--;
        }
    }
});

export default FireballTower;

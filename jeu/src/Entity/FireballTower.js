'use strict';

/* @flow */

import compose from 'compose-js';

import { loadspritesheet } from 'bobo';
import { SCALE_MODES, extras as PixiExtras, Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const FireballTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('fireball', '/assets/sprites/fireball.png');
        loader.add('fireballtower', '/assets/sprites/flag.png');
        loader.once('complete', (_, resources) => {
            const fireballtexture = resources.fireball.texture.baseTexture;
            fireballtexture.scaleMode = SCALE_MODES.NEAREST;
            FireballTower.ballframes = loadspritesheet(fireballtexture, 16, 16, 4);

            FireballTower.texture = resources.fireballtower.texture;
        });
    },
    init: function() {
        this.hunter = true;
        this.range = 150;

        this.displayobject = new Sprite(FireballTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
        this.lastfired = null;
    },
    methods: {
        engage(target, distance, centerx, centery, { ballisticSystem }) {

            if(!this.lastfired || performance.now() - this.lastfired >= 700) {

                const fireball = new PixiExtras.MovieClip(FireballTower.ballframes);
                fireball.tint = 0xFF0000;
                fireball.animationSpeed = 0.15;
                fireball.position.set(this.displayobject.x, this.displayobject.y - this.displayobject.height);
                fireball.play();

                ballisticSystem.fire({
                    hunter: this,
                    target: target,
                    distance,
                    speed: 250,
                    displayobject: fireball,
                    damage: 50
                });

                this.lastfired = performance.now();
            }
        }
    }
});

export default FireballTower;

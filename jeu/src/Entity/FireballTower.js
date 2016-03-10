'use strict';

/* @flow */

import compose from 'compose-js';

import { loadspritesheet } from 'bobo';
import { SCALE_MODES, extras as PixiExtras, Sprite } from 'pixi.js';

import GenericEntity from './Generic';

// const sort = function(a, b) {
//     return (a.entity.lane.length - (a.entity.pixelswalked % a.entity.lane.length)) - (b.entity.lane.length - (b.entity.pixelswalked % b.entity.lane.length));
// };

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
        this.firerate = 1500;
        this.firedamage = 70;

        this.displayobject = new Sprite(FireballTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
        this.lastfired = performance.now();
    },
    methods: {
        engage(matches, { ballisticSystem }) {

            //matches.sort(sort);
            const match = matches[0];
            const { distance, entity } = match;

            const now = performance.now();

            if(now - this.lastfired >= this.firerate) {

                const fireball = new PixiExtras.MovieClip(FireballTower.ballframes);
                fireball.animationSpeed = 0.15;
                fireball.tint = 0XFF0000;
                fireball.pivot.set(fireball.width/2, fireball.height/2);
                fireball.scale.set(-1);
                fireball.position.set(this.displayobject.x, this.displayobject.y - this.displayobject.height);
                fireball.play();

                ballisticSystem.fire({
                    hunter: this,
                    target: entity,
                    distance,

                    // TODO: actuellement, la distance est calculée depuis la base de la tour, et pas depuis la position du tir (généralement le sommet de la tour)
                    flightduration: 400 + distance,   // la durée de vol du projectile est fonction de la distance; la durée de vol doit être fixe pour permettre le ciblage prédictif
                    displayobject: fireball,
                    damage: this.firedamage,
                    orient: true,
                    homing: false,
                    parabolic: true,
                    parabolicapex: 135  // -35: visée horizontale (flêche)
                });

                this.lastfired = now;
            }
        }
    }
});

export default FireballTower;

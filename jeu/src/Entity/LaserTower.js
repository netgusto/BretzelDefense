'use strict';

/* @flow */

import compose from 'compose-js';

import { Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const LaserTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('lasertowertexture', '/assets/sprites/flag.png');
        loader.once('complete', (_, resources) => {
            LaserTower.texture = resources.lasertowertexture.texture;
        });
    },
    init: function() {
        this.hunter = true;
        this.range = 150;
        this.displayobject = new Sprite(LaserTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
    },
    methods: {
        engage(target, distance, centerx, centery, lasers) {
            //target.entity.setTint(0xFF0000);
            lasers.moveTo(this.displayobject.x, this.displayobject.y - this.displayobject.height);
            lasers.lineTo(centerx, centery);

            target.life--;
        }
    }
});

export default LaserTower;

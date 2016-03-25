'use strict';

/* @flow */

import compose from 'compose-js';

import { Sprite } from 'pixi.js';

import GenericEntity from './Generic';
import Soldier from './Soldier';

const BarrackTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        Soldier.loadAssets(loader);

        loader.add('barracktower', '/assets/sprites/barrack.png');
        loader.once('complete', (_, resources) => {
            BarrackTower.texture = resources.barracktower.texture;
        });
    },
    init: function({ worldscale }) {
        this.displayobject = new Sprite(BarrackTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, (this.displayobject.height / 2) + (25 * worldscale));
        this.displayobject.scale.set(worldscale);
    },
    methods: {
        mount({ worldscale, clickpoint, creepslayer, meleeSystem }) {

            this.setPosition(clickpoint.x, clickpoint.y);

            const offsetpos = 20 * worldscale;

            const rangecenterpoint = [clickpoint.x, clickpoint.y + (155 * worldscale)]

            const soldier1 = Soldier({ worldscale })
                .setRangeCenterPoint(rangecenterpoint[0], rangecenterpoint[1])
                .setRallyPoint(rangecenterpoint[0] - offsetpos, rangecenterpoint[1] - offsetpos)
                .setPosition(clickpoint.x - offsetpos, clickpoint.y - offsetpos);

            const soldier2 = Soldier({ worldscale })
                .setRangeCenterPoint(rangecenterpoint[0], rangecenterpoint[1])
                .setRallyPoint(rangecenterpoint[0] + offsetpos, rangecenterpoint[1] + offsetpos)
                .setPosition(clickpoint.x + offsetpos, clickpoint.y + offsetpos);

            creepslayer
                .addEntity(this)
                .addEntity(soldier1)
                .addEntity(soldier2);

            meleeSystem.repositionHunter(soldier1);
            meleeSystem.repositionHunter(soldier2);

            return this;
        }
    }
});

export default BarrackTower;

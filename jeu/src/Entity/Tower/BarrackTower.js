'use strict';

/* @flow */

import compose from 'compose-js';

import { Sprite, Graphics } from 'pixi.js';

import eventbus from '../../Singleton/eventbus';
import GenericEntity from '../Generic';
import Soldier from '../Creep/Soldier';

const BarrackTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        Soldier.loadAssets(loader);

        loader.add('barracktower', '/assets/sprites/barrack.png');
        loader.once('complete', (_, resources) => {
            BarrackTower.texture = resources.barracktower.texture;
        });
    },
    init: function({ worldscale, whratio, meleeSystem }) {

        this.worldscale = worldscale;
        this.meleeSystem = meleeSystem;

        const range = 290;

        this.rangeX = range * worldscale;
        this.rangeY = (range / whratio) * worldscale;

        this.displayobject = new Sprite(BarrackTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, (this.displayobject.height / 2) + (25 * worldscale));
        this.displayobject.scale.set(worldscale);
    },
    methods: {
        getRangeCenterPoint() {
            return { x: this.displayobject.x, y: this.displayobject.y };
        },
        addCost(cost) {
            this.totalcost += cost;
            return this;
        },
        getTotalCost() {
            return this.totalcost;
        },
        mount({ worldscale, clickpoint, deploypoint, creepslayer }) {

            const offsetpos = 20 * worldscale;

            this.setPosition(clickpoint.x, clickpoint.y);

            this.soldier1 = Soldier({ worldscale })
                .setPosition(clickpoint.x - offsetpos, clickpoint.y - offsetpos);

            this.soldier2 = Soldier({ worldscale })
                .setPosition(clickpoint.x + offsetpos, clickpoint.y + offsetpos);

            this.setDeployPoint(deploypoint);

            creepslayer
                .addEntity(this)
                .addEntity(this.soldier1)
                .addEntity(this.soldier2);

            return this;
        },
        setDeployPoint(point) {
            const offsetpos = 20 * this.worldscale;
            this.soldier1
                .setRangeCenterPoint(point.x, point.y)
                .setRallyPoint(point.x - offsetpos, point.y - offsetpos);

            this.soldier2
                .setRangeCenterPoint(point.x, point.y)
                .setRallyPoint(point.x + offsetpos, point.y + offsetpos);

            this.meleeSystem.repositionHunter(this.soldier1);
            this.meleeSystem.repositionHunter(this.soldier2);
        },
        unmount() {
            eventbus.emit('entity.untrack.batch', [this, this.soldier1, this.soldier2]);
            eventbus.emit('entity.remove.batch', [this, this.soldier1, this.soldier2]);
        },
        getSpotMenuProps({ spot, linewidth, worldscale }) {

            const buttongraphics = new Graphics();
            buttongraphics.clear();
            buttongraphics.lineStyle(linewidth, 0x00FFFF);
            buttongraphics.beginFill(0xFFFF00);
            buttongraphics.drawCircle(0, 0, 50 * worldscale);

            const button1 = new Sprite(buttongraphics.generateTexture());

            buttongraphics.clear();
            buttongraphics.lineStyle(linewidth, 0x00FFFF);
            buttongraphics.beginFill(0x0000FF);
            buttongraphics.drawCircle(0, 0, 35 * worldscale);

            const button2 = new Sprite(buttongraphics.generateTexture());

            return { buttons: [
                {
                    displayobject: button1,
                    position: 's',
                    click: function(e) {
                        e.stopPropagation();
                        eventbus.emit('tower.sell', { spot });
                    }
                }, {
                    displayobject: button2,
                    position: 'se',
                    click: function(e) {
                        e.stopPropagation();
                        eventbus.emit('tower.redeploy', { spot });
                    }
                }
            ] };
        }
    }
});

export default BarrackTower;

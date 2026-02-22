'use strict';

/* @flow */

import compose from 'compose-js';
import { SCALE_MODES, extras as PixiExtras, Sprite, Graphics } from 'pixi.js';

import { loadspritesheet } from '../../Utils/bobo';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';
import GenericEntity from '../Generic';

const sort = function(a, b) {
    return b.entity.pixelswalked - a.entity.pixelswalked;
};

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
    init: function({ worldscale, whratio }) {
        const range = 350;
        this.worldscale = worldscale;
        this.hunter = true;
        this.rangeX = range * worldscale;
        this.rangeY = (range / whratio) * worldscale;
        this.firerate = 1500;
        this.firedamage = 70;
        this.totalcost = 0;

        this.displayobject = new Sprite(FireballTower.texture);
        this.displayobject.scale.set(worldscale);
        this.displayobject.anchor.set(.5, .5);
        this.displayobject.tint = 0xFF6600;

        this.lastfired = performance.now();
    },
    methods: {
        mount({ clickpoint, creepslayer }) {
            this.setPosition(clickpoint.x, clickpoint.y);
            creepslayer.addEntity(this);
            return this;
        },
        unmount() {
            eventbus.emit(EVENTS.ENTITY_DESPAWN_BATCH, {
                entities: [this]
            });
        },
        addCost(cost) {
            this.totalcost += cost;
            return this;
        },
        getTotalCost() {
            return this.totalcost;
        },
        getRangeCenterPoint() {
            return { x: this.displayobject.x, y: this.displayobject.y };
        },
        engage(matches, { ballisticSystem, timescale }) {

            const now = performance.now();

            if((now - this.lastfired) * timescale < this.firerate) return;

            matches.sort(sort);
            const match = matches[0];
            const { distance, entity } = match;

            const fireball = new PixiExtras.MovieClip(FireballTower.ballframes);
            fireball.animationSpeed = 0.15;
            fireball.tint = 0XFF0000;
            fireball.pivot.set(fireball.width/2, fireball.height/2);
            fireball.scale.set(this.worldscale * 2);
            fireball.position.set(this.displayobject.x, this.displayobject.y - (40 * this.worldscale));
            fireball.play();

            ballisticSystem.fire({
                hunter: this,
                target: entity,
                distance,
                flightduration: 150 + distance,
                displayobject: fireball,
                damage: this.firedamage,
                orient: true,
                homing: true,
                parabolic: false,
                parabolicapex: 135
            });

            this.lastfired = now;
        },
        ballisticHit(projectileprops) {
            const { target, displayobject } = projectileprops;

            displayobject.parent.removeChild(displayobject);

            target.life -= projectileprops.damage;
            if(target.life < 0) target.life = 0;
        },
        ballisticMiss(projectileprops) {
            projectileprops.displayobject.parent.removeChild(projectileprops.displayobject);
        },
        getSpotMenuProps({ spot, linewidth, worldscale }) {

            const buttongraphics = new Graphics();
            buttongraphics.clear();
            buttongraphics.lineStyle(linewidth, 0x00FFFF);
            buttongraphics.beginFill(0xFFFF00);
            buttongraphics.drawCircle(0, 0, 50 * worldscale);

            const button1 = new Sprite(buttongraphics.generateTexture());

            return { buttons: [
                {
                    displayobject: button1,
                    position: 's',
                    click: function(e) {
                        e.stopPropagation();
                        eventbus.emit(EVENTS.TOWER_SELL, { spot });
                    }
                }
            ] };
        }
    }
});

export default FireballTower;

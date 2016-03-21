'use strict';

/* @flow */

import compose from 'compose-js';
import { Graphics, Sprite } from 'pixi.js';
import GenericEntity from './Generic';

const sort = function(a, b) {
    return a.distance - b.distance
};

const Soldier = compose(GenericEntity).compose({
    init: function({ worldscale }) {
        this.hunter = true;
        this.range = 150 * worldscale;
        this.firerate = 1500;
        this.firedamage = 70;
        this.speedperms = 100/1000;
        this.maxlife = 100;
        this.life = this.maxlife;
        this.rallypoint = { x: 0, y: 0};

        const dot = new Graphics();
        dot.beginFill(0x7777FF);
        dot.drawCircle(0, 0, 7);

        const dottexture = dot.generateTexture();

        this.displayobject = new Sprite(dottexture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);

        this.engagedCreep = null;
    },
    methods: {
        setRallyPoint(x, y) {
            this.rallypoint = { x, y };
            return this;
        },
        getRangeCenterPoint() {
            return this.rallypoint;
        },
        getSpatialTrackPoint() {
            // on calcule le centroide de la bounding box
            const bounds = this.displayobject.getBounds();
            const centroidx = (bounds.x + bounds.width/2)|0;
            const centroidy = (bounds.y + bounds.height/2)|0;
            return { x: centroidx, y: centroidy };
        },
        engage(matches, { meleeSystem }) {

            matches.sort(sort);
            const match = matches[0];

            const engaged = matches.filter(match => match.entity.meleecount > 0);
            const unengaged = matches.filter(match => match.entity.meleecount === 0);

            engaged.sort(sort);
            unengaged.sort(sort);

            if(this.engagedCreep === null) {
                this.displayobject.tint = 0xFF0000;
                this.engagedCreep = match.entity;
                meleeSystem.fight({
                    hunter: this,
                    creep: this.engagedCreep
                });
            }
        },
        fightMelee(creep) {
            creep.life -= .5;
            if(creep.life < 0) creep.life = 0;
        },
        releaseMelee() {
            this.engagedCreep = null;
            this.displayobject.tint = 0xFFFFFF;
        },
        die() {
            this.engagedCreep = null;
            this.dead = true;
            this.remove();
        }
    }
});

export default Soldier;

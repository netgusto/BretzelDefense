'use strict';

/* @flow */

import compose from 'compose-js';
import { Graphics, Sprite } from 'pixi.js';
import GenericEntity from './Generic';

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
        this.engagedFirst = false;
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
            //return this.rallypoint;
            // on calcule le centroide de la bounding box
            const bounds = this.displayobject.getBounds();
            const centroidx = (bounds.x + bounds.width/2)|0;
            const centroidy = (bounds.y + bounds.height/2)|0;
            return { x: centroidx, y: centroidy };
        },
        engage(matches, { meleeSystem }) {

            const creep = meleeSystem.selectForEngagement(this, matches);
            if(creep !== null) {
                this.displayobject.tint = 0xFF0000;
                meleeSystem.fight({
                    hunter: this,
                    creep
                });
            }

            /*if(this.engagedFirst) return;

            matches.sort(sort);

            const engaged = matches.filter(match => match.entity.meleecount > 0);
            const unengaged = matches.filter(match => match.entity.meleecount === 0);

            //if(this.engagedCreep === null) {
            let match;
            let engagedFirst;

            if(unengaged.length) {
                match = unengaged[0];
                engagedFirst = true;
            } else {
                match = engaged[0];
                engagedFirst = false;
                if(this.engagedCreep !== null && match.entity.id === this.engagedCreep.id) {
                    match = null;
                    if(engaged.length > 1) match = engaged[1];
                }
            }

            if(this.engagedCreep === null || match !== null) {
                if(this.engagedCreep !== null) {
                    this.engagedCreep.releaseMelee();
                    this.releaseMelee();
                }

                this.displayobject.tint = 0xFF0000;
                this.engagedFirst = engagedFirst;
                this.engagedCreep = match.entity;
                this.engagedCreep.meleecount++;

                meleeSystem.fight({
                    hunter: this,
                    creep: this.engagedCreep
                });
            }
            //}
            */
        },
        fightMelee(creep) {
            creep.life -= 500;
            if(creep.life < 0) creep.life = 0;
        },
        releaseMelee() {
            this.displayobject.tint = 0xFFFFFF;
        },
        die() {
            this.dead = true;
            this.remove();
        }
    }
});

export default Soldier;

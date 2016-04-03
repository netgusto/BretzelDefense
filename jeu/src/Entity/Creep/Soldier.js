'use strict';

/* @flow */

import compose from 'compose-js';
import { Sprite } from 'pixi.js';
import GenericEntity from '../Generic';

const Soldier = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('soldier', '/assets/sprites/soldier.png');
        loader.once('complete', (_, resources) => {
            Soldier.texture = resources.soldier.texture;
        });
    },
    init: function({ worldscale }) {
        this.hunter = true;
        this.rangeX = 90 * worldscale;
        this.firerate = 1500;
        this.firedamage = 70;
        this.speedperms = (100 * worldscale)/1000;
        this.maxlife = 100;
        this.life = this.maxlife;
        this.rallypoint = { x: 0, y: 0 };
        this.rangecenterpoint = { x: 0, y: 0 };

        this.displayobject = new Sprite(Soldier.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, (this.displayobject.height / 2) + (25 * worldscale));
        this.displayobject.scale.set(worldscale);

        /*
        const dot = new Graphics();
        dot.beginFill(0x7777FF);
        dot.drawCircle(0, 0, 7);

        const dottexture = dot.generateTexture();

        this.displayobject = new Sprite(dottexture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
        */

        this.lastfired = null;
    },
    methods: {

        // Principe:
        // * rallyPoint définit le point de repositionnement du soldat après un combat; décallé des soldats du même groupe de quelques pixels
        // * rangeCenterPoint définit le point autour duquel la portée d'interception du soldat est calculée; il s'agit du même point pour tous les soldats d'un même groupe, de sorte que leur comportement d'interception soit cohérent en tant que groupe
        // * spatialTrackPoint représente le point de présence physique du soldat dans le monde à chaque instant; il permet de déterminer le creep effectivement le plus proche du soldat

        setRallyPoint(x, y) {
            this.rallypoint = { x, y };
            return this;
        },
        getRangeCenterPoint() {
            return this.rangecenterpoint;
        },
        setRangeCenterPoint(x, y) {
            this.rangecenterpoint = { x, y };
            return this;
        },
        getSpatialTrackPoint() {
            // on calcule le centroide de la bounding box
            const bounds = this.displayobject.getBounds();
            const centroidx = (bounds.x + bounds.width/2)|0;
            const centroidy = (bounds.y + bounds.height/2)|0;
            return { x: centroidx, y: centroidy };
        },
        // engage: ballistique comme melee
        engage(matches, { meleeSystem }) {
            const creep = meleeSystem.selectForEngagement(this, matches);
            if(creep !== null) {
                meleeSystem.fight({
                    hunter: this,
                    creep
                });
            }
        },
        fightMelee(creep) {

            const now = performance.now();

            if(this.lastfire !== null && (now - this.lastfired) < this.firerate) return;

            this.displayobject.tint = 0xFF0000;
            creep.life -= 7;
            if(creep.life < 0) creep.life = 0;

            this.lastfired = now;
        },
        releaseMelee() {
            this.lastfired = null;
            this.displayobject.tint = 0xFFFFFF;
        },
        die() {
            this.dead = true;
            this.remove();
        }
    }
});

export default Soldier;

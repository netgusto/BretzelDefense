'use strict';

/* @flow */

import compose from 'compose-js';

import { SCALE_MODES, Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const sort = function(a, b) {
    //return (b.entity.lane.length - (b.entity.pixelswalked % b.entity.lane.length)) - (a.entity.lane.length - (a.entity.pixelswalked % a.entity.lane.length));
    return b.entity.pixelswalked - a.entity.pixelswalked;
};

const ArcherPinTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('arrow', '/assets/sprites/arrow.png');
        loader.add('archerpintower', '/assets/sprites/flag.png');
        loader.add('bloodspray', '/assets/sprites/bloodspray.png');
        loader.once('complete', (_, resources) => {
            ArcherPinTower.arrowtexture = resources.arrow.texture;
            ArcherPinTower.arrowtexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherPinTower.bloodspraytexture = resources.bloodspray.texture;
            ArcherPinTower.bloodspraytexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherPinTower.texture = resources.archerpintower.texture;
        });
    },
    init: function({ worldscale }) {
        this.hunter = true;
        this.rangeX = 200 * worldscale;
        this.firerate = 700;
        this.firedamage = 9;

        this.displayobject = new Sprite(ArcherPinTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
        this.lastfired = performance.now();
    },
    methods: {
        getRangeCenterPoint() {
            return { x: this.displayobject.x, y: this.displayobject.y };
        },
        engage(matches, { ballisticSystem }) {

            const now = performance.now();

            if((now - this.lastfired) < this.firerate) return;

            matches.sort(sort);
            const match = matches[0];
            const { distance, entity } = match;

            const projectile = new Sprite(ArcherPinTower.arrowtexture);
            projectile.scale.set(0.5);
            projectile.pivot.set(projectile.width/2, projectile.height/2);
            projectile.position.set(this.displayobject.x, this.displayobject.y - this.displayobject.height);

            ballisticSystem.fire({
                hunter: this,
                target: entity,
                distance,

                // TODO: actuellement, la distance est calculée depuis la base de la tour, et pas depuis la position du tir (généralement le sommet de la tour)
                flightduration: 250 + distance,   // la durée de vol du projectile est fonction de la distance; la durée de vol doit être fixe pour permettre le ciblage prédictif
                displayobject: projectile,
                damage: this.firedamage,
                orient: true,
                homing: false,
                parabolic: true,
                parabolicapex: -35  // -35: visée horizontale (flêche)
            });

            this.lastfired = now;
        },
        ballisticHit(projectileprops) {
            const { target, displayobject } = projectileprops;

            setTimeout(function() {
                // On remplace la flêche par une éclaboussure de sang
                displayobject.parent.removeChild(displayobject);
            }, 20);

            displayobject.texture = ArcherPinTower.bloodspraytexture;
            displayobject.scale.set(0.25);
            displayobject.pivot.set(displayobject.width/2, displayobject.height/2);
            displayobject.alpha = 0.7;
            displayobject.rotation = Math.random() * 2 * Math.PI;

            target.life -= projectileprops.damage;
            if(target.life < 0) target.life = 0;

            //console.log(displayobject.x, displayobject.y);
        },
        ballisticMiss(projectileprops) {
            const displayobject = projectileprops.displayobject;
            setTimeout(function() {
                displayobject.parent.removeChild(displayobject);
            }, 1000);
        }
    }
});

export default ArcherPinTower;

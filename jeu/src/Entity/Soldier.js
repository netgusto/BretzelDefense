'use strict';

/* @flow */

import compose from 'compose-js';
import { Graphics, Sprite } from 'pixi.js';
import GenericEntity from './Generic';

const sort = function(a, b) {
    return (a.distance - b.distance);
};

const Soldier = compose(GenericEntity).compose({
    init: function({ worldscale }) {
        this.hunter = true;
        this.range = 100 * worldscale;
        this.firerate = 1500;
        this.firedamage = 70;

        const dot = new Graphics();
        //dot.lineStyle(1, 0x0000FF);
        dot.beginFill(0x0000FF);
        dot.drawCircle(0, 0, 7);

        const dottexture = dot.generateTexture();

        this.displayobject = new Sprite(dottexture);
        this.displayobject.pivot.set(this.displayobject.width / 2, this.displayobject.height);
        this.lastfired = null;
        this.rallypoint = [0, 0];
    },
    methods: {
        setRallyPoint(x, y) {
            this.rallypoint = [x, y];
            return this;
        },
        engage(matches, { meleeSystem }) {

            if(meleeSystem.isEngaged(this)) return;

            matches.sort(sort);
            const match = matches[0];

            meleeSystem.fight({
                hunter: this,
                creep: match.entity
            });

            //this.hunter = false;

            /*
            ballisticSystem.fire({
                hunter: this,
                target: entity,
                distance,

                // TODO: actuellement, la distance est calculée depuis la base de la tour, et pas depuis la position du tir (généralement le sommet de la tour)
                flightduration: 150 + distance,   // la durée de vol du projectile est fonction de la distance; la durée de vol doit être fixe pour permettre le ciblage prédictif
                displayobject: fireball,
                damage: this.firedamage,
                orient: true,
                homing: true,
                parabolic: false,
                parabolicapex: 135  // -35: visée horizontale (flêche)
            });
            */
        },
        ballisticHit(projectileprops) {
            const { target, displayobject } = projectileprops;

            displayobject.parent.removeChild(displayobject);

            target.life -= projectileprops.damage;
            if(target.life < 0) target.life = 0;
        },
        ballisticMiss(projectileprops) {
            projectileprops.displayobject.parent.removeChild(projectileprops.displayobject);
        }
    }
});

export default Soldier;

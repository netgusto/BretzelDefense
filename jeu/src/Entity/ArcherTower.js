'use strict';

// TODO
// * 2 flêches en parallèle
// * animer les archers sur le toit du bâtiment

import compose from 'compose-js';

import { SCALE_MODES, Sprite } from 'pixi.js';

import GenericEntity from './Generic';

const sort = function(a, b) {
    //return (b.entity.lane.length - (b.entity.pixelswalked % b.entity.lane.length)) - (a.entity.lane.length - (a.entity.pixelswalked % a.entity.lane.length));
    return b.entity.pixelswalked - a.entity.pixelswalked;
};

const ArcherTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('arrow', '/assets/sprites/arrow.png');
        loader.add('archertower', '/assets/sprites/archertower.png');
        loader.add('bloodspray', '/assets/sprites/bloodspray.png');
        loader.once('complete', (_, resources) => {
            ArcherTower.arrowtexture = resources.arrow.texture;
            ArcherTower.arrowtexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherTower.bloodspraytexture = resources.bloodspray.texture;
            ArcherTower.bloodspraytexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherTower.texture = resources.archertower.texture;
        });
    },
    init: function({ worldscale }) {
        this.worldscale = worldscale;
        this.hunter = true;
        this.range = 250 * worldscale;
        this.firerate = 700;
        this.firedamage = 9;

        this.displayobject = new Sprite(ArcherTower.texture);
        this.displayobject.pivot.set(this.displayobject.width / 2, (this.displayobject.height / 2) + (45 * worldscale));
        this.lastfired = performance.now();
        this.displayobject.scale.set(worldscale);
    },
    methods: {
        getRangeCenterPoint() {
            return { x: this.displayobject.x, y: this.displayobject.y };
        },
        engage(matches, { ballisticSystem }) {

            const now = performance.now();

            if((now - this.lastfired) < this.firerate) return;

            matches.sort(sort);

            const fire = (match, archer) => {
                const { distance, entity } = match;

                const projectile = new Sprite(ArcherTower.arrowtexture);
                projectile.scale.set(0.75);
                projectile.pivot.set(projectile.width/2, projectile.height/2);

                if(archer === 'left') {
                    projectile.position.set(this.displayobject.x - (25 * this.worldscale), this.displayobject.y - (75 * this.worldscale));
                } else {
                    projectile.position.set(this.displayobject.x + (25 * this.worldscale), this.displayobject.y - (75 * this.worldscale));
                }

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
            };

            // Each archer targets the creep on his side
            // They both target the same if only one creep is reachable
            let matchleft = matches[0];
            let matchright;

            if(matches.length > 1) {
                matchright = matches[1];
                if(matchright.entity.displayobject.x < matchleft.entity.displayobject.x) {
                    let exchange = matchleft;
                    matchleft = matchright;
                    matchright = exchange;
                }
            } else {
                matchright = matchleft;
            }

            fire(matchleft, 'left');
            fire(matchright, 'right');

            this.lastfired = now;
        },
        ballisticHit(projectileprops) {
            const { target, displayobject } = projectileprops;

            setTimeout(function() {
                // On remplace la flêche par une éclaboussure de sang
                displayobject.parent.removeChild(displayobject);
            }, 100);

            displayobject.texture = ArcherTower.bloodspraytexture;
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

export default ArcherTower;

'use strict';

// TODO
// * 2 flêches en parallèle
// * animer les archers sur le toit du bâtiment

import compose from 'compose-js';
import { SCALE_MODES, Sprite, Graphics } from 'pixi.js';

import eventbus from '../../Singleton/eventbus';
import timers from '../../Singleton/timers';

import GenericEntity from '../Generic';

const sort = function(a, b) {
    //return (b.entity.lane.length - (b.entity.pixelswalked % b.entity.lane.length)) - (a.entity.lane.length - (a.entity.pixelswalked % a.entity.lane.length));
    return b.entity.pixelswalked - a.entity.pixelswalked;
};

const ArcherTower = compose(GenericEntity).compose({
    loadAssets(loader) {
        loader.add('arrow', '/assets/sprites/arrow.png');
        loader.add('archertower', '/assets/sprites/archertower.png');
        loader.add('archertowerfacade', '/assets/sprites/archertower-facade.png');
        loader.add('archer', '/assets/sprites/archer.png');
        loader.add('bloodspray', '/assets/sprites/bloodspray.png');
        loader.once('complete', (_, resources) => {
            ArcherTower.arrowtexture = resources.arrow.texture;
            ArcherTower.arrowtexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherTower.bloodspraytexture = resources.bloodspray.texture;
            ArcherTower.bloodspraytexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherTower.archertexture = resources.archer.texture;
            ArcherTower.archertexture.scaleMode = SCALE_MODES.NEAREST;

            ArcherTower.texture = resources.archertower.texture;
            ArcherTower.facadetexture = resources.archertowerfacade.texture;
        });
    },
    init: function({ worldscale, whratio }) {

        const range = 290;
        this.worldscale = worldscale;
        this.hunter = true;
        this.rangeX = range * worldscale;
        this.rangeY = (range / whratio) * worldscale;
        this.firerate = 1200;
        this.firedamage = 8;

        this.displayobject = new Sprite(ArcherTower.texture);
        this.displayobject.scale.set(worldscale);
        this.displayobject.anchor.set(.5, .5);

        this.archerleft = new Sprite(ArcherTower.archertexture);
        this.displayobject.addChild(this.archerleft);
        this.archerleft.pivot.set(this.archerleft.width / 2, this.archerleft.height / 2);
        this.archerleft.position.set(-20, -60); // pas de worldscale; traité par le transform du container (la tour)
        this.archerleft.tint = 0xFF0000;

        this.archerright = new Sprite(ArcherTower.archertexture);
        this.displayobject.addChild(this.archerright);
        this.archerright.pivot.set(this.archerleft.width / 2, this.archerleft.height / 2);
        this.archerright.position.set(15, -60); // pas de worldscale; traité par le transform du container (la tour)

        const facade = new Sprite(ArcherTower.facadetexture);
        facade.anchor.set(.5, .5);
        this.displayobject.addChild(facade);

        this.lastfired = performance.now();
    },
    methods: {
        mount({/* worldscale,*/ clickpoint, creepslayer }) {
            this.setPosition(clickpoint.x, clickpoint.y);
            creepslayer.addEntity(this);
            return this;
        },
        unmount() {
            eventbus.emit('entity.untrack.batch', [this]);
            eventbus.emit('entity.remove.batch', [this]);
        },
        getRangeCenterPoint() {
            return { x: this.displayobject.x, y: this.displayobject.y };
        },
        engage(matches, { ballisticSystem, timescale }) {

            const now = performance.now();

            if((now - this.lastfired) * timescale < this.firerate) return;

            matches.sort(sort);

            const fire = (match, archerside) => {
                const { distance, entity } = match;

                const projectile = new Sprite(ArcherTower.arrowtexture);
                projectile.scale.set(this.worldscale);
                projectile.pivot.set(projectile.width/2, projectile.height/2);

                const archer = archerside === 'left' ? this.archerleft : this.archerright;
                const archerposition = this.displayobject.toGlobal(archer.position);

                projectile.position.set(archerposition.x, archerposition.y);

                if(archerposition.x < entity.displayobject.x) {
                    archer.scale.set(Math.abs(archer.scale.x) * -1, archer.scale.y);
                } else {
                    archer.scale.set(Math.abs(archer.scale.x), archer.scale.y);
                }

                ballisticSystem.fire({
                    hunter: this,
                    target: entity,
                    distance,
                    flightduration: 350 + distance,   // la durée de vol du projectile est fonction de la distance; la durée de vol doit être fixe pour permettre le ciblage prédictif
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

            timers.addTimeout(function() {
                // On remplace la flêche par une éclaboussure de sang
                displayobject.parent.removeChild(displayobject);
            }, 100);

            displayobject.texture = ArcherTower.bloodspraytexture;
            displayobject.scale.set(0.5 * this.worldscale);
            displayobject.pivot.set(displayobject.width/2, displayobject.height/2);
            displayobject.alpha = 0.7;
            displayobject.rotation = Math.random() * 2 * Math.PI;

            target.life -= projectileprops.damage;
            if(target.life < 0) target.life = 0;

            //console.log(displayobject.x, displayobject.y);
        },
        ballisticMiss(projectileprops) {
            const displayobject = projectileprops.displayobject;
            timers.addTimeout(function() {
                displayobject.parent.removeChild(displayobject);
            }, 1000);
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
                        eventbus.emit('tower.sell', { spot });
                    }
                }
            ] };
        }
    }
});

export default ArcherTower;

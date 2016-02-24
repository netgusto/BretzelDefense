'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from '../compose-js';

import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';
import Pathable from '../Component/Pathable';
import CustomRenderable from '../Component/CustomRenderable';
import CollaborativeDiffusionFieldAgent from '../Component/CollaborativeDiffusionFieldAgent';

import { Container as PixiContainer, extras as PixiExtras, SCALE_MODES, Rectangle, Sprite, Graphics, loader, Text } from 'pixi.js';

let Mummy = compose(GenericEntity, CollaborativeDiffusionFieldAgent, CustomRenderable, {
    loadAssets(loader) {

        loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        loader.once('complete', (_, resources) => {
            Mummy.texture = resources.mummy.texture.baseTexture;
            Mummy.texture.scaleMode = SCALE_MODES.NEAREST;
            Mummy.spriteframes = loadspritesheet(Mummy.texture, 37, 45, 18);
        });
    },
    init: function() {

        this.setDisplayObject(new PixiExtras.MovieClip(Mummy.spriteframes));
        const displayobject = this.getDisplayObject();

        displayobject.play();
        displayobject.pivot.set(displayobject.width/2, displayobject.height - 10);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea

        const text = new Text('', { font: '10px Arial', fill: 'red' });
        text.position.set(0, -25);
        text.text = this.getId();
        displayobject.addChild(text);
        displayobject.interactive = true;
        displayobject.click = () => {
            //console.log(this.getId() + '; ' + this.walk.state);
        };

        this.setCustomRenderMethod(() => {
            //console.log(this.getId());
            text.text = this.getId() + '; ' + this.walk.state;
            if(displayobject.scale.x === -1) {
                text.scale.set(-1, 1);
            } else {
                text.scale.set(1);
            }
        });

        this.doStop();
    },
    methods: {
        collaborativeDiffusionFieldUpdate({ deltatime, field }) {

            const pixelposition = this.getPosition();
            const fieldposition = field.getFieldPositionForPixelPosition(pixelposition.x, pixelposition.y);
            const direction = field.climb(fieldposition.x, fieldposition.y);

            const reachedGoals = field.getGoalsAtPosition(fieldposition.x, fieldposition.y);
            if(reachedGoals.length) {
                this.remove();
                return;
            }

            if(direction === null) {
                this.doStop();
            } else {
                this.doRun();
            }

            switch(direction) {
                case 'n': {
                    this.up(deltatime); break;
                }
                case 'ne': {
                    this.up(deltatime); this.right(deltatime); break;
                }
                case 'e': {
                    this.right(deltatime); break;
                }
                case 'se': {
                    this.down(deltatime); this.right(deltatime); break;
                }
                case 's': {
                    this.down(deltatime); break;
                }
                case 'sw': {
                    this.down(deltatime); this.left(deltatime); break;
                }
                case 'w': {
                    this.left(deltatime); break;
                }
                case 'nw': {
                    this.up(deltatime); this.left(deltatime); break;
                }
            }
        }
    }
}, Walkable, Pathable);

export default Mummy;

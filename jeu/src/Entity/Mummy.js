'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { extras as PixiExtras, SCALE_MODES } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';
import Pathable from '../Component/Pathable';
import CollaborativeDiffusionFieldAgent from '../Component/CollaborativeDiffusionFieldAgent';
import Debugable from '../Component/Debugable';

let Mummy = compose(GenericEntity, CollaborativeDiffusionFieldAgent).compose({
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
            } else if(this.walk.state === 'idle') {
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
}).compose(Debugable, Walkable, Pathable);

export default Mummy;

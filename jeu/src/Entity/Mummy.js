'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';
import { DisplayObject, extras as PixiExtras, SCALE_MODES } from 'pixi.js';
import { loadspritesheet } from 'bobo';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';
import CollaborativeDiffusionFieldAgent from '../Component/CollaborativeDiffusionFieldAgent';
import Debugable from '../Component/Debugable';
import CustomRenderable from '../Component/CustomRenderable';

import { lanes } from '../map-blocks';

let Mummy = compose(GenericEntity, CollaborativeDiffusionFieldAgent, Walkable, CustomRenderable).compose({
    expects: {
        displayobject: DisplayObject
    },
    loadAssets(loader) {
        loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
        loader.once('complete', (_, resources) => {
            Mummy.texture = resources.mummy.texture.baseTexture;
            //Mummy.texture.scaleMode = SCALE_MODES.NEAREST;
            Mummy.spriteframes = loadspritesheet(Mummy.texture, 37, 45, 18);
        });
    },
    init: function() {

        this.displayobject.scale.set((25/37)*(1280/1680), (35/45)*(720/945));
        //console.log(this.displayobject.scale);
        this.displayobject.play();
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea

        this.doStop();

        this.cellwidth = 10;
        this.cellheight = 10;
        this.nbcellsx = 128;
        this.nbcellsy = 72;
    },
    methods: {
        setLane(lane) {
            this.lane = lane;
            return this;
        },
        getFieldPositionForPixelPosition(x, y) {
            let cellx = Math.floor(x / this.cellwidth);
            let celly = Math.floor(y / this.cellheight);

            if(cellx < 0) { cellx = 0; }
            else if(cellx > this.nbcellsx-1) { cellx = this.nbcellsx-1; }

            if(celly < 0) { celly = 0; }
            else if(celly > this.nbcellsy-1) { celly = this.nbcellsy-1; }

            return { x: cellx, y: celly };
        },
        render({ deltatime }) {
            //console.log(deltatime);

            const pixelposition = this.getPosition();
            const fieldposition = this.getFieldPositionForPixelPosition(pixelposition.x, pixelposition.y);
            let direction = lanes[this.lane][fieldposition.y][fieldposition.x];

            if(!direction && fieldposition.x > 0) {
                direction = lanes[this.lane][fieldposition.y][fieldposition.x - 1];
            }

            if(!direction && fieldposition.x < (this.nbcellsx - 1)) {
                direction = lanes[this.lane][fieldposition.y][fieldposition.x + 1];
            }

            this.doRun();

            switch(direction) {
                case 2: {
                    this.up(deltatime); break;
                }
                case 3: {
                    this.up(deltatime); this.right(deltatime); break;
                }
                case 6: {
                    this.right(deltatime); break;
                }
                case 9: {
                    this.down(deltatime); this.right(deltatime); break;
                }
                case 8: {
                    this.down(deltatime); break;
                }
                case 7: {
                    this.down(deltatime); this.left(deltatime); break;
                }
                case 4: {
                    this.left(deltatime); break;
                }
                case 1: {
                    this.up(deltatime); this.left(deltatime); break;
                }
            }
        },
        collaborativeDiffusionFieldUpdate({ deltatime, field }) {

            const pixelposition = this.getPosition();
            const fieldposition = field.getFieldPositionForPixelPosition(pixelposition.x-5, pixelposition.y-5);
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
});

export default Mummy;

'use strict';

import compose from 'compose-js';
import { Sprite, Graphics } from 'pixi.js';

import eventbus from '../../Singleton/eventbus';
import GenericEntity from '../Generic';

const recursiveremove = function(node) {
    if(node === undefined) return;
    for(let i = node.children.length; i >= 0; i--) {
        recursiveremove(node.children[i]);
    }
    node.parent.removeChild(node);
};

export default compose(GenericEntity, {
    init: function({ /*spot, */worldscale }) {

        this.worldscale = worldscale;
        this.linewidth = 15 * worldscale|0;
        this.displayobject = new Sprite();
    },
    methods: {
        disable() {
            this.spot = null;
            this.displayobject.renderable = false;
            this.displayobject.interactive = false;

            // clearing menu
            for(let i = this.displayobject.children.length; i >= 0; i--) {
                recursiveremove(this.displayobject.children[i]);
            }
        },
        enable(spot) {
            this.spot = spot;
            this.displayobject.renderable = true;
            this.displayobject.interactive = true;

            let menuprops = null;
            if(spot.tower === null) {
                menuprops = this.getEmptySpotMenuProps({ spot, linewidth: this.linewidth, worldscale: this.worldscale });
            } else {
                menuprops = spot.tower.getSpotMenuProps({ spot, linewidth: this.linewidth, worldscale: this.worldscale });
            }

            if(menuprops !== null) this.buildMenu(menuprops);
        },
        getEmptySpotMenuProps({ spot, linewidth, worldscale }) {
            const buttongraphics = new Graphics();
            buttongraphics.clear();
            buttongraphics.lineStyle(linewidth, 0x00FFFF);
            buttongraphics.beginFill(0xFF0000);
            buttongraphics.drawCircle(0, 0, 50 * worldscale);

            const button1 = new Sprite(buttongraphics.generateTexture());

            buttongraphics.clear();
            buttongraphics.lineStyle(linewidth, 0x00FFFF);
            buttongraphics.beginFill(0x0000FF);
            buttongraphics.drawCircle(0, 0, 50 * worldscale);

            const button2 = new Sprite(buttongraphics.generateTexture());

            return {
                buttons: [{
                    displayobject: button1,
                    click: function(e) {
                        e.stopPropagation();
                        eventbus.emit('tower.add', { spot, type: 'ArcherTower' });
                    }
                }, {
                    displayobject: button2,
                    click: function(e) {
                        e.stopPropagation();
                        eventbus.emit('tower.add', { spot, type: 'BarrackTower' });
                    }
                }]
            };
        },
        buildMenu({ buttons }) {
            const menugraphics = new Graphics();
            menugraphics.lineStyle(this.linewidth, 0x00FFFF);
            menugraphics.drawCircle(0, 0, 150 * this.worldscale);

            const ring = new Sprite(menugraphics.generateTexture());
            ring.pivot.set(ring.width/2, ring.height/2);
            ring.position.set(this.displayobject.width/2, this.displayobject.height/2);
            this.displayobject.addChild(ring);

            const ringradius = ring.width/2;
            const deg45rad = Math.PI / 4;
            const radians = { 45: deg45rad, 135: deg45rad * 3, 225: deg45rad * 5, 315: deg45rad * 7 };

            const positions = {
                nw: [ringradius * Math.cos(radians[225]) + this.linewidth/2, ringradius * Math.sin(radians[225]) + this.linewidth/2],
                n: [0, -1 * ringradius + this.linewidth],
                ne: [ringradius * Math.cos(radians[315]) - this.linewidth/2, ringradius * Math.sin(radians[315]) + this.linewidth/2], // OK
                e: [ringradius - this.linewidth, 0],
                se: [ringradius * Math.cos(radians[45]) - this.linewidth/2, ringradius * Math.sin(radians[45]) - this.linewidth/2], // OK
                s: [0, ringradius - this.linewidth],
                sw: [ringradius * Math.cos(radians[135] + this.linewidth/2), ringradius * Math.sin(radians[135]) - this.linewidth/2], // OK
                w: [-1 * ringradius + this.linewidth, 0]
            };

            let actualpositions;

            if(buttons.length === 0) return;
            if(buttons.length === 1) {
                actualpositions = ['n'];
            } else if(buttons.length === 2) {
                actualpositions = ['n', 's'];
            } else if(buttons.length === 3) {
                actualpositions = ['nw', 'ne', 's'];
            } else if(buttons.length === 4) {
                actualpositions = ['nw', 'ne', 'sw', 'se'];
            } else if(buttons.length === 5) {
                actualpositions = ['nw', 'n', 'ne', 'sw', 'se'];
            } else if(buttons.length === 6) {
                actualpositions = ['nw', 'n', 'ne', 'sw', 's', 'se'];
            }

            for(let i = 0; i < buttons.length; i++) {
                const buttonprops = buttons[i];
                const { displayobject: button, click } = buttonprops;
                const positionname = 'position' in buttonprops ? buttonprops.position : actualpositions[i];
                const position = positions[positionname];
                button.pivot.set(button.width/2, button.height/2);
                button.position.set(position[0], position[1])
                button.interactive = true;
                button.click = button.tap = click;
                this.displayobject.addChild(button);
            }
        }
    }
});

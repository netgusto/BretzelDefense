'use strict';

import compose from 'compose-js';
import { Sprite, Graphics } from 'pixi.js';

import GenericEntity from './Generic';

const TowerMenu = compose(GenericEntity, {
    init: function({ spot, worldscale, eventbus }) {

        this.spot = spot;
        const linewidth = 15 * worldscale|0;
        const menugraphics = new Graphics();
        menugraphics.lineStyle(linewidth, 0x00FFFF);
        menugraphics.drawCircle(0, 0, 150 * worldscale);

        this.displayobject = new Sprite(menugraphics.generateTexture());
        this.displayobject.pivot.set(this.displayobject.width/2, this.displayobject.height/2);
//        this.displayobject.interactive = true;
  //      this.displayobject.click = function(e) {
            //e.stopPropagation();
    //    };

        menugraphics.clear();
        menugraphics.lineStyle(linewidth, 0x00FFFF);
        menugraphics.beginFill(0xFF0000);
        menugraphics.drawCircle(0, 0, 50 * worldscale);

        const button = new Sprite(menugraphics.generateTexture());
        button.pivot.set(button.width/2, button.height/2);
        button.position.set(this.displayobject.width/2, linewidth);
        button.interactive = true;
        button.click = function(e) {
            e.stopPropagation();
            eventbus.emit('tower.add', { spot, type: 'ArcherTower' });
        };
        this.displayobject.addChild(button);

        menugraphics.clear();
        menugraphics.lineStyle(linewidth, 0x00FFFF);
        menugraphics.beginFill(0x0000FF);
        menugraphics.drawCircle(0, 0, 50 * worldscale);

        const button2 = new Sprite(menugraphics.generateTexture());
        button2.pivot.set(button.width/2, button.height/2);
        button2.position.set(this.displayobject.width/2, this.displayobject.height - linewidth);
        button2.interactive = true;
        button2.click = function(e) {
            e.stopPropagation();
            eventbus.emit('tower.add', { spot, type: 'BarrackTower' });
        };
        this.displayobject.addChild(button2);

    },
    methods: {
        disable() {
            this.displayobject.renderable = false;
            this.displayobject.interactive = false;
            this.displayobject.children.map(function(child) {
                child.renderable = false;
                child.interactive = false;
            });
        },
        enable() {
            this.displayobject.renderable = true;
            this.displayobject.interactive = true;
            this.displayobject.children.map(function(child) {
                child.renderable = true;
                child.interactive = true;
            });
        }
    }
});

export default TowerMenu;

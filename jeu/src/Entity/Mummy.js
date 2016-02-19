'use strict';

/* @flow */

import stampit from 'stampit';

import GenericEntity from './Generic';
import Walkable from '../Component/Walkable';
import Pathable from '../Component/Pathable';
import CustomRenderable from '../Component/CustomRenderable';

import { Graphics } from 'pixi.js';

let Mummy = stampit().compose(GenericEntity, Walkable, Pathable, CustomRenderable).init(function() {

    const displayobject = this.getDisplayObject();
    displayobject.play();
    displayobject.pivot.set(displayobject.width/2, displayobject.height - 10);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea

    this.doStop();

    const cellwidth = 20;
    const cellheight = 20;

    const routegraphics = new Graphics();
    routegraphics.pivot.set(cellwidth/2, 0);
    this.getDisplayObject().addChild(routegraphics);

    const getRectangleForGridCell = gridcell => {
        return {
            x: gridcell.x * cellwidth,
            y: gridcell.y * cellheight,
            width: cellwidth,
            height: cellheight
        };
    };

    this.setCustomRenderMethod(params => {
        if(!this.isEnRoute()) return;

        this.getDisplayObject().tint = 0x00FFFF;

        routegraphics.clear();
        routegraphics.beginFill(0xFFFF00);
        routegraphics.alpha = 0.5;

        //const mummypos = this.getPosition();
        //const localmummypos = this.getDisplayObject().toLocal(mummypos);
        //routegraphics.drawRect(localmummypos.x, localmummypos.y, cellwidth, cellheight);

        this.getRoute().map(point => {
            const rect = getRectangleForGridCell(point);
            const localpos = this.getDisplayObject().toLocal(rect);
            routegraphics.drawRect(localpos.x, localpos.y, rect.width, rect.height);
        });
    });
});

export default Mummy;

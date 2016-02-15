'use strict';

/* @flow */

export default class AnimationSystem {

    viewwidth: number;
    viewheight: number;

    constructor(viewwidth: number, viewheight: number) {
        this.viewwidth = viewwidth;
        this.viewheight = viewheight;
    }

    match(item: DisplayObject) : boolean {
        return item.gum && item.gum.implements && item.gum.implements('Animable');
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) : void {
        //console.log(entities);
        const radianssecond = (Math.PI * 2) * 1;
        const radiansms = radianssecond / 1000;

        entities.map(item => {

            item.rotation += radiansms * deltatime;

            // $FlowFixMe
            const speedms = item.gum.getSpeed() / 1000;
            const itemBounds = item.getBounds();

            if(itemBounds.x < 0) {
                // $FlowFixMe
                item.gum.flipDirectionX();
            } else if(itemBounds.x + itemBounds.width >= this.viewwidth) {
                // $FlowFixMe
                item.gum.flipDirectionX();
            }

            if(itemBounds.y < 0) {
                // $FlowFixMe
                item.gum.flipDirectionY();
            } else if(itemBounds.y + itemBounds.height >= this.viewheight) {
                // $FlowFixMe
                item.gum.flipDirectionY();
            }

            const direction = item.gum.getDirection();

            // $FlowFixMe
            item.x += speedms * deltatime * direction.x;
            // $FlowFixMe
            item.y += speedms * deltatime * direction.y;
        });
    }
}

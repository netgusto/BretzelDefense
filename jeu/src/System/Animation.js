'use strict';

/* @flow */

export default class AnimationSystem {

    viewwidth: number;
    viewheight: number;

    constructor(viewwidth: number, viewheight: number) {
        this.viewwidth = viewwidth;
        this.viewheight = viewheight;
    }

    match(item: Object) : boolean {
        return item.checkImplements && item.checkImplements('Animable');
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) : void {
        const radianssecond = (Math.PI * 2) * 1;
        const radiansms = radianssecond / 1000;

        entities.map(item => {

            const displayObject = item.getDisplayObject();

            displayObject.rotation += radiansms * deltatime;

            // $FlowFixMe
            const speedms = item.getSpeed() / 1000;
            const itemBounds = displayObject.getBounds();

            if(itemBounds.x < 0) {
                // $FlowFixMe
                item.flipDirectionX();
            } else if(itemBounds.x + itemBounds.width >= this.viewwidth) {
                // $FlowFixMe
                item.flipDirectionX();
            }

            if(itemBounds.y < 0) {
                // $FlowFixMe
                item.flipDirectionY();
            } else if(itemBounds.y + itemBounds.height >= this.viewheight) {
                // $FlowFixMe
                item.flipDirectionY();
            }

            const direction = item.getDirection();

            // $FlowFixMe
            displayObject.x += speedms * deltatime * direction.x;
            // $FlowFixMe
            displayObject.y += speedms * deltatime * direction.y;
        });
    }
}

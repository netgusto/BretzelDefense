'use strict';

/* @flow */

export default class CursorSystem {

    cursor: Object;

    constructor({ cursor }: { cursor: { left: boolean, right: boolean, up: boolean, down: boolean, alt: boolean, shift: boolean } }) : void {
        this.cursor = cursor;
    }

    match(item : DisplayObject) : boolean {
        return item.components && 'cursormover' in item.components;
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) {
        const { cursor } = this;

        entities.map(entity => {
            if(
                !entity.doStop ||
                !entity.doWalk ||
                !entity.doRun ||
                !entity.up ||
                !entity.down ||
                !entity.left ||
                !entity.right
            ) return;

            if(cursor.left || cursor.right || cursor.up || cursor.down) {

                if(cursor.shift) {
                    entity.doRun(deltatime);
                } else {
                    entity.doWalk(deltatime);
                }

                if (cursor.up) { entity.up(deltatime); }
                else if (cursor.down) { entity.down(deltatime); }

                if (cursor.left) { entity.left(deltatime); }
                else if (cursor.right) { entity.right(deltatime); }

            } else {
                entity.doStop(deltatime);
            }
        });
    }
}

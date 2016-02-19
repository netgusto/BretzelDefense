'use strict';

/* @flow */

export default class Pathfinder {

    constructor(map: Array<number>) {
        
    }

    match(item: DisplayObject): boolean {
        return item.checkImplements && item.checkImplements('Pathable');
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) {
        entities.map(entity => {
            const targetpoint = entity.getPathTarget();
            if(targetpoint === null) return;
            console.log('Heading to ' + targetpoint.x + ':' + targetpoint.y);
        });
    }
}

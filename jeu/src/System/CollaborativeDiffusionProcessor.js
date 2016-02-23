'use strict';

/* @flow */

export default class CollaborativeDiffusionProcessor {

    constructor({ getField }) {
        this.getField = getField;
    }

    match(item: DisplayObject): boolean {
        return item.checkImplements('CollaborativeDiffusionFieldAgent');
    }

    process(entities : Array<DisplayObject>, { deltatime } : { deltatime: number }) {
        const field = this.getField();

        for(let i = 0; i < entities.length; i++) {
            entities[i].collaborativeDiffusionFieldUpdate({
                deltatime,
                field
            });
        };
    }
}

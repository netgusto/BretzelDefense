'use strict';

/* @flow */

export default class CustomRender {

    match(item: DisplayObject): boolean {
        return item.checkImplements && item.checkImplements('CustomRenderable');
    }

    process(entities: Array<DisplayObject>, params) {
        entities.map(entity => entity.render(params));
    }
}

'use strict';

/* @flow */

export default class CustomRender {

    match(item: DisplayObject): boolean {
        return item.checkImplements && item.checkImplements('CustomRenderable');
    }

    process(entities: Array<DisplayObject>, params) {
        //console.log(entities.map(entity => entity.getId() + entity.walk.state));
        entities.map(entity => entity.render(params));
    }
}

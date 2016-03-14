'use strict';

import { GameStage, GameLayer } from 'bobo';

import Mummy from '../Entity/Mummy';

export default function({ resolution, canvas/*, debug */}) {
    const stage = new GameStage(canvas);
    const layer = new GameLayer(stage);
    stage.addLayer(layer);
    return stage
        .require(Mummy)
        .load()
        .then(function(/*{ loader, resources }*/) {
            const mummy = Mummy({ worldscale: resolution.worldscale * 5 });
            mummy.displayobject.position.set(resolution.width/2, resolution.height/2);
            mummy.displayobject.interactive = true;
            mummy.displayobject.click = mummy.displayobject.tap = function() {
                console.log('Level 01 !');
            };
            layer.addEntity(mummy);

            return stage;
        });
}
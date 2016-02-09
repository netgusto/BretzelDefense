'use strict';

/* @flow */

import 'perfnow';   // Polyfill for high resolution timer

import { Container as PixiContainer, extras as PixiExtras, loader, SCALE_MODES, Polygon } from 'pixi.js';
import { GameSet, cursorkeys } from 'bobo';

import MummyFactory from './Entity/MummyFactory';
import Baikal from './Entity/Baikal';

import AnimationSystem from './System/Animation';
import CollisionSystem from './System/Collision';
import CursorSystem from './System/Cursor';
import DebugSystem from './System/Debug';

import AnimationComponent from './Component/Animation';

(function(viewwidth: number, viewheight: number) {

    loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
    loader.add('background', 'http://pixijs.github.io/examples/_assets/p2.jpeg');
    loader.add('matriochka', '/assets/sprites/matriochka.png');
    loader.add('matriochka_meta', '/assets/sprites/matriochka_meta.json');
    loader.once('complete', (loader, resources) => {

        const systems = [];
        const stage = new PixiContainer(0xFF0000);  // white
        const entities = buildEntities(resources, viewwidth, viewheight);

        entities.map(entity => stage.addChild(entity));

        /* Les systèmes */

        const hero = entities.filter(item => item.components && 'animation' in item.components)[0];

        systems.push(new AnimationSystem(viewwidth, viewheight));
        systems.push(new CollisionSystem([
            { what: 'hero', with: ['mummy'] }
        ]));
        systems.push(new CursorSystem({ cursor: cursorkeys() }));
        systems.push(new DebugSystem({ stage }));

        /* Game loop */

        let then = performance.now();
        let now;

        const update = (g: GameSet) => {
            const now = performance.now();
            const deltatime = now - then;
            then = now;

            //tilingSprite.tilePosition.x += deltatime * (100/1000);
            //tilingSprite.tilePosition.y += deltatime * (100/1000);

            systems.map(system => {
                system.process(
                    system.match ? entities.filter(system.match) : entities,
                    { deltatime }
                );
            });
        };

        const game = new GameSet(document.body, viewwidth, viewheight);
        game.run(stage, update);
    });

    loader.load();

})(1024, 768);

function buildEntities(resources: Object, viewwidth, viewheight) : Array<DisplayObject> {

    const entities = [];

    /* Le fond */
    const bgimage = resources.background.texture;
    const tilingSprite = new PixiExtras.TilingSprite(bgimage, viewwidth, viewheight);
    entities.push(tilingSprite);

    /* L'obstacle */
    let baikal = new Baikal(resources.matriochka.texture);
    //baikal.addComponent('animation', new AnimationComponent())
    baikal.components = {
        collision: {
            group: 'hero'
        }
    };
    baikal = AnimationComponent(baikal, {
        speed: 500,
        direction: { x: 3, y: 4 }
    });
    baikal.setPivot(baikal.width / 2, baikal.height / 2);
    baikal.setAnchor(0);
    baikal.setScale(.125);
    baikal.setPosition(500, 500);
    baikal.setCollisionArea(new Polygon(resources.matriochka_meta.data.hitarea));
    entities.push(baikal);

    /* La momie */
    const mummytexture = resources.mummy.texture.baseTexture;
    mummytexture.scaleMode = SCALE_MODES.NEAREST;
    const SlugMummyFactory = new MummyFactory(resources.mummy.texture.baseTexture);

    for(let k = 0; k < 1000; k++) {
        const mummy = SlugMummyFactory.spawn();
        mummy.position.set(Math.floor(Math.random() * viewwidth), Math.floor(Math.random() * viewheight));
        mummy.components = {
            cursormover: true,
            collision: {
                group: 'mummy',
            }
        };
        entities.push(mummy);
    }

    return entities;
}

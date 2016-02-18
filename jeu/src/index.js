'use strict';

/* @flow */

import 'perfnow';   // Polyfill for high resolution timer

import { Container as PixiContainer, extras as PixiExtras, loader, SCALE_MODES, Polygon, Rectangle, Sprite } from 'pixi.js';
import { GameSet, cursorkeys, loadspritesheet, gameloop } from 'bobo';

import Baikal from './Entity/Baikal';
import Mummy from './Entity/Mummy';

import AnimationSystem from './System/Animation';
import CollisionSystem from './System/Collision';
import CursorSystem from './System/Cursor';
import DebugSystem from './System/Debug';

(function(viewwidth: number, viewheight: number) {

    loader.add('mummy', '/assets/sprites/metalslug_mummy37x45.png');
    loader.add('background', 'http://pixijs.github.io/examples/_assets/p2.jpeg');
    loader.add('matriochka', '/assets/sprites/matriochka.png');
    loader.add('matriochka_meta', '/assets/sprites/matriochka_meta.json');
    loader.once('complete', (loader, resources) => {

        /* Les entités */

        const entities = buildEntities(resources, viewwidth, viewheight);
        const hero = entities.filter(item => item.components && 'animation' in item.components)[0];

        /* Le stage */

        const stage = new PixiContainer(0xFF0000);  // white
        entities.map(entity => stage.addChild(entity.getDisplayObject()));

        /* Les systèmes */

        const systems = [];
        systems.push(new AnimationSystem(viewwidth, viewheight));
        systems.push(new CursorSystem({ cursor: cursorkeys() }));
        systems.push(new CollisionSystem([
            { what: 'hero', with: ['mummy'], onCollision({ hero, collider }) {
                if(hero.getDisplayObject() instanceof Sprite) {
                    hero.getDisplayObject().tint = 0.4 * 0xFFFFFF;
                }

                if(collider.getDisplayObject() instanceof Sprite) {
                    collider.getDisplayObject().tint = 0xFF00FF;
                }

                console.log(hero.getId(), collider.getId());
            } }
        ]));
        systems.push(new DebugSystem({ stage }));

        /* Game loop */

        const game = new GameSet(document.body, viewwidth, viewheight);
        game.run(stage, gameloop({
            systems,
            entities
        }));
    });

    loader.load();

})(1024, 768);

function buildEntities(resources: Object, viewwidth, viewheight) : Array<DisplayObject> {

    const entities = [];

    /* L'obstacle */
    const baikal = Baikal({
        displayobject: new Sprite(resources.matriochka.texture)
    });
    baikal
        .setSpeed(500)
        .setDirection({ x: 3, y: 4 })
        .setPivot(baikal.getDisplayObject().width / 2, baikal.getDisplayObject().height / 2)
        .setAnchor(0)
        .setScale(.125)
        .setPosition(500, 500)
        .setCollisionArea(new Polygon(resources.matriochka_meta.data.hitarea))
        .setCollisionGroup('hero');

    entities.push(baikal);

    /* La momie */
    const mummytexture = resources.mummy.texture.baseTexture;
    mummytexture.scaleMode = SCALE_MODES.NEAREST;
    const mummyframes = loadspritesheet(mummytexture, 37, 45, 18);

    for(let k = 0; k < 1000; k++) {
        const mummy = Mummy({
            displayobject: new PixiExtras.MovieClip(mummyframes)
        })
        .setPosition(Math.floor(Math.random() * viewwidth), Math.floor(Math.random() * viewheight))
        .setCollisionArea(new Rectangle(10, 10, 20, 20))
        .setCollisionGroup('mummy');

        entities.push(mummy);
    }

    return entities;
}

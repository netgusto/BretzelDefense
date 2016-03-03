'use strict';

/* @flow */

import 'babel-polyfill';
import 'perfnow';   // Polyfill for high resolution timer

import { Container as PixiContainer, extras as PixiExtras, SCALE_MODES, Rectangle, Sprite, Graphics, loader, Text } from 'pixi.js';
import { GameSet, cursorkeys, loadspritesheet, gameloop } from 'bobo';

import { vec2 } from 'gl-matrix';
import { path2js, drawSVGPath } from './Utils/svg';
import { curveToLane } from './Utils/lane';

//import SpatialHash from './spatialhash';
import SpatialHash2 from './spatialhash2';

import Mummy from './Entity/Mummy';
import Flag from './Entity/Flag';
import Baikal from './Entity/Baikal';
import GenericEntity from './Entity/Generic';
import MapPathBuilder from './Entity/MapPathBuilder';

import CursorSystem from './System/Cursor';
import DebugSystem from './System/Debug';
import CustomRenderSystem from './System/CustomRender';
import CollaborativeDiffusionFieldSystem from './System/CollaborativeDiffusionField';
import CollaborativeDiffusionProcessorSystem from './System/CollaborativeDiffusionProcessor';
import mapblocks from './map-blocks'

const cursor = cursorkeys();

loader.add('background', '/assets/sprites/level_pagras-v2.png');

const debug = true;

const zindexsort = function(a, b) { let pos = a.y - b.y; return pos === 0 ? a.id - b.id : pos; };

const gridcellsize = 128;

(function(mountnode: HTMLElement, viewwidth: number, viewheight: number) {

    const tree2 = new SpatialHash2({ cellwidth: gridcellsize, cellheight: gridcellsize, worldwidth: viewwidth, worldheight: viewheight });

    /* Le stage */
    const canvas = new PixiContainer(0xFF0000 /* white */, true /* interactive */);
    const game = new GameSet(mountnode, viewwidth, viewheight, canvas);
    game
        .requires(Flag, Mummy, Baikal)
        .load()
        .then(function({ loader, resources }) {

            const bgsprite = new PixiExtras.TilingSprite(resources.background.texture, viewwidth, viewheight);
            bgsprite.tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);

            game.addEntity(GenericEntity({
               displayobject: bgsprite
            }));

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(5, 0xFFFF00);
            game.addEntity(GenericEntity({
                displayobject: graphics
            }));

            var points = new PIXI.Graphics();
            game.addEntity(GenericEntity({
                displayobject: points
            }));

            const curves = [
                { name: 'blue',       color: 0x0000FF, offsetx: 0, offsety: 0, path: 'M1280,378.771481 C1280,378.771481 1232.26953,379.203125 1189.68359,387.875 C1147.09766,396.546875 1048.55273,454.15039 989.744141,458.630859 C930.935547,463.111329 880.714844,455.652343 880.714844,416.472656 C880.714844,377.292968 998.042608,375.023725 1018.82227,336.93164 C1041.0625,296.162109 1000.88477,260.160156 941.800781,256.066406 C882.716797,251.972656 736.179688,287.751952 689.664062,287.751954 C643.148438,287.751956 464.777344,251.730469 429.648438,256.066406 C394.519531,260.402344 353.539062,271.609374 350.703125,321.666015 C347.867188,371.722656 498.990234,380.554687 490.714844,432.554687 C482.439453,484.554688 372.416016,460.025396 318.521484,438.080082 C264.626953,416.134769 214.911215,391.091939 156.744141,381.607419 C98.5770663,372.122898 0,378.771481 0,378.771481' },
                { name: 'blue bis',   color: 0x0000FF, offsetx: 0, offsety: 0, path: 'M1280,378.771481 C1280,378.771481 1232.26953,379.203125 1189.68359,387.875 C1147.09766,396.546875 1048.55273,454.15039 989.744141,458.630859 C930.935547,463.111329 886.121094,458.769533 880.714844,416.472656 C875.308594,374.175778 1141.70313,341.210935 1152.00391,242.896482 C1156.31004,201.797187 1082.0332,164.150391 1022.94922,160.056641 C963.865234,155.962891 736.822266,162.279291 690.306641,162.279293 C643.791016,162.279295 369.017578,159.001954 329.537109,169.976563 C290.056641,180.951171 210.378906,204.734376 244.351562,275.472653 C278.324219,346.210931 504.302734,379.45508 490.714844,432.554687 C477.126953,485.654294 372.416016,460.025396 318.521484,438.080082 C264.626953,416.134769 214.911215,391.091939 156.744141,381.607419 C98.5770663,372.122898 0,378.771481 0,378.771481' },
                { name: 'yellow',     color: 0xFFFF00, offsetx: 0, offsety: 0, path: 'M1280,397 C1280,397 1248.55273,392.339844 1205.9668,401.011719 C1163.38086,409.683594 1051.16406,470.589847 992.355469,475.070317 C933.546875,479.550786 899.894531,469.830078 881.232422,453.875 C862.570312,437.919922 857.880859,413.302734 874.466797,394.429688 C892.342498,374.089026 983.948206,363.760734 1005.46094,330.433594 C1020.51172,307.117191 997.005859,274.357422 937.921875,270.263672 C878.837891,266.169922 734.679688,301.999998 688.164062,302 C641.648438,302.000002 495.789062,264.042969 443.199219,264.042969 C390.609375,264.042969 368.271484,283.953125 368.271484,322.666016 C368.271484,361.378906 509.869141,374.835938 506.033203,434.755859 C502.197266,494.675781 360.412109,472.937501 306.517578,450.992188 C252.623047,429.046874 211.391684,406.566551 153.224609,397.08203 C95.057535,387.59751 0,397 0,397' },
                { name: 'yellow bis', color: 0xFFFF00, offsetx: 0, offsety: 0, path: 'M1280,397 C1280,397 1248.55273,392.339844 1205.9668,401.011719 C1163.38086,409.683594 1051.16406,470.589847 992.355469,475.070317 C933.546875,479.550786 899.894531,469.830078 881.232422,453.875 C862.570312,437.919922 857.880859,413.302734 874.466797,394.429688 C892.342498,374.089026 1164.48828,307.953131 1137.28125,234.335941 C1110.07422,160.71875 976.537109,166.21875 919.453125,166.21875 C857.992952,166.21875 736.28125,173.433592 689.765625,173.433594 C643.25,173.433596 481.601562,164.962891 395.216797,170.289063 C308.832031,175.615235 234.371094,201.853526 248.240234,258.740237 C262.109375,315.626948 517.943359,373.753902 506.033203,434.755859 C494.123047,495.757817 360.412109,472.937501 306.517578,450.992188 C252.623047,429.046874 211.391684,406.566551 153.224609,397.08203 C95.057535,387.59751 0,397 0,397' },
                { name: 'red',        color: 0xFF0000, offsetx: 0, offsety: 0, path: 'M1280,410.960933 C1280,410.960933 1257.97488,406.857417 1215.3857,415.529292 C1172.79651,424.201167 1055.49459,484.468745 996.68151,488.949214 C937.868429,493.429683 887.285156,478.417969 865.605469,459.03125 C843.925781,439.644531 832.42578,408.855812 858.044922,384.44175 C883.664064,360.027687 952.684678,353.39779 980.109375,334.673828 C1010.71327,313.779297 987.630038,285.947266 928.541545,281.853516 C869.453053,277.759766 733.534731,316.019531 687.904297,313.148438 C642.273862,310.277344 492.611802,280.578125 459.689368,278.388672 C426.766935,276.199219 384.652394,281.853516 386.910378,318.550782 C389.692294,363.763091 530.152344,370.998047 518.455078,435.867188 C504.290082,514.421541 359.834094,488.808595 305.93545,466.863281 C252.036807,444.917968 207.057872,422.453271 148.886359,412.96875 C90.7148466,403.484229 0,415.529297 0,415.529297' },
                { name: 'red bis',    color: 0xFF0000, offsetx: 0, offsety: 0, path: 'M1280,412.960933 C1280,412.960933 1257.97488,408.857417 1215.3857,417.529292 C1172.79651,426.201167 1055.49459,486.468745 996.68151,490.949214 C937.868429,495.429683 887.285156,480.417969 865.605469,461.03125 C843.925781,441.644531 832.42578,410.855812 858.044922,386.44175 C883.664064,362.027687 1104.53516,315.347654 1122.88672,251.19531 C1139.21012,194.132913 1030.11193,184.101562 971.023438,180.007812 C911.934945,175.914062 729.976138,190.302735 684.345703,187.431641 C638.715269,184.560547 446.183594,175.863281 374.271484,183.896485 C302.359375,191.929688 247.057077,218.391101 262.664062,254.894531 C287.386719,312.71875 512.369141,376.087898 518.275391,419.939461 C531.574397,518.679308 359.834094,490.808595 305.93545,468.863281 C252.036807,446.917968 207.057872,424.453271 148.886359,414.96875 C90.7148466,405.484229 0,417.529297 0,417.529297' }
            ];

            const lanes = curves.map(curveToLane);

            // pre-memoizing lanes
            const beforememoization = performance.now();
            lanes.map(lane => lane.memoizeAll());
            console.info('Path memoization took', performance.now() - beforememoization, 'ms');

            if(debug) {
                // Drawing lanes
                //lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, lane.offsetx, lane.offsety));
            }

            let mummies = [];

            for(let mummyindex = 0; mummyindex < lanes.length * 30; mummyindex++) {
                const mummy = Mummy({
                    displayobject: new PixiExtras.MovieClip(Mummy.spriteframes)
                })
                    .doRun()
                    .setVelocityPerSecond(20 + Math.floor(Math.random() * 100));
                game.addEntity(mummy);
                mummy.lane = lanes[mummyindex % lanes.length];
                mummy.prevpos = { x: 0, y: 0 };
                mummy.pixelswalked = 0;
                mummies.push(mummy);
            }

            game.addSystem({
                process(entities, { deltatime }) {

                    for(let i = 0; i < mummies.length; i++) {
                        const mummy = mummies[i];

                        const newpos = mummy.lane.getPointAtLengthLoop(mummy.pixelswalked);
                        const prevpos = mummy.prevpos;
                        newpos.x += mummy.lane.offsetx;
                        newpos.y += mummy.lane.offsety;

                        // On détermine la direction du mouvement

                        let up = false, down = false, left = false, right = false;
                        if(newpos.x > prevpos.x) {
                            right = true
                        } else if(newpos.x < prevpos.x) {
                            left = true;
                        }

                        if(newpos.y > prevpos.y) {
                            down = true
                        } else if(newpos.y < prevpos.y) {
                            up = true;
                        }

                        if(left) {
                            mummy.displayobject.scale.x = Math.abs(mummy.displayobject.scale.x) * -1;
                        } else if(right) {
                            mummy.displayobject.scale.x = Math.abs(mummy.displayobject.scale.x);
                        }

                        // const angle = Math.atan2(prevpos.y-newpos.y,prevpos.x-newpos.x);
                        // mummy.displayobject.rotation = angle;

                        // const tangentvector = vec2.normalize({}, [newpos.x - prevpos.x, newpos.y - prevpos.y]);
                        // const orthovector = [tangentvector[1], -tangentvector[0]];
                        // const scaledorthovector = vec2.scale({}, orthovector, 15);

                        // points.clear();
                        // points.lineStyle(2, 0xFF0000);
                        // points.drawCircle(newpos.x, newpos.y, 2);

                        // points.drawCircle(newpos.x + scaledorthovector[0], newpos.y + scaledorthovector[1], 2);
                        // points.drawCircle(newpos.x - scaledorthovector[0], newpos.y - scaledorthovector[1], 2);

                        mummy.setPosition(newpos.x, newpos.y);

                        mummy.prevpos = newpos;

                        mummy.pixelswalked += deltatime * mummy.walk.velocityms;
                    }
                }
            });

            game.addSystem({
                process: function(entities, { deltatime }) {
                    game.sortStage(zindexsort);
                }
            });

            if(debug) {
                game.addSystem(new DebugSystem({ stage: canvas, cbk: (msg) => msg += '; '  + game.entities.length + ' entities' }));
            }

            // ////////////////

            let circle = new PIXI.Graphics();
            circle.lineStyle(1, 0xFFFF00);
            game.addEntity(GenericEntity({
                displayobject: circle
            }));

            bgsprite.interactive = true;
            bgsprite.click = bgsprite.tap = function(event) {

                const clickpoint = event.data.getLocalPosition(bgsprite);
                const flag = Flag.create({
                        displayobject: new Sprite(Flag.texture)
                    })
                    .setPosition(clickpoint.x, clickpoint.y);

                flag.hunter = true;
                flag.range = 150;

                if(cursor.shift) {
                    flag.setTint(0xFF0000);
                    flag.range = 30;
                }
                //flag.displayobject.addChild(circle);
                game.addEntity(flag);

                //circle.drawCircle(flag.displayobject.x, flag.displayobject.y, flag.range);
            };

            let first = true;

            game.addSystem({
                process: function(entities, { deltatime }) {

                    if(first) {
                        first = false;
                        //tree2.clear();
                        mummies.map(function(entity) {
                            entity.setTint(0xFFFFFF);
                            const displayobject = entity.displayobject;
                            const bounds = displayobject.getBounds();
                            tree2.insert(
                                bounds.x,
                                bounds.y,
                                bounds.width,
                                bounds.height,
                                displayobject.x,
                                displayobject.y,
                                entity.id,
                                entity
                            );
                        });
                    } else {
                        for(let i = 0; i < mummies.length; i++) {
                            const entity = mummies[i];
                            entity.setTint(0xFFFFFF);
                            const displayobject = entity.displayobject;
                            const bounds = displayobject.getBounds();
                            tree2.update(
                                bounds.x,
                                bounds.y,
                                bounds.width,
                                bounds.height,
                                displayobject.x,
                                displayobject.y,
                                entity.id,
                                entity
                            );
                        }
                    }

                    for(let i = 0; i < entities.length; i++) {
                        if(!entities[i].hunter) continue;
                        const hunter = entities[i];
                        tree2.retrieve(hunter.displayobject.x, hunter.displayobject.y, hunter.range).map(collision => {
                            collision.entity.setTint(0x00FF00);
                        });
                    }
                }
            });

            // var grid = new PIXI.Graphics();
            // grid.lineStyle(1, 0xFFFF00);
            // game.addEntity(GenericEntity({
            //     displayobject: grid
            // }));

            // for(let x = 0; x < viewwidth; x += gridcellsize) {
            //     grid.moveTo(x, 0);
            //     grid.lineTo(x, viewheight);
            // }

            // for(let y = 0; y < viewheight; y += gridcellsize) {
            //     grid.moveTo(0, y);
            //     grid.lineTo(viewwidth, y);
            // }

            // const nbcellsx = Math.ceil(viewwidth / gridcellsize);
            // const nbcellsy = Math.ceil(viewheight / gridcellsize);

            // for(let y = 0; y < nbcellsy; y++) {
            //     for(let x = 0; x < nbcellsx; x++) {
            //         const text = new Text('', { font: '15px Arial', fill: 'yellow' });
            //         text.text = y * nbcellsx + x;
            //         text.position.set(x * gridcellsize + 5, y * gridcellsize + 5);
            //         grid.addChild(text);
            //     }
            // }


        }).then(() => game.run(gameloop()));

})(document.getElementById('app'), 1280, 720);

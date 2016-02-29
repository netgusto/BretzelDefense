'use strict';

/* @flow */

import 'perfnow';   // Polyfill for high resolution timer

import { Container as PixiContainer, extras as PixiExtras, SCALE_MODES, Rectangle, Sprite, Graphics, loader } from 'pixi.js';
import { GameSet, cursorkeys, loadspritesheet, gameloop } from 'bobo';

import { vec2 } from 'gl-matrix';

//import Bezier from 'bezier-js';

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

const cellwidth = 10;
const cellheight = 10;
const debug = true;
let dospawn = false;

const zindexsort = function(a, b) { return a.y - b.y; };

const path2js = function(path) {

    const regPathInstructions = /([MmLlHhVvCcSsQqTtAaZz])\s*/;
    const regPathData = /[-+]?(?:\d*\.\d+|\d+\.?)([eE][-+]?\d+)?/g;

    var paramsLength = { // Number of parameters of every path command
            H: 1, V: 1, M: 2, L: 2, T: 2, Q: 4, S: 4, C: 6, A: 7,
            h: 1, v: 1, m: 2, l: 2, t: 2, q: 4, s: 4, c: 6, a: 7
        },
        pathData = [],   // JS representation of the path data
        instruction, // current instruction context
        startMoveto = false;

    // splitting path string into array like ['M', '10 50', 'L', '20 30']
    path.split(regPathInstructions).forEach(function(data) {
        if (!data) return;
        if (!startMoveto) {
            if (data == 'M' || data == 'm') {
                startMoveto = true;
            } else return;
        }

        // instruction item
        if (regPathInstructions.test(data)) {
            instruction = data;

            // z - instruction w/o data
            if (instruction == 'Z' || instruction == 'z') {
                pathData.push({
                    instruction: 'z'
                });
            }
        // data item
        } else {
            data = data.match(regPathData);
            if (!data) return;

            data = data.map(Number);

            // Subsequent moveto pairs of coordinates are threated as implicit lineto commands
            // http://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands
            if (instruction == 'M' || instruction == 'm') {
                pathData.push({
                    instruction: pathData.length == 0 ? 'M' : instruction,
                    data: data.splice(0, 2).map(parseFloat)
                });
                instruction = instruction == 'M' ? 'L' : 'l';
            }

            for (var pair = paramsLength[instruction]; data.length;) {
                pathData.push({
                    instruction: instruction,
                    data: data.splice(0, pair).map(parseFloat)
                });
            }
        }
    });

    // First moveto is actually absolute. Subsequent coordinates were separated above.
    if (pathData.length && pathData[0].instruction == 'm') {
        pathData[0].instruction = 'M';
    }

    return pathData;
};

const drawSVGPath = function(graphics, path, color, offsetx, offsety) {
    const instructions = path2js(path);

    graphics.lineStyle(2, color);

    instructions.map(instruction => {
        switch(instruction.instruction) {
            case 'M': {
                // Move to
                graphics.moveTo(offsetx + instruction.data[0], offsety + instruction.data[1]);
                break;
            }
            case 'C': {
                // Move to
                graphics.bezierCurveTo(
                    offsetx + instruction.data[0],
                    offsety + instruction.data[1],

                    offsetx + instruction.data[2],
                    offsety + instruction.data[3],

                    offsetx + instruction.data[4],
                    offsety + instruction.data[5]
                );
                break;
            }
        }
    });
};

(function(mountnode: HTMLElement, viewwidth: number, viewheight: number) {

    /* Le stage */
    const canvas = new PixiContainer(0xFF0000 /* white */, true /* interactive */);
    const game = new GameSet(mountnode, viewwidth, viewheight, canvas);
    game
        .requires(Flag, Mummy, Baikal)
        .load()
        .then(function({ loader, resources }) {

            const bgsprite = new PixiExtras.TilingSprite(resources.background.texture, viewwidth, viewheight);
            bgsprite.tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);
            /*game.addEntity(MapPathBuilder({
                displayobject: bgsprite,
                cellwidth: cellwidth,
                cellheight: cellheight,
                cursor: cursor
            }));*/

            game.addEntity(GenericEntity({
                displayobject: bgsprite
            }));

            //game.addSystem(new CustomRenderSystem());

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(5, 0xFFFF00);
            game.addEntity(GenericEntity({
                displayobject: graphics
            }));

            var points = new PIXI.Graphics();
            game.addEntity(GenericEntity({
                displayobject: points
            }));

            const offsetx = 0;
            const offsety = 0;

            const curves = [
                /* Blue */          { color: 0x0000FF, path: 'M1280,378.771481 C1280,378.771481 1232.26953,379.203125 1189.68359,387.875 C1147.09766,396.546875 1048.55273,454.15039 989.744141,458.630859 C930.935547,463.111329 880.714844,455.652343 880.714844,416.472656 C880.714844,377.292968 998.042608,375.023725 1018.82227,336.93164 C1041.0625,296.162109 1000.88477,260.160156 941.800781,256.066406 C882.716797,251.972656 736.179688,287.751952 689.664062,287.751954 C643.148438,287.751956 464.777344,251.730469 429.648438,256.066406 C394.519531,260.402344 353.539062,271.609374 350.703125,321.666015 C347.867188,371.722656 498.990234,380.554687 490.714844,432.554687 C482.439453,484.554688 372.416016,460.025396 318.521484,438.080082 C264.626953,416.134769 214.911215,391.091939 156.744141,381.607419 C98.5770663,372.122898 0,378.771481 0,378.771481' },
                /* Blue Bis */      { color: 0x0000FF, path: 'M1280,378.771481 C1280,378.771481 1232.26953,379.203125 1189.68359,387.875 C1147.09766,396.546875 1048.55273,454.15039 989.744141,458.630859 C930.935547,463.111329 886.121094,458.769533 880.714844,416.472656 C875.308594,374.175778 1141.70313,341.210935 1152.00391,242.896482 C1156.31004,201.797187 1082.0332,164.150391 1022.94922,160.056641 C963.865234,155.962891 736.822266,162.279291 690.306641,162.279293 C643.791016,162.279295 369.017578,159.001954 329.537109,169.976563 C290.056641,180.951171 210.378906,204.734376 244.351562,275.472653 C278.324219,346.210931 504.302734,379.45508 490.714844,432.554687 C477.126953,485.654294 372.416016,460.025396 318.521484,438.080082 C264.626953,416.134769 214.911215,391.091939 156.744141,381.607419 C98.5770663,372.122898 0,378.771481 0,378.771481' },
                /* Yellow */        { color: 0xFFFF00, path: 'M1280,397 C1280,397 1248.55273,392.339844 1205.9668,401.011719 C1163.38086,409.683594 1051.16406,470.589847 992.355469,475.070317 C933.546875,479.550786 899.894531,469.830078 881.232422,453.875 C862.570312,437.919922 857.880859,413.302734 874.466797,394.429688 C892.342498,374.089026 983.948206,363.760734 1005.46094,330.433594 C1020.51172,307.117191 997.005859,274.357422 937.921875,270.263672 C878.837891,266.169922 734.679688,301.999998 688.164062,302 C641.648438,302.000002 495.789062,264.042969 443.199219,264.042969 C390.609375,264.042969 368.271484,283.953125 368.271484,322.666016 C368.271484,361.378906 509.869141,374.835938 506.033203,434.755859 C502.197266,494.675781 360.412109,472.937501 306.517578,450.992188 C252.623047,429.046874 211.391684,406.566551 153.224609,397.08203 C95.057535,387.59751 0,397 0,397' },
                /* Yellow Bis */    { color: 0xFFFF00, path: 'M1280,397 C1280,397 1248.55273,392.339844 1205.9668,401.011719 C1163.38086,409.683594 1051.16406,470.589847 992.355469,475.070317 C933.546875,479.550786 899.894531,469.830078 881.232422,453.875 C862.570312,437.919922 857.880859,413.302734 874.466797,394.429688 C892.342498,374.089026 1164.48828,307.953131 1137.28125,234.335941 C1110.07422,160.71875 976.537109,166.21875 919.453125,166.21875 C857.992952,166.21875 736.28125,173.433592 689.765625,173.433594 C643.25,173.433596 481.601562,164.962891 395.216797,170.289063 C308.832031,175.615235 234.371094,201.853526 248.240234,258.740237 C262.109375,315.626948 517.943359,373.753902 506.033203,434.755859 C494.123047,495.757817 360.412109,472.937501 306.517578,450.992188 C252.623047,429.046874 211.391684,406.566551 153.224609,397.08203 C95.057535,387.59751 0,397 0,397' },
                /* Red */           { color: 0xFF0000, path: 'M1280,410.960933 C1280,410.960933 1257.97488,406.857417 1215.3857,415.529292 C1172.79651,424.201167 1055.49459,484.468745 996.68151,488.949214 C937.868429,493.429683 887.285156,478.417969 865.605469,459.03125 C843.925781,439.644531 832.42578,408.855812 858.044922,384.44175 C883.664064,360.027687 952.684678,353.39779 980.109375,334.673828 C1010.71327,313.779297 987.630038,285.947266 928.541545,281.853516 C869.453053,277.759766 733.534731,316.019531 687.904297,313.148438 C642.273862,310.277344 492.611802,280.578125 459.689368,278.388672 C426.766935,276.199219 384.652394,281.853516 386.910378,318.550782 C389.692294,363.763091 530.152344,370.998047 518.455078,435.867188 C504.290082,514.421541 359.834094,488.808595 305.93545,466.863281 C252.036807,444.917968 207.057872,422.453271 148.886359,412.96875 C90.7148466,403.484229 0,415.529297 0,415.529297' },
                /* Red Bis */       { color: 0xFF0000, path: 'M1280,412.960933 C1280,412.960933 1257.97488,408.857417 1215.3857,417.529292 C1172.79651,426.201167 1055.49459,486.468745 996.68151,490.949214 C937.868429,495.429683 887.285156,480.417969 865.605469,461.03125 C843.925781,441.644531 832.42578,410.855812 858.044922,386.44175 C883.664064,362.027687 1104.53516,315.347654 1122.88672,251.19531 C1139.21012,194.132913 1030.11193,184.101562 971.023438,180.007812 C911.934945,175.914062 729.976138,190.302735 684.345703,187.431641 C638.715269,184.560547 446.183594,175.863281 374.271484,183.896485 C302.359375,191.929688 247.057077,218.391101 262.664062,254.894531 C287.386719,312.71875 512.369141,376.087898 518.275391,419.939461 C531.574397,518.679308 359.834094,490.808595 305.93545,468.863281 C252.036807,446.917968 207.057872,424.453271 148.886359,414.96875 C90.7148466,405.484229 0,417.529297 0,417.529297' }
            ];

            const lanes = curves.map(curve => {

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', curve.path);

                const memoized = [];

                return {
                    path: curve.path,
                    color: curve.color,
                    pathlength: path.getTotalLength(),
                    getPointAtRatio: function(ratio) { return this.getPointAtLength(ratio * this.pathlength); },
                    getPointAtLengthLoop: function(lengthpx) { return this.getPointAtLength(lengthpx % this.pathlength); },
                    getPointAtLength: function(lengthpx) {
                        //let roundlengthpx = parseFloat(lengthpx).toFixed(1);
                        let roundlengthpx = Math.floor(lengthpx);
                        let prevroundlength = roundlengthpx > 0 ? roundlengthpx - 1 : 0;
                        const floatpart = lengthpx - roundlengthpx;

                        if(roundlengthpx in memoized) {
                            //console.log('hit', roundlengthpx);
                            return memoized[roundlengthpx];
                        }

                        const posforroundedlength = path.getPointAtLength(roundlengthpx);
                        if(floatpart === 0) {
                            return memoized[roundlengthpx] = posforroundedlength;
                        }

                        // Interpolating results

                        //console.error('miss', roundlengthpx);
                        let prevval = null;
                        if(prevroundlength in memoized) {
                            prevval = memoized[prevroundlength];
                        } else {
                            prevval = memoized[prevroundlength] = path.getPointAtLength(prevroundlength);
                        }

                        return {
                            x: posforroundedlength.x + ((posforroundedlength.x - prevval.x) * floatpart),
                            y: posforroundedlength.y + ((posforroundedlength.y - prevval.y) * floatpart)
                        };
                    },
                }
            });

            lanes.map(lane => drawSVGPath(graphics, lane.path, lane.color, offsetx, offsety));

            /*graphics.lineStyle(5, 0x0000FF);
            drawSVGPath(graphics, `
                M1372.16992,395.082031
                C1372.16992,395.082031 1303.55273,390.339844 1260.9668,399.011719
                C1218.38086,407.683594 1100.86914,466.511718 1042.06055,470.992188
                C983.251953,475.472657 955.443361,470.992188 931.771484,455.457031
                C908.099608,439.921875 908.791016,409.980468 941.806641,390.445312
                C974.822266,370.910157 1017.41797,370.02539 1073.69336,339.912111
                C1129.96875,309.798833 1192.10937,295.007813 1185.27344,220.761719
                C1178.4375,146.515625 948.826172,169.634766 740.482422,167.291016
                C532.138672,164.947266 324.482422,161.34375 306.128906,213.357421
                C287.775391,265.371092 307.785156,281.605475 365.480469,314.595709
                C423.175781,347.585944 576.767578,370.85547 570.130859,433.90625
                C563.494141,496.95703 415.412109,470.937501 361.517578,448.992188
                C307.623047,427.046874 266.391684,404.566551 208.224609,395.08203
                C150.057535,385.59751 65.703125,390.44531 0,390.445311
            `, -55, 0);*/

            /*
            const bez = Bezier.fromSVG(`
                M1372.16992,395.203125
                C1372.16992,395.203125 1303.55273,390.460938 1260.9668,399.132813
                C1218.38086,407.804688 1100.86914,466.632812 1042.06055,471.113281
                C983.251953,475.593751 955.443361,471.113281 931.771484,455.578125
                C908.099608,440.042969 908.791016,410.101562 941.806641,390.566406
                C974.822266,371.031251 1027.78126,369.851561 1069.03516,332.234374
                C1110.28906,294.617186 1058.53516,271.072265 999.451172,266.978515
                C940.367188,262.884765 791.039063,308.25195 744.523438,308.251952
                C698.007812,308.251954 558.447266,258.121094 505.857422,258.121094
                C453.267578,258.121094 393.228516,284.521486 398.289062,315.958986
                C403.349609,347.396486 576.767578,370.976564 570.130859,434.027344
                C563.494141,497.078124 415.412109,471.058595 361.517578,449.113281
                C307.623047,427.167968 266.391684,404.687645 208.224609,395.203124
                C150.057535,385.718603 65.703125,390.566404 0,390.566405
            `);

            points.lineStyle(2, 0xFFFFFF);

            for(let t = 0; t < 1; t += 0.01) {
                const middle = bez.compute(t);
                points.drawCircle(middle.x + offsetx, middle.y + offsety, 2);
            }
            */

            let mummies = [];

            for(let mummyindex = 0; mummyindex < lanes.length; mummyindex++) {
                const mummy = Mummy.create({
                    displayobject: new PixiExtras.MovieClip(Mummy.spriteframes)
                }).doRun().left();
                game.addEntity(mummy);
                mummy.lane = lanes[mummyindex];
                mummy.prevpos = { x: 0, y: 0 };
                mummies.push(mummy);
            }

            const mummypxpersecond = 60;
            const mummypxpermillisecond = mummypxpersecond/1000;

            let pixelswalked = 0;

            game.addSystem({
                process: (entities, { deltatime }) => {

                    mummies.map(mummy => {

                        const newpos = mummy.lane.getPointAtLengthLoop(pixelswalked);
                        const prevpos = mummy.prevpos;
                        newpos.x += offsetx;
                        newpos.y += offsety;

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
                        } else {
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
                    });

                    pixelswalked += deltatime * mummypxpermillisecond;
                }
            });

            game.addSystem(new DebugSystem({ stage: canvas, cbk: (msg) => msg += '; '  + game.entities.length + ' entities' }));

            /*
            for(let t = 0; t < 1; t += 0.1) {
                const pointatlength = path.getPointAtLength(t * pathlength);
                points.drawCircle(pointatlength.x + offsetx, pointatlength.y + offsety, 2);
            }
            */


            /*// draw line

            points.lineStyle(2, 0xFFFFFF);

            graphics.moveTo(100, 200);
            points.drawCircle(100, 200, 10);


            graphics.lineStyle(5, 0xFF0000);
            points.lineStyle(2, 0xFF0000);
            graphics.quadraticCurveTo(300, 300, 200, 100);
            points.drawCircle(300, 300, 5);
            points.drawCircle(200, 100, 10);

            graphics.lineStyle(5, 0x00FF00);
            points.lineStyle(2, 0x00FF00);

            graphics.quadraticCurveTo(50, 30, 80, 200);
            points.drawCircle(50, 30, 5);
            points.drawCircle(80, 200, 10);

            graphics.endFill();*/

            /*
            // Les entités
            const exit = Flag.create({
                displayobject: new Sprite(Flag.texture)
            }).setPosition(-20, 400);
            exit.fieldtarget = true;

            game.addEntity(exit);

            const bgsprite = new PixiExtras.TilingSprite(resources.background.texture, viewwidth, viewheight);
            bgsprite.tileScale.set(viewwidth / resources.background.texture.width, viewheight / resources.background.texture.height);
            bgsprite.interactive = true;
            bgsprite.click = bgsprite.tap = function(event) {

                dospawn = !dospawn;

                const clickpoint = event.data.getLocalPosition(bgsprite);

                if(cursor.shift) {
                    const flag = Flag.create({
                        displayobject: new Sprite(Flag.texture)
                    })
                        .setPosition(clickpoint.x, clickpoint.y)
                        .setTint(0xFF0000);

                    flag.fieldobstacle = true;
                    game.addEntity(flag);
                } else {
                    const flag = Flag.create({
                        displayobject: new Sprite(Flag.texture)
                    })
                        .setPosition(clickpoint.x, clickpoint.y);

                    flag.fieldtarget = true;
                    game.addEntity(flag);
                }
            };

            const fond = GenericEntity.create({ displayobject: bgsprite });

            game.addEntity(fond);

            // La momie

            const buildMummy = function() {
                return Mummy.create({
                    displayobject: new PixiExtras.MovieClip(Mummy.spriteframes)
                });
                    //.setCollisionArea(new Rectangle(10, 10, 20, 20))
                    //.setCollisionGroup('mummy')
            }

            // On génère des positions de momies aléatoires sur les espaces praticables
            // const positions = [];
            // while(positions.length < 4) {
            //     const x = Math.floor(Math.random() * mapblocks[0].length);
            //     const y = Math.floor(Math.random() * mapblocks.length);
            //     if(mapblocks[y][x] === 1) positions.push({ x, y });
            // }

            // positions.map(position => {
            //     game.addEntity(
            //         buildMummy()
            //             .setPosition(position.x * cellwidth + (cellwidth/2), position.y * cellheight + (cellheight/2))
            //     );
            // });

            const fielddebug = GenericEntity.create({
                id: 'fielddebug',
                displayobject: new Graphics()
            });

            game.addEntity(fielddebug);

            // Les systèmes

            game.addSystem(new DebugSystem({ stage: canvas, cbk: (msg) => msg += '; '  + game.entities.length + ' entities' }));
            game.addSystem(new CustomRenderSystem());

            // Autospawn !
            let timer = 0;
            let delay = 1000/3 / 10;

            const randomlane = () => Math.floor(Math.random() * 3) + 1;
            //const randomlane = () => 1;
            game.addSystem({
                process: function(entities, { deltatime }) {
                    if(!dospawn) return;
                    timer += deltatime;

                    if(timer >= delay) {

                        timer = timer - delay;

                        // game.addEntity(
                        //     buildMummy()
                        //     .setPosition(1300, 400)
                        //     .setLane(randomlane())
                        // );

                        let y, tint;

                        const lane = randomlane();
                        if(lane === 1) {
                            y = 140;
                            tint = 0xFF0000;
                        } else if(lane === 2) {
                            y = 160;
                            tint = 0x00FF00;
                        } else if(lane === 3) {
                            y = 180;
                            tint = 0x0000FF;
                        }

                        game.addEntity(
                            buildMummy()
                            .setPosition(900, y)
                            .setTint(tint)
                            .setLane(lane)
                        );
                    }
                }
            });

            game.addSystem({
                process: function(entities, { deltatime }) {
                    entities.map(entity => {
                        if(entity.displayobject.x < 0) entity.remove();
                    })
                }
            });

            game.addSystem({
                process: function(entities, { deltatime }) {
                    game.sortStage(zindexsort);
                }
            });
            */
        }).then(() => game.run(gameloop()));

})(document.getElementById('app'), 1280, 720);

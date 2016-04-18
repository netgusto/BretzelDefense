'use strict';

import { path2js, scalejspath, jsToSVGPath } from './svg';

export function curveToLane(lanescale, worldscale, offsetx, offsety) {

    return function(curve) {

        // scaling path to world (useful for in-path click detection)
        let svgpath = curve.path;

        if(worldscale !== 1) {
            svgpath = jsToSVGPath(scalejspath(path2js(svgpath), worldscale, offsetx, offsety));
        }

        /*
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', svgpath);
        const totallength = path.getTotalLength();
        */

        return {
            //memoized: new Array(Math.floor(totallength)),
            path: svgpath,
            name: curve.name,
            color: curve.color,
            offsetx: offsetx,
            offsety: offsety,
            //pathlength: totallength,
            //getPointAtRatio: function(ratio) { return this.getPointAtLength(ratio * this.pathlength); },
            //getPointAtLengthLoop: function(lengthpx) { return this.getPointAtLength(lengthpx % this.pathlength); },
            // memoizeAll: function() {
            //     for(let length = 0; length < this.pathlength; length++) {
            //         this.getPointAtLength(length);
            //     }
            // },
            memoizePrecalc: function({ length, points }) {

                this.memoized = new Array(length);
                for(var index = 0; index < points.length; index++) {
                    this.memoized[index] = { x: points[index][0] * lanescale, y: points[index][1] * lanescale };
                }

                //console.log('MEMOIZED', this.memoized);

                this.pathlength = Math.floor(lanescale * length);
            },
            // memoizeAllAsync: function() {
            //     const p = new Promise((resolve/*, reject*/) => {

            //         let walked = 0;
            //         const memoizationmethod = () => {
            //             if(walked >= this.pathlength) return resolve(this);
            //             this.getPointAtLength(walked++);
            //             window.setImmediate(memoizationmethod);
            //         };
            //         memoizationmethod();
            //     });

            //     return p;
            // },
            getPointAtLength: function(lengthpx) {

                lengthpx = lengthpx / lanescale;

                //let roundlengthpx = parseFloat(lengthpx).toFixed(1);
                let roundlengthpx = Math.floor(lengthpx);
                //let roundlengthpx = lengthpx;

                let prevroundlength = roundlengthpx > 0 ? roundlengthpx - 1 : 0;
                const floatpart = lengthpx - roundlengthpx;

                let posforroundedlength;

                if(floatpart === 0) {
                    if(this.memoized[roundlengthpx] !== undefined) {
                        return this.memoized[roundlengthpx];
                    }

                    if(roundlengthpx >= this.pathlength) return this.memoized[this.pathlength - 1];

                    console.error('LANE SHOULD BE PRE-CALC MEMOIZED AT LENGTH "' + roundlengthpx + '"', this.pathlength, this.memoized.length);

                    // const pointatlength = path.getPointAtLength(roundlengthpx);
                    // return this.memoized[roundlengthpx] = pointatlength;
                } else {
                    if(this.memoized[roundlengthpx] !== undefined) {
                        posforroundedlength = this.memoized[roundlengthpx];
                    } else {
                        if(roundlengthpx >= this.pathlength) return this.memoized[this.pathlength - 1];
                        console.error('LANE SHOULD BE PRE-CALC MEMOIZED AT LENGTH "' + roundlengthpx + '"', this.pathlength, this.memoized.length);
                        //const pointatlength = path.getPointAtLength(roundlengthpx);
                        //posforroundedlength = this.memoized[roundlengthpx] = pointatlength;
                    }
                }

                // Interpolating results (direction vector * factionnal part)

                //console.log({ prevroundlength, roundlengthpx, floatpart, x: posforroundedlength.x, y: posforroundedlength.y });

                let prevval = null;
                if(this.memoized[prevroundlength] !== undefined) {
                    prevval = this.memoized[prevroundlength];
                } else {
                    console.error('LANE SHOULD BE PRE-CALC MEMOIZED AT LENGTH "' + roundlengthpx + '"', this.pathlength, this.memoized.length);
                    // const pointatlength = path.getPointAtLength(prevroundlength);
                    // prevval = this.memoized[prevroundlength] = pointatlength;
                }

                return {
                    x: (posforroundedlength.x + ((posforroundedlength.x - prevval.x) * floatpart)),
                    y: (posforroundedlength.y + ((posforroundedlength.y - prevval.y) * floatpart))
                };
            }
        };
    };
}

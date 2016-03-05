'use strict';

export function curveToLane(curve) {

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', curve.path);
    const totallength = path.getTotalLength();

    const memoized = new Array(Math.floor(totallength));

    return {
        path: curve.path,
        name: curve.name,
        color: curve.color,
        offsetx: curve.offsetx,
        offsety: curve.offsety,
        pathlength: totallength,
        getPointAtRatio: function(ratio) { return this.getPointAtLength(ratio * this.pathlength); },
        getPointAtLengthLoop: function(lengthpx) { return this.getPointAtLength(lengthpx % this.pathlength); },
        memoizeAll: function() {
            for(let length = 0; length < this.pathlength; length++) {
                this.getPointAtLength(length);
            }
        },
        getPointAtLength: function(lengthpx) {
            //let roundlengthpx = parseFloat(lengthpx).toFixed(1);
            let roundlengthpx = Math.floor(lengthpx);

            if(memoized[roundlengthpx] !== undefined) {
                return memoized[roundlengthpx];
            }

            let prevroundlength = roundlengthpx > 0 ? roundlengthpx - 1 : 0;
            const floatpart = lengthpx - roundlengthpx;

            const posforroundedlength = path.getPointAtLength(roundlengthpx);
            if(floatpart === 0) {
                return memoized[roundlengthpx] = posforroundedlength;
            }

            // Interpolating results (direction vector * factionnal part)

            let prevval = null;
            if(memoized[prevroundlength] !== undefined) {
                prevval = memoized[prevroundlength];
            } else {
                prevval = memoized[prevroundlength] = path.getPointAtLength(prevroundlength);
            }

            return {
                x: posforroundedlength.x + ((posforroundedlength.x - prevval.x) * floatpart),
                y: posforroundedlength.y + ((posforroundedlength.y - prevval.y) * floatpart)
            };
        }
    };
}

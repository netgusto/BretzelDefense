'use strict';

const regPathInstructions = /([MmLlHhVvCcSsQqTtAaZz])\s*/;
const regPathData = /[-+]?(?:\d*\.\d+|\d+\.?)([eE][-+]?\d+)?/g;

export function path2js(path) {

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

export function drawSVGPath(graphics, path, color, offsetx, offsety) {
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

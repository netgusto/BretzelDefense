'use strict';

export default function() {
    const screenwidth = window.screen.availWidth - 30;
    const screenheight = window.screen.availHeight - 80;
    const ratio = screenwidth / screenheight;
    let normalizedratio = null;

    // normalizing height depending on width
    const ratios = [/*{ ratio: 4/3, name: '4:3'}, { ratio: 3/2, name: '3:2'}, */{ ratio: 8/5, name: '8:5'}/*, { ratio: 16/9, name: '16:9'}*/];
    for(let i = 0; i < ratios.length; i++) {
        const potentialratio = ratios[i];
        if(ratio <= potentialratio.ratio) normalizedratio = potentialratio;
    }

    if(normalizedratio === null) normalizedratio = ratios[ratios.length - 1];
    let normalizedwidth = screenwidth;
    let normalizedheight = (screenwidth / normalizedratio.ratio)|0;
    if(normalizedheight > screenheight) {
        normalizedheight = screenheight;
        normalizedwidth = (screenheight * normalizedratio.ratio)|0;
    }

    // normalizing resolution
    const resolutionsbyratio = {
        '4:3': [
            { width: 640, height: 480, offsetx: 0, offsety: 0, worldscale: 480/1536 },
            { width: 800, height: 600, offsetx: 0, offsety: 0, worldscale: 600/1536 },
            { width: 1024, height: 768, offsetx: 0, offsety: 0, worldscale: 768/1536 },
            { width: 2048, height: 1536, offsetx: 0, offsety: 0, worldscale: 1 }
        ],
        '3:2': [
            { width: 960, height: 640, offsetx: 0, offsety: 0, worldscale: 640/1536 }
        ],
        '8:5': [
            { width: 800, height: 500, offsetx: 0, offsety: 0, worldscale: 500/1536 },
            { width: 1024, height: 640, offsetx: 0, offsety: 0, worldscale: 640/1536 },
            { width: 1152, height: 720, offsetx: 0, offsety: 0, worldscale: 730/1536 },
            { width: 1280, height: 800, offsetx: 0, offsety: 0, worldscale: 800/1536 },
            { width: 1680, height: 1050, offsetx: 150, offsety: 0, worldscale: 1050/1536 }
        ]/*,
        '16:9': [
            { width: 1136, height: 640 },
            { width: 1600, height: 900 }
        ]*/
    };

    let normalizedresolution = null;

    for(let i = 0; i < resolutionsbyratio[normalizedratio.name].length; i++) {
        const potentialresolution = resolutionsbyratio[normalizedratio.name][i];
        if(normalizedwidth <= potentialresolution.width) normalizedresolution = potentialresolution;
    }

    if(normalizedresolution === null) {
        normalizedresolution = resolutionsbyratio[normalizedratio.name][resolutionsbyratio[normalizedratio.name].length -1];
    }

    //normalizedresolution = resolutionsbyratio['4:3'][0];    // 640x480
    //normalizedresolution = resolutionsbyratio['4:3'][1];    // 800x600
    normalizedresolution = resolutionsbyratio['4:3'][2];    // 1024x768
    //normalizedresolution = resolutionsbyratio['4:3'][3];    // 2048x1536

    return normalizedresolution;
}

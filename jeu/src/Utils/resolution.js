'use strict';

import resolutionsdata from './resolutions.data';
import isportrait from './isportrait';

export default function() {
    let screenwidth = Math.max(window.screen.width);
    let screenheight = Math.max(window.screen.height);
    if(/*screenheight > screenwidth*/isportrait()) {
        let tmp = screenwidth;
        screenwidth = screenheight;
        screenheight = tmp;
    }

    const ratio = screenwidth / screenheight;

    let normalizedratio = null;
    let normalizedresolution = null;
    let normalizedwidth;
    let normalizedheight;

    // First, look for perfect match
    const match = resolutionsdata.filter(function(res) {
        return res.width === screenwidth && res.height === screenheight;
    });

    if(match.length) {
        normalizedresolution = match[0];
    } else {
        // normalizing height depending on width
        const ratios = [
            { ratio: 4/3, name: '4:3'},
            { ratio: 3/2, name: '3:2'},
            { ratio: 8/5, name: '8:5'},
            { ratio: 16/9, name: '16:9'}
        ];
        for(let i = 0; i < ratios.length; i++) {
            const potentialratio = ratios[i];
            if(potentialratio.ratio <= ratio) normalizedratio = potentialratio;
        }

        if(normalizedratio === null) normalizedratio = ratios[ratios.length - 1];

        console.log(normalizedratio);

        normalizedwidth = screenwidth;
        normalizedheight = (screenwidth / normalizedratio.ratio)|0;
        if(normalizedheight > screenheight) {
            normalizedheight = screenheight;
            normalizedwidth = (screenheight * normalizedratio.ratio)|0;
        }

        console.log({ screenwidth, screenheight, normalizedratio, normalizedwidth, normalizedheight, ratios });

        // normalizing resolution
        const resolutions = resolutionsdata.filter(res => res.ratio === normalizedratio.name);

        for(let i = 0; i < resolutions.length; i++) {
            const potentialresolution = resolutions[i];
            if(potentialresolution.width <= normalizedwidth) normalizedresolution = potentialresolution;
        }

        if(normalizedresolution === null) {
            normalizedresolution = resolutions[resolutions.length-1];
        }
    }

    //normalizedresolution = resolutionsbyratio['4:3'][0];    // 640x480
    //normalizedresolution = resolutionsbyratio['4:3'][1];    // 800x600
    //normalizedresolution = resolutionsbyratio['4:3'][2];    // 1024x768
    //normalizedresolution = resolutionsdata[0];

    //console.log(normalizedresolution);

    normalizedresolution.screenwidth = screenwidth;
    normalizedresolution.screenheight = screenheight;

    normalizedresolution.effectivewidth = normalizedwidth;
    normalizedresolution.effectiveheight = normalizedheight;

    return normalizedresolution;
}

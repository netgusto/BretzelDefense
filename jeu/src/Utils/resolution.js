'use strict';

import resolutionsdata from './resolutions.data';
import isportrait from './isportrait';

export default function() {

    let normalizedresolution;

    let dpr = window.devicePixelRatio || 1;
    if(dpr < 1) dpr = 1;    // zoomed out browser

    let screenwidth = Math.max(window.screen.width) * dpr;
    let screenheight = Math.max(window.screen.height) * dpr;

    if(screenheight > screenwidth) {
        let tmp = screenwidth;
        screenwidth = screenheight;
        screenheight = tmp;
    }

    // First, look for perfect match
    const match = resolutionsdata.filter(function(res) {
        return res.width === screenwidth && res.height === screenheight;
    });

    if(match.length) {
        normalizedresolution = match[0];
    } else {
        const screenratio = screenwidth / screenheight;

        // order resolutions by descending likeliness of ratio
        resolutionsdata.sort(function(a, b) {
            const diffa = Math.abs((a.width/a.height) - screenratio);
            const diffb = Math.abs((b.width/b.height) - screenratio);
            return (diffb - diffa) * -1;    // -1 : lower values are better
        });

        let bestres = null;
        for(let i = 0; i < resolutionsdata.length; i++) {
            const thisres = resolutionsdata[i];
            if(
                bestres === null || (
                    thisres.height > bestres.height &&
                    Math.abs(thisres.height - screenheight) < Math.abs(bestres.height - screenwidth)
                )
            ) {
                bestres = thisres;
            }
        }

        normalizedresolution = bestres;
    }

    normalizedresolution.screenwidth = screenwidth;
    normalizedresolution.screenheight = screenheight;

    // maximizing canvas in screen
    let effectivewidth = screenwidth;
    let effectiveheight = normalizedresolution.height * (screenwidth / normalizedresolution.width);
    if(effectiveheight > screenheight) {
        effectiveheight = screenheight;
        effectivewidth = normalizedresolution.width * (screenheight / normalizedresolution.height);
    }

    normalizedresolution.effectivewidth = effectivewidth;
    normalizedresolution.effectiveheight = effectiveheight;

    // on adapte le worldscale pour convenir à la résolution étirée (exemple: écran de 1152x864 utilisant le setup 1536x1152)
    normalizedresolution.worldscale = normalizedresolution.worldscale * (effectiveheight/normalizedresolution.height);


    console.log(normalizedresolution);

    return normalizedresolution;

    /*
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
            console.log('ici');
            normalizedheight = screenheight;
            normalizedwidth = (screenheight * normalizedratio.ratio)|0;
        } else {
            console.log('laaa', normalizedheight);
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
    normalizedresolution = resolutionsdata[2];

    //console.log(normalizedresolution);

    normalizedresolution.screenwidth = screenwidth;
    normalizedresolution.screenheight = screenheight;

    normalizedresolution.effectivewidth = normalizedwidth;
    normalizedresolution.effectiveheight = normalizedheight;
    */

    return normalizedresolution;
}

'use strict';

import resolutionsdata from './resolutions.data';
//import isportrait from './isportrait';

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
    if(effectiveheight !== screenheight) {
        effectiveheight = screenheight;
        effectivewidth = normalizedresolution.width * (screenheight / normalizedresolution.height);
    }

    normalizedresolution.effectivewidth = effectivewidth;
    normalizedresolution.effectiveheight = effectiveheight;

    // REQUIS ?
    // on adapte le worldscale pour convenir à la résolution étirée (exemple: écran de 1152x864 utilisant le setup 1536x1152)
    normalizedresolution.worldscale = normalizedresolution.worldscale * (effectiveheight/normalizedresolution.height);
    normalizedresolution.lanescale = effectiveheight/normalizedresolution.height;   // les coordonnées de points sur les lanes appliquent déjà le worldscale pour chaque résolution; on ne gère que l'éventuelle adaptation à l'écran

    return normalizedresolution;
}

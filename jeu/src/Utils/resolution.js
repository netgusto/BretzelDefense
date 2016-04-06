'use strict';

import resolutionsdata from './resolutions.data';

export default function() {
    const screenwidth = window.screen.availWidth - 30;
    const screenheight = window.screen.availHeight - 80;
    const ratio = screenwidth / screenheight;
    let normalizedratio = null;

    // normalizing height depending on width
    const ratios = [
        { ratio: 4/3, name: '4:3'},
        { ratio: 3/2, name: '3:2'},
        { ratio: 8/5, name: '8:5'}//,
        //{ ratio: 16/9, name: '16:9'}
    ];
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
    const resolutions = resolutionsdata.filter(res => res.ratio === normalizedratio.name);

    let normalizedresolution = null;

    for(let i = 0; i < resolutions.length; i++) {
        const potentialresolution = resolutions[i];
        if(normalizedwidth <= potentialresolution.width) normalizedresolution = potentialresolution;
    }

    if(normalizedresolution === null) {
        normalizedresolution = resolutions[resolutions.length-1];
    }

    //normalizedresolution = resolutionsbyratio['4:3'][0];    // 640x480
    //normalizedresolution = resolutionsbyratio['4:3'][1];    // 800x600
    //normalizedresolution = resolutionsbyratio['4:3'][2];    // 1024x768
    normalizedresolution = resolutionsdata[0];    // 2048x1536

    //console.log(normalizedresolution);

    return normalizedresolution;
}

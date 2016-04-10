'use strict';


const world = {
    set: function(what, value) { world[what] = value; return world; },
    timescale: 1,
    scale: 1
};

export default world;

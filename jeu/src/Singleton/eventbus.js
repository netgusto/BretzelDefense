'use strict';

import Emitter from 'tiny-emitter';

const eventbus = new Emitter();
const stdemit = eventbus.emit;
eventbus.emit = function(name) {
    console.info('EVENT:' + name);
    stdemit.apply(eventbus, arguments);
};

export default eventbus;

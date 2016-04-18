'use strict';

import Emitter from 'tiny-emitter';

const eventbus = new Emitter();
const stdemit = eventbus.emit;
eventbus.emit = function(name) {
    console.info('EVENT:' + name);
    stdemit.apply(eventbus, arguments);
};

eventbus.removeAll = (function() {
    for (var key in this.e) {
        if (this.e.hasOwnProperty(key)) {
            this.off(key);
        }
    }
}).bind(eventbus);

export default eventbus;

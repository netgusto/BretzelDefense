'use strict';

import Emitter from 'tiny-emitter';
//import stampit from 'stampit';
import compose from '../compose-js';

const Listenable = compose({
    init: function() {
        this.declareImplements('Listenable');

        const emitter = new Emitter();
        
        this.on = (eventname, cbk) => emitter.on(eventname, cbk);
        this.once = (eventname, cbk) => emitter.once(eventname, cbk);
        this.off = (eventname, cbk = undefined) => emitter.off(eventname, cbk);
        this.emit = (eventname, ...args) => emitter.emit(eventname, ...args);
    }
});

export default Listenable;

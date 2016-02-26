'use strict';

import compose from 'compose-js';

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

let id = 0;

const Identifiable = compose({
    init: function() {
        this.declareImplements('Identifiable');
        if(!this.id) {
            //this.id = uuid();
            this.id = id++;
        }
    },
    props: {
        id: null
    },
    methods: {
        getId() {
            return this.id;
        }
    }
});

export default Identifiable;

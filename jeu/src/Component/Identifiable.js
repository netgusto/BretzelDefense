'use strict';

import compose from 'compose-js';

let id = 0;

const Identifiable = compose({
    init: function() {
        this.tag('Identifiable');
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

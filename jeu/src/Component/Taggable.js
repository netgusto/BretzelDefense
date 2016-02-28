'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';

export default compose({
    init: function() {
        this.tag('Taggable');
    },
    props: {
        taggabletags: {}
    },
    methods: {
        tag(name: string) : Object {
            this.taggabletags[name] = true;
            return this;
        },
        hasTag(name: string) : boolean {
            return this.taggabletags[name];
        }
    }
});


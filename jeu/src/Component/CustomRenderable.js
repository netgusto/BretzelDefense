'use strict';

//import stampit from 'stampit';
import compose from 'compose-js';

const CustomRenderable = compose({
    init: function() {
        this.declareImplements('CustomRenderable');
    },
    props: {
        customrender: { render: () => null }
    },
    methods: {
        setCustomRenderMethod(method) {
            this.customrender.render = method;
            return this;
        },
        render(params) {
            this.customrender.render(params);
        }
    }
});

export default CustomRenderable;

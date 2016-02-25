'use strict';

import merge from 'merge';
import clone from 'clone';

const stdprops = ['init', 'expects', 'props', 'methods', 'create', 'compose'];

const sym = Symbol('compose');

export default function compose(...factories) {

    const factobjects = factories.map(factory => {
        if(typeof factory === 'function' && typeof factory[sym] === 'object') {
            return factory[sym];
        }

        return factory;
    });

    const basefactoryobject = Object.assign({}, ...factobjects.map(factory => Object.getOwnPropertyNames(factory).filter(name => stdprops.indexOf(name) === -1).reduce((obj, name) => {
        obj[name] = factory[name];
        return obj;
    }, {})));

    const res = Object.assign({}, basefactoryobject, {
        init: function() {
            factobjects.map(factory => 'init' in factory ? factory.init.apply(this) : null);
        },
        expects: Object.assign({}, ...factobjects.map(factory => 'expects' in factory ? factory.expects : {})),
        props: merge.recursive({}, ...factobjects.map(factory => 'props' in factory ? factory.props : {})),
        methods: Object.assign({}, ...factobjects.map(factory => 'methods' in factory ? factory.methods : {})),
        create: function(buildprops = {}) {

            const compiled = Object.assign({}, clone(this.props, false), this.methods, buildprops);

            Object.keys(this.expects).map(expectationname => {
                if(!(expectationname in compiled)) {
                    throw new Error('Failed expectation for ' + expectationname + '; property is missing.');
                }
                let expectationtype = this.expects[expectationname];

                if(compiled[expectationname].constructor !== expectationtype) {
                    throw new Error('Failed expectation for ' + expectationname + '; type mismatch; expected ' + expectationtype.name + ', got ' + compiled[expectationname].constructor.name);
                }
            });

            this.init.apply(compiled);
            return compiled;
        },
        compose: function(...factoriez) {
            return compose.apply(null, [this, ...factoriez]);
        }
    });

    const f = function(buildprops = {}) { return res.create(buildprops); };
    f[sym] = res;
    f.create = f;
    f.compose = function(...factoriez) { return compose(res, ...factoriez); };
    Object.getOwnPropertyNames(basefactoryobject).map(name => f[name] = basefactoryobject[name]);

    return f;
};

'use strict';

import { merge } from 'supermixer';
import clone from 'clone';

const stdprops = ['init', 'expects', 'props', 'methods', 'create', 'compose'];

const sym = Symbol('compose');

export default function compose(...factories) {

    const basefactoryobject = Object.assign({}, ...factories.map(factory => Object.getOwnPropertyNames(factory).filter(name => stdprops.indexOf(name) === -1).reduce((obj, name) => {
        obj[name] = factory[name];
        return obj;
    }, {})));

    const res = Object.assign({}, basefactoryobject, {
        init: function() {
            factories.map(factory => 'init' in factory ? factory.init.apply(this) : null);
        },
        expects: Object.assign({}, ...factories.map(factory => 'expects' in factory ? factory.expects : {})),
        props: merge({}, ...factories.map(factory => 'props' in factory ? factory.props : {})),
        methods: Object.assign({}, ...factories.map(factory => 'methods' in factory ? factory.methods : {})),
        create: function(buildprops = {}) {

            const compiled = Object.assign({}, clone(this.props), this.methods, buildprops);

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
        }
    });

    return res;
};

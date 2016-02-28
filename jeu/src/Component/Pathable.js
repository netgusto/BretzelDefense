'use strict';

/* @flow */

//import stampit from 'stampit';
import compose from 'compose-js';

const Pathable = compose({
    init: function() {
        this.tag('Pathable');
    },
    props: {
        path: {
            target: null,
            route: {
                target: null,
                steps: null
            }
        }
    },
    methods: {
        setPathTarget(x: number, y: number) {
            this.path.target = { x, y };
        },
        getPathTarget(x: number, y: number) {
            return this.path.target;
        },
        getRouteSteps() {
            return this.path.route.steps;
        },
        setRoute(steps, target) {
            this.path.route = { steps, target };
            return this;
        },
        isEnRoute() {
            return this.path.route.steps !== null;
        },
        isRouteValid(target) {
            
            if(target === null) {

                if(this.path.route.target === null) {
                    return true;
                }

                return false;
            }  else if(this.path.route.target === null) {
                return false;
            }

            return target.x === this.path.route.target.x && target.y === this.path.route.target.y;
        },
        getRoute() {
            return this.path.route.steps;
        }
    }
});

export default Pathable;

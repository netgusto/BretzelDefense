'use strict';

// TODO: Use Collaborative diffusion
// @see http://sgd.cs.colorado.edu/wiki/Collaborative_Diffusion
// @see http://ramblingsofagamedevstudent.blogspot.fr/2013/11/for-my-honours-project-this-year-at.html
// @see https://www.youtube.com/watch?v=CRUrp_E-JOw
// @see https://www.youtube.com/watch?v=YE4pM1QIVzE
// @see https://www.youtube.com/watch?v=jXhXMeQFMTI


/* @flow */

import 'perfnow';

import { js as EasyStar } from 'easystarjs';

export default class Pathfinder {

    constructor({ map, cellwidth, cellheight} : { map: Array<number>, cellwidth: number, cellheight: number }) {

        // ATTENTION : pour javascript-astar, map est en coordonnées y,x

        this.easystar = new EasyStar();
        this.easystar.setGrid(map);
        this.easystar.setAcceptableTiles([1]);
        this.easystar.enableDiagonals();
        this.easystar.enableCornerCutting();
        //this.easystar.setIterationsPerCalculation(500);
        this.easystar.enableSync();

        this.determineGridCell = clickpoint => {
            const x = Math.floor(clickpoint.x / cellwidth);
            const y = Math.floor(clickpoint.y / cellheight);
            return { x, y };
        };
    }

    match(item: DisplayObject): boolean {
        return item.hasTag('Pathable');
    }

    process(entities: Array<DisplayObject>, { deltatime } : { deltatime: number }) {
        entities.map(entity => {
            const targetpoint = entity.getPathTarget();
            if(targetpoint === null) return;

            if(entity.isRouteValid(targetpoint)) return;

            const entitycell = this.determineGridCell(entity.getPosition());
            const targetcell = this.determineGridCell(targetpoint);

            const start = performance.now();

            this.easystar.findPath(entitycell.x, entitycell.y, targetcell.x, targetcell.y, function(steps) {
                console.log('PATH matched in ', (performance.now() - start).toFixed(2));
                if(steps === null) return;  // no possible path
                entity.setRoute(steps, targetpoint);
            });
            this.easystar.calculate();
        });
    }
}

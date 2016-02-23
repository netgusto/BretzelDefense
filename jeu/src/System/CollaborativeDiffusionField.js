'use strict';

/* @flow */

export default class CollaborativeDiffusionField {

    constructor({ cellwidth, cellheight, worldwidth, worldheight, map, onupdate }) {

        this.cellwidth = cellwidth;
        this.cellheight = cellheight;

        this.map = map;

        this.nbcellsx = Math.ceil(worldwidth / cellwidth);
        this.nbcellsy = Math.ceil(worldheight / cellheight);

        this.field = new Array(this.nbcellsy);
        for(let y = 0; y < this.nbcellsy; y++) {
            this.field[y] = new Array(this.nbcellsx);
            for(let x = 0; x < this.nbcellsx; x++) {
                this.field[y][x] = 0;
            }
        }

        this.onupdate = onupdate;

        this.peak = Math.pow(2, 32);
    }

    match(item: DisplayObject): boolean {
        return item.fieldtarget || item.fieldobstacle || item.checkImplements('CollaborativeDiffusionFieldAgent');
    }

    getRectangleForGridCell(gridcell) {
        return {
            x: gridcell.x * this.cellwidth,
            y: gridcell.y * this.cellheight,
            width: this.cellwidth,
            height: this.cellheight
        };
    }

    getFieldPositionForPixelPosition(x, y) {
        let cellx = Math.floor(x / this.cellwidth);
        let celly = Math.floor(y / this.cellheight);

        if(cellx < 0) { cellx = 0; }
        else if(cellx > this.nbcellsx-1) { cellx = this.nbcellsx-1; }

        if(celly < 0) { celly = 0; }
        else if(celly > this.nbcellsy-1) { celly = this.nbcellsy-1; }

        return { x: cellx, y: celly };
    }

    getValue(x, y) {
        return this.field[y][x];
    }

    getNeighbours(x, y) {

        let n = null, s = null, e = null, w = null, nw = null, ne = null, sw = null, se = null;
        const firstx = (x === 0);
        const firsty = (y === 0);
        const lastx = (x === this.nbcellsx-1);
        const lasty = (y === this.nbcellsy-1);

        if(!firsty) {
            n = this.field[y-1][x];      // north
            
            if(!firstx) {
                nw = this.field[y-1][x-1];    // north-west
            }

            if(!lastx) {
                ne = this.field[y-1][x+1];    // north-east
            }
        }

        if(!firstx) {
            w = this.field[y][x-1];      // west

            if(!lasty) {
                sw = this.field[y+1][x-1];        // south-west
            }
        }

        if(!lastx) {
            e = this.field[y][x+1];      // east

            if(!lasty) {
                se = this.field[y+1][x+1];    // south-east
            }
        }

        if(!lasty) { s = this.field[y+1][x]; } // south

        return { n, ne, e, se, s, sw, w, nw };
    }

    climb(x, y) {
        if(this.field[y][x] === this.peak) return null;

        const neighbours = this.getNeighbours(x, y);

        let dir = null;
        let val = null;
        // for(let direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
        //     if(neighbours[direction] === 0) continue;
        //     if(val === null || val < neighbours[direction]) {
        //         val = neighbours[direction];
        //         dir = direction;
        //     }
        // }

        if(neighbours['n'] !== 0) {
            if(val === null || val < neighbours['n']) {
                val = neighbours['n']; dir = 'n';
            }
        }

        if(neighbours['ne'] !== 0) {
            if(val === null || val < neighbours['ne']) {
                val = neighbours['ne']; dir = 'ne';
            }
        }

        if(neighbours['e'] !== 0) {
            if(val === null || val < neighbours['e']) {
                val = neighbours['e']; dir = 'e';
            }
        }

        if(neighbours['se'] !== 0) {
            if(val === null || val < neighbours['se']) {
                val = neighbours['se']; dir = 'se';
            }
        }

        if(neighbours['s'] !== 0) {
            if(val === null || val < neighbours['s']) {
                val = neighbours['s']; dir = 's';
            }
        }

        if(neighbours['sw'] !== 0) {
            if(val === null || val < neighbours['sw']) {
                val = neighbours['sw']; dir = 'sw';
            }
        }

        if(neighbours['w'] !== 0) {
            if(val === null || val < neighbours['w']) {
                val = neighbours['w']; dir = 'w';
            }
        }

        if(neighbours['nw'] !== 0) {
            if(val === null || val < neighbours['nw']) {
                val = neighbours['nw']; dir = 'nw';
            }
        }

        return dir;
    }

    process(entities: Array<DisplayObject>, params) {

        if(entities.length === 0) return;

        const goalcells = [];
        const obstaclecells = [];
        const agentcells = [];

        //entities.map(entity => {
        for(let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            const pos = entity.getPosition();
            const cell = this.getFieldPositionForPixelPosition(pos.x, pos.y);

            if(entity.fieldtarget) {
                this.field[cell.y][cell.x] = this.peak;
                cell.entity = entity;
                goalcells.push(cell);
            } else if(entity.fieldobstacle) {
                this.field[cell.y][cell.x] = 0;
                cell.entity = entity;
                obstaclecells.push(cell);
            } else if(entity.checkImplements('CollaborativeDiffusionFieldAgent')) {
                cell.entity = entity;
                agentcells.push(cell);
            }
        }
        //});

        const newfield = this.field.slice(0);

        for(let y = 0; y < this.nbcellsy; y++) {
            for(let x = 0; x < this.nbcellsx; x++) {

                let isgoal = false;
                let isobstacle = false;
                for(let k = 0; k < goalcells.length; k++) {
                    if(y == goalcells[k].y && x == goalcells[k].x) {
                        isgoal = true;
                        break;
                    }
                }

                for(let k = 0; k < obstaclecells.length; k++) {
                    if(y == obstaclecells[k].y && x == obstaclecells[k].x) {
                        isobstacle = true;
                        break;
                    }
                }

                if(isgoal || isobstacle) { continue; }

                /* NOT using getNeighbours here, because it's faster inlined */

                let sum = 0;
                const firstx = (x === 0);
                const firsty = (y === 0);
                const lastx = (x === this.nbcellsx-1);
                const lasty = (y === this.nbcellsy-1);

                let n = 0, s = 0, w = 0, e = 0;

                if(!firstx) {
                    w = this.field[y][x-1];      // west
                }

                if(!firsty) {
                    n = this.field[y-1][x];      // north
                }

                if(!lastx) {
                    e = this.field[y][x+1];      // east
                }

                if(!lasty) {
                    s = this.field[y+1][x];     // south
                }

                const curval = newfield[y][x];
                newfield[y][x] = ((n + s + w + e) / 4) * this.map[y][x];    // 1: walkable; 0: wall; used as diffusion coefficient
            }
        }

        goalcells.map(cell => newfield[cell.y][cell.x] = this.peak);
        obstaclecells.map(cell => newfield[cell.y][cell.x] = 0);

        this.onupdate({
            field: newfield,
            getFieldPositionForPixelPosition: this.getFieldPositionForPixelPosition.bind(this),
            getValue: this.getValue.bind(this),
            getNeighbours: this.getNeighbours.bind(this),
            getGoalsAtPosition: (x, y) => goalcells.filter(cell => cell.x === x && cell.y === y),
            climb: this.climb.bind(this),
            cellwidth: this.cellwidth,
            cellheight: this.cellheight,
            nbcellsx: this.nbcellsx,
            nbcellsy: this.nbcellsy
        });
        this.field = newfield;
    }
}

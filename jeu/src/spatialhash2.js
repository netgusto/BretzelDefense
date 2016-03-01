'use strict';

export default class SpatialHash2 {

    constructor({ cellwidth, cellheight, worldwidth, worldheight, maxentityid=16384 }) {
        this.cellwidth = cellwidth;
        this.cellheight = cellheight;
        this.worldwidth = worldwidth;
        this.worldheight = worldheight;
        this.maxentityid = maxentityid;

        this.nbcellsx = Math.ceil(this.worldwidth / cellwidth);
        this.nbcellsy = Math.ceil(this.worldheight / cellheight);

        this.grid = new Array(this.nbcellsx * this.nbcellsy);
        this.list = new Uint16Array(maxentityid);
        this.stackindex = new Uint16Array(maxentityid);
        for(let k = 0; k < this.grid.length; k++) {
            this.grid[k] = [];
        }
    }

    clear() {
        this.grid = new Array(this.nbcellsx * this.nbcellsy);
        this.list = new Uint16Array(this.maxentityid);
        this.stackindex = new Uint16Array(this.maxentityid);

        for(let k = 0; k < this.grid.length; k++) {
            this.grid[k] = [];
        }
    }

    insert(item) {
        const cellx = parseInt(item.x / this.cellwidth);
        const celly = parseInt(item.y / this.cellheight);

        const gridcell = celly * this.nbcellsx + cellx;
        this.grid[gridcell].push(item);
        this.list[item.id] = gridcell;
        this.stackindex[item.id] = this.grid[gridcell].length - 1;
    }

    retrieve(item) {
        const cellx = parseInt(item.x / this.cellwidth);
        const celly = parseInt(item.y / this.cellheight);
        //console.log(cellx, celly, celly * this.nbcellsx + cellx);
        return this.grid[celly * this.nbcellsx + cellx];
    }

    update(item) {

        const previousgridcell = this.list[item.id];
        if(!previousgridcell) {
            this.insert(item);
            return;
        }

        const cellx = parseInt(item.x / this.cellwidth);
        const celly = parseInt(item.y / this.cellheight);
        const gridcell = celly * this.nbcellsx + cellx;

        if(previousgridcell === gridcell) return;

        this.grid[previousgridcell].splice(this.stackindex[item.id], 1);
        let newindex = 0;
        this.grid[previousgridcell].map(item => {
            this.stackindex[item.id] = newindex;
            newindex++;
        });
        this.grid[gridcell].push(item);
        this.list[item.id] = gridcell;
        this.stackindex[item.id] = this.grid[gridcell].length - 1;

        //console.log(this.list);
    }

    remove(item) {
        const gridcell = this.list[item.id];
        if(!gridcell) {
            return;
        }

        this.grid[gridcell].splice(this.stackindex[item.id], 1);
        let newindex = 0;
        this.grid[gridcell].map(item => {
            this.stackindex[item.id] = newindex;
            newindex++;
        });
        this.list[item.id] = undefined;
        this.stackindex[item.id] = undefined;
    }
}
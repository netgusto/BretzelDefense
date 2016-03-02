'use strict';

// TODO: tester avec une liste doublement liée; tester avec un tableau à 2 dimensions x, y

export default class SpatialHash2 {

    constructor({ cellwidth, cellheight, worldwidth, worldheight, maxentityid=16384 }) {
        this.cellwidth = cellwidth;
        this.cellheight = cellheight;
        this.worldwidth = worldwidth;
        this.worldheight = worldheight;
        this.maxentityid = maxentityid;

        this.nbcellsx = Math.ceil(this.worldwidth / cellwidth);
        this.nbcellsy = Math.ceil(this.worldheight / cellheight);

        this.clear();
    }

    clear() {
        this.grid = new Array(this.nbcellsx * this.nbcellsy);
        this.list = new Uint16Array(this.maxentityid);
        this.stackindex = new Uint16Array(this.maxentityid);

        for(let k = 0; k < this.grid.length; k++) {
            this.grid[k] = [];
        }
    }

    insert(x, y, width, height, id, entity) {
        const cellx = parseInt(x / this.cellwidth);
        const celly = parseInt(y / this.cellheight);

        const gridcell = celly * this.nbcellsx + cellx;
        this.grid[gridcell].push({
            x,
            y,
            width,
            height,
            id,
            entity
        });
        this.list[id] = gridcell;
        this.stackindex[id] = this.grid[gridcell].length - 1;
    }

    retrieve(centerx, centery, range) {

        // on récupère toutes les boîtes dans lesquelles le cercle est inscrit
        let diameter = range * 2;

        let rangeboundx = centerx - range;
        let rangeboundy = centery - range;

        let rangeboundxend = rangeboundx + diameter;
        let rangeboundyend = rangeboundy + diameter;

        if(rangeboundx < 0) rangeboundx = 0;
        if(rangeboundy < 0) rangeboundy = 0;

        if(rangeboundxend >= this.worldwidth) rangeboundxend = this.worldwidth - 1;
        if(rangeboundyend >= this.worldheight) rangeboundyend = this.worldheight - 1;

        let firstcellx = Math.floor(rangeboundx / this.cellwidth);
        let firstcelly = Math.floor(rangeboundy / this.cellheight);

        if(firstcellx < 0) firstcellx = 0;
        if(lastcellx < 0) lastcellx = 0;

        let lastcellx = Math.floor(rangeboundxend / this.cellwidth);
        let lastcelly = Math.floor(rangeboundyend / this.cellheight);

        if(lastcellx >= this.nbcellsx) lastcellx = this.nbcellsx;
        if(lastcelly >= this.nbcellsy) lastcelly = this.nbcellsy;

        let result = [];

        //console.log({ first: firstcelly * this.nbcellsx + firstcellx, last: lastcelly * this.nbcellsx + lastcellx });

        const radiussq = Math.pow(range, 2);

        for(let gridy = firstcelly; gridy <= lastcelly; gridy++) {
            for(let gridx = firstcellx; gridx <= lastcellx; gridx++) {
                result = result.concat((this.grid[gridy * this.nbcellsx + gridx]||[]).filter(item => {
                    const dxsq = Math.pow(centerx - item.x, 2);
                    const dysq = Math.pow(centery - item.y, 2);
                    const distancesq = dxsq + dysq;
                    return distancesq <= radiussq;
                }));
            }
        }

        return result;
    }

    update(x, y, width, height, id, entity) {

        const previousgridcell = this.list[id];
        if(!previousgridcell) {
            this.insert(x, y, width, height, id, entity);
            return;
        }

        const cellx = parseInt(x / this.cellwidth);
        const celly = parseInt(y / this.cellheight);
        const gridcell = celly * this.nbcellsx + cellx;

        const cell = this.grid[previousgridcell];
        const item = cell[this.stackindex[id]];
        item.x = x;
        item.y = y;

        if(previousgridcell === gridcell) return;

        cell.splice(this.stackindex[id], 1);
        let newindex = 0;
        cell.map(item => {
            this.stackindex[item.id] = newindex;
            newindex++;
        });
        this.grid[gridcell].push(item);
        this.list[id] = gridcell;
        this.stackindex[id] = this.grid[gridcell].length - 1;

        //console.log(this.list);
    }

    remove(id) {
        const gridcell = this.list[id];
        if(!gridcell) {
            return;
        }

        const cell = this.grid[gridcell];

        cell.splice(this.stackindex[item.id], 1)
        let newindex = 0;
        this.grid[gridcell].map(item => {
            this.stackindex[item.id] = newindex;
            newindex++;
        });
        this.list[id] = undefined;
        this.stackindex[id] = undefined;
    }
}
'use strict';
/*global Uint16Array*/

// TODO: tester avec une liste doublement liée; tester avec un tableau à 2 dimensions x, y

export default class SpatialHash {

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

        for(let k = 0; k < this.nbcellsx * this.nbcellsy; k++) {
            this.grid[k] = [];
        }
    }

    insert(boundsx, boundsy, width, height, id, entity) {

        // on calcule le centroide de la bounding box

        const centroidx = (boundsx + width/2)|0;
        const centroidy = (boundsy + height/2)|0;
        const cellx = (centroidx / this.cellwidth)|0;
        const celly = (centroidx / this.cellheight)|0;

        const gridcell = celly * this.nbcellsx + cellx;
        this.grid[gridcell].push({
            id,
            centerx: centroidx,
            centery: centroidy,
            entity,
            distance: null
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

        let firstcellx = (rangeboundx / this.cellwidth)|0;
        let firstcelly = (rangeboundy / this.cellheight)|0;

        if(firstcellx < 0) firstcellx = 0;
        if(lastcellx < 0) lastcellx = 0;

        let lastcellx = (rangeboundxend / this.cellwidth)|0;
        let lastcelly = (rangeboundyend / this.cellheight)|0;

        if(lastcellx >= this.nbcellsx) lastcellx = this.nbcellsx;
        if(lastcelly >= this.nbcellsy) lastcelly = this.nbcellsy;

        //console.log({ first: firstcelly * this.nbcellsx + firstcellx, last: lastcelly * this.nbcellsx + lastcellx });

        const radiussq = Math.pow(range, 2);
        const matching = [];

        for(let gridy = firstcelly; gridy <= lastcelly; gridy++) {
            for(let gridx = firstcellx; gridx <= lastcellx; gridx++) {
                const cell = this.grid[gridy * this.nbcellsx + gridx];
                for(let k = 0; k < cell.length; k++) {
                    let item = cell[k];
                    const dsq = Math.pow(centerx - item.centerx, 2) + Math.pow(centery - item.centery, 2);
                    if(dsq <= radiussq) {
                        item.distance = Math.sqrt(dsq);
                        matching.push(item);
                    }
                }
                //result = result.concat(matching);
            }
        }

        return matching;
    }

    update(boundsx, boundsy, width, height, id) {

        const previousgridcell = this.list[id];
        //if(previousgridcell === undefined) {
        //    this.insert(x, y, width, height, id, entity);
        //    return;
        //}

        // on calcule le centroide de la bounding box

        const centroidx = (boundsx + width/2)|0;
        const centroidy = (boundsy + height/2)|0;

        const cellx = (centroidx / this.cellwidth)|0;
        const celly = (centroidy / this.cellheight)|0;
        const gridcell = celly * this.nbcellsx + cellx;

        const cell = this.grid[previousgridcell];
        const item = cell[this.stackindex[id]];
        item.centerx = centroidx;
        item.centery = centroidy;

        if(previousgridcell === gridcell) return;
        const newcell = this.grid[gridcell];
        if(!newcell) return;

        cell.splice(this.stackindex[id], 1);
        let newindex = 0;
        for(let k = 0; k < cell.length; k++) {
            this.stackindex[cell[k].id] = newindex;
            newindex++;
        }

        newcell.push(item);
        this.list[id] = gridcell;
        this.stackindex[id] = newcell.length - 1;

        //console.log(this.list);
    }

    remove(id) {
        const gridcell = this.list[id];
        if(!gridcell) {
            return;
        }

        const cell = this.grid[gridcell];

        cell.splice(this.stackindex[id], 1)
        let newindex = 0;
        this.grid[gridcell].map(item => {
            this.stackindex[item.id] = newindex;
            newindex++;
        });
        this.list[id] = undefined;
        this.stackindex[id] = undefined;
    }
}
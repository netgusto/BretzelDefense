'use strict';

/* @flow */

import { DisplayObject, Graphics, Rectangle } from 'pixi.js';

//import stampit from 'stampit';
import compose from 'compose-js';

import GenericEntity from './Generic';
import CustomRenderable from '../Component/CustomRenderable';

import maptiles from '../map-blocks';

const MapPathBuilderable = compose({
    expects: {
        displayobject: DisplayObject,
        cellwidth: Number,
        cellheight: Number,
        cursor: Object
    },
    init: function({ cellwidth, cellheight, cursor }) {
        //console.log(maptiles);

        this.tiles = maptiles;
        this.cellwidth = cellwidth;
        this.cellheight = cellheight;

        let highlightcell = null;
        let mousedown = false;
        let erasing = false;

        const map = this.displayobject;

        this.nbcellsx = Math.ceil(map.width / this.cellwidth);
        this.nbcellsy = Math.ceil(map.height / this.cellheight);

        if(this.tiles.length === 0) {
            for(let y = 0; y < this.nbcellsy; y++) {
                const xtiles = [];
                for(let x = 0; x < this.nbcellsx; x++) {
                    xtiles.push(0);
                }
                this.tiles.push(xtiles);
            }
        }

        const determineGridCell = clickpoint => {
            const x = Math.floor(clickpoint.x / this.cellwidth);
            const y = Math.floor(clickpoint.y / this.cellheight);
            return { x, y };
        };

        const getRectangleForGridCell = gridcell => {
            return {
                x: gridcell.x * this.cellwidth,
                y: gridcell.y * this.cellheight,
                width: this.cellwidth,
                height: this.cellheight
            };
        };

        console.log(cursor);

        const getValueToApply = (currentvalue) => {

            if(erasing) return 0;

            if(cursor.shift && cursor.alt) {
                if(currentvalue === 0) return 0;
                return 3;
            }

            if(cursor.shift) {
                if(currentvalue === 0) return 0;
                return 1;
            }

            if(cursor.alt) {
                if(currentvalue === 0) return 0;
                return 2;
            }

            return 4;
        };

        const mapstategraphics = new Graphics();
        map.addChild(mapstategraphics);

        const highlightgraphics = new Graphics();
        map.addChild(highlightgraphics);

        map.interactive = true;
        map.mousemove = event => {
            const gridpoint = event.data.getLocalPosition(map);
            highlightcell = determineGridCell(gridpoint);

            if(mousedown) {
                this.tiles[highlightcell.y][highlightcell.x] = getValueToApply(this.tiles[highlightcell.y][highlightcell.x]);
            }
        };

        map.mousedown = event => {
            const gridpoint = event.data.getLocalPosition(map);
            highlightcell = determineGridCell(gridpoint);
            const curval = this.tiles[highlightcell.y][highlightcell.x];
            erasing = curval !== 0 && !(cursor.shift || cursor.alt || cursor.ctrl);
            mousedown = true;
            this.tiles[highlightcell.y][highlightcell.x] = getValueToApply(this.tiles[highlightcell.y][highlightcell.x]);
        };
        map.mouseup = () => {
            mousedown = false;
            console.log(JSON.stringify(this.tiles).replace(/\],\[/g, '],\n['));
        }

        this.setCustomRenderMethod(params => {

            mapstategraphics.clear();
            mapstategraphics.beginFill(0xFFFF00);
            mapstategraphics.alpha = 0.5;

            this.tiles.map((xtiles, y) => {
                xtiles.map((cellstate, x) => {
                    if(cellstate === 0) return;

                    let color;

                    if(cellstate === 1) color = 0xFF0000;
                    else if(cellstate === 2) color = 0x00FF00;
                    else if(cellstate === 3) color = 0x0000FF;
                    else if(cellstate === 4) color = 0xFFFF00;

                    mapstategraphics.beginFill(color);

                    const rect = getRectangleForGridCell({ x, y });
                    mapstategraphics.drawRect(rect.x, rect.y, rect.width, rect.height);
                });
            });

            highlightgraphics.clear();

            if(highlightcell === null) return;

            highlightgraphics.beginFill(0xFFFFFF);
            highlightgraphics.tint = 0xFF0000;
            highlightgraphics.alpha = 0.3;
            const rect = getRectangleForGridCell(highlightcell);
            highlightgraphics.drawRect(rect.x, rect.y, rect.width, rect.height);
        });
    }
});

const MapPathBuilder = compose(GenericEntity, CustomRenderable, MapPathBuilderable);

export default MapPathBuilder;

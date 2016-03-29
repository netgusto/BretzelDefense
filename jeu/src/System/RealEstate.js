'use strict';

/* @flow */

import { Sprite, Graphics } from 'pixi.js';

export default function({ rangeslayer, backgroundlayer, buildspots, buildspotHighlightTexture, worldscale, eventbus }) {

    let currentbuildspot = null;

    const disable = function(spot) {
        if(spot.rangeviewer) {
            spot.rangeviewer.renderable = false;
        }

        lowlight(spot);
    };

    const enable = function(spot) {
        if(spot.rangeviewer) {
            spot.rangeviewer.renderable = true;
        }

        highlight(spot);
    };

    const highlight = function(spot) {
        spot.terrain.alpha = 0.6;
    };

    const lowlight = function(spot) {
        spot.terrain.alpha = 0;
    };

    eventbus.on('background.click', function(/*e*/) {
        buildspots.map(disable);
        if(currentbuildspot) {
            eventbus.emit('buildspot.blur', { spot: currentbuildspot });
            disable(currentbuildspot);
            currentbuildspot = null;
        }
    });

    eventbus.on('tower.added', function({ spot, tower }) {
        spot.tower = tower;

        // Range viewer
        let rangeviewergraphics = new Graphics();
        rangeviewergraphics.lineStyle(2 * worldscale, 0xFFFFFF);
        rangeviewergraphics.beginFill(0xFFFFFF);
        rangeviewergraphics.fillAlpha = 0.3;

        //circle.drawCircle(tower.displayobject.x, tower.displayobject.y, tower.rangeX);
        rangeviewergraphics.drawEllipse(0, 0, tower.rangeX, tower.rangeY);
        spot.rangeviewer = new Sprite(rangeviewergraphics.generateTexture());
        spot.rangeviewer.position.set(tower.displayobject.x, tower.displayobject.y);
        spot.rangeviewer.pivot.set(spot.rangeviewer.width/2, spot.rangeviewer.height/2);
        spot.rangeviewer.renderable = false;
        spot.rangeviewer.tint = 0x3498db;
        spot.rangeviewer.alpha = 0.6;

        backgroundlayer.addChild(spot.rangeviewer);

        eventbus.emit('buildspot.blur', { spot });
        disable(spot);
        currentbuildspot = null;
    });

    buildspots.map(function(spot) {

        spot.terrain = new Sprite(buildspotHighlightTexture);
        spot.terrain.pivot.set(spot.terrain.width / 2, spot.terrain.height / 2 + (15 * worldscale));
        spot.terrain.position.set(spot.x, spot.y);
        spot.terrain.scale.set(worldscale);
        spot.terrain.alpha = 0;
        spot.terrain.tint = 0xf1c40f;
        spot.terrain.interactive = true;

        spot.terrain.mouseover = function() {
            highlight(spot);
        };

        spot.terrain.mouseout = function() {
            if(currentbuildspot !== spot) {
                lowlight(spot);
            }
        };

        spot.terrain.click = function(e) {

            e.stopPropagation();    // prevent background click
            buildspots.map(disable);

            if(spot.tower === null) {

                const hasfocused = (!currentbuildspot || currentbuildspot !== spot);

                if(currentbuildspot) {
                    eventbus.emit('buildspot.blur', { spot: currentbuildspot });
                    disable(currentbuildspot);
                    currentbuildspot = null;
                }

                if(hasfocused) {
                    enable(spot);
                    currentbuildspot = spot;
                    eventbus.emit('buildspot.focus', { spot });
                }
            } else {
                if(currentbuildspot === spot) {
                    eventbus.emit('buildspot.blur', { spot });
                    disable(spot);
                    currentbuildspot = null;
                } else {
                    if(currentbuildspot) {
                        eventbus.emit('buildspot.blur', { spot: currentbuildspot });
                        disable(currentbuildspot);
                        currentbuildspot = null;
                    }

                    currentbuildspot = spot;
                    enable(spot);
                    eventbus.emit('buildspot.focus', { spot });
                }
            }
        }

        rangeslayer.addChild(spot.terrain);
    });

    return {
        process() {
        }
    };
}

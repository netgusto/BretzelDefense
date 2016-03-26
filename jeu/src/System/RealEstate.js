'use strict';

/* @flow */

import { Sprite, Graphics } from 'pixi.js';

import FireballTower from '../Entity/FireballTower';
import ArcherTower from '../Entity/ArcherTower';
import BarrackTower from '../Entity/BarrackTower';

export default function({ rangeslayer, towerslayer, backgroundlayer, buildspots, buildspotHighlightTexture, cursor, worldscale, whratio, meleeSystem, state }) {

    buildspots.map(function(spot) {

        const buildspot = new Sprite(buildspotHighlightTexture);
        buildspot.pivot.set(buildspot.width / 2, buildspot.height / 2 + (15 * worldscale));
        buildspot.position.set(spot.x, spot.y);
        buildspot.scale.set(worldscale);
        buildspot.alpha = 0;
        buildspot.tint = 0xf1c40f;

        buildspot.interactive = true;
        buildspot.mouseover = function() {
            if(spot.tower === null) {
                buildspot.alpha = 0.6;
            } else {
                spot.towerhighlight.renderable = true;
            }
        };

        buildspot.mouseout = function() {
            buildspot.alpha = 0;
            if(spot.tower !== null) {
                spot.rangeviewer.renderable = false;
                spot.towerhighlight.renderable = false;
            }
        };

        buildspot.click = function() {
            if(spot.tower === null) {
                let tower;

                if(cursor.alt) {
                    tower = BarrackTower({ worldscale })
                        .mount({
                            worldscale,
                            clickpoint: { x: spot.x, y: spot.y },
                            creepslayer: towerslayer,
                            meleeSystem
                        });
                } else if(cursor.shift) {
                    if(state.coins >= 100) {
                        tower = FireballTower({ worldscale })
                            .mount({
                                worldscale,
                                clickpoint: { x: spot.x, y: spot.y },
                                creepslayer: towerslayer
                            });
                        state.coins -= 100;
                    }
                } else {
                    if(state.coins >= 70) {
                        tower = ArcherTower({ worldscale, whratio })
                            .mount({
                                worldscale,
                                clickpoint: { x: spot.x, y: spot.y },
                                creepslayer: towerslayer
                            });
                        state.coins -= 70;
                    }
                }

                if(tower) {
                    buildspot.mouseout();
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

                    // Tower highlight

                    let towerhighlightgraphics = new Graphics();
                    towerhighlightgraphics.beginFill(0xFFFFFF);
                    towerhighlightgraphics.fillAlpha = 0.8;

                    //circle.drawCircle(tower.displayobject.x, tower.displayobject.y, tower.rangeX);
                    towerhighlightgraphics.drawEllipse(0, 0, 80 * worldscale, 80 * worldscale / (90/45));
                    spot.towerhighlight = new Sprite(towerhighlightgraphics.generateTexture());
                    spot.towerhighlight.position.set(tower.displayobject.x, tower.displayobject.y);
                    spot.towerhighlight.pivot.set(spot.towerhighlight.width/2, spot.towerhighlight.height/2);
                    spot.towerhighlight.renderable = false;
                    spot.towerhighlight.tint = 0xf1c40f;
                    spot.towerhighlight.alpha = 0.7;

                    backgroundlayer.addChild(spot.towerhighlight);
                }
            } else {
                console.log('laaa');
                spot.rangeviewer.renderable = true;
                spot.towerhighlight.renderable = true;
            }
        }

        rangeslayer.addChild(buildspot);
    });

    return {
        process() {
        }
    };
}

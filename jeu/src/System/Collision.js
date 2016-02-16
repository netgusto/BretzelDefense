'use strict';

/* @flow */

import SAT from 'sat';

import { Rectangle, Polygon, Sprite } from 'pixi.js';

export default class CollisionSystem {

    collisions: Array<Object>;

    constructor(collisions: Array<Object>) : void {
        this.collisions = collisions;
    }

    match(item: DisplayObject): boolean {
        return item.checkImplements && item.checkImplements('Collisionable');
    }

    process(entities : Array<DisplayObject>, { deltatime } : { deltatime: number }) {

        this.collisions.map(collision => {
            entities.filter(entity => entity.getCollisionGroup() === collision.what).map(hero => {

                const heroDisplayObject = hero.getDisplayObject();
                const herobounds = heroDisplayObject.getBounds();
                const heroHitArea = hero.getCollisionArea();
                let heropoly = null;
                if(heroDisplayObject instanceof Sprite) {
                    heroDisplayObject.tint = 0xFFFFFF;
                }

                entities.filter(entity => collision.with.indexOf(entity.getCollisionGroup()) > -1).map(collider => {

                    const colliderDisplayObject = collider.getDisplayObject();
                    const colliderbounds = colliderDisplayObject.getBounds();
                    const colliderHitArea = collider.getCollisionArea();

                    if(colliderDisplayObject instanceof Sprite) {
                        colliderDisplayObject.tint = 0xFFFFFF;
                    }

                    if(!aabbCollision(herobounds, colliderbounds)) return;    // Bounding boxes do not collide; no collision !

                    if(heropoly === null) {
                        if(heroHitArea) {
                            // $FlowFixMe
                            heropoly = new SAT.Polygon(
                                new SAT.Vector(0, 0),
                                transformPoints(heroHitArea.points, heroDisplayObject.worldTransform, true)
                            );
                        } else {
                            heropoly = (new SAT.Box(
                                new SAT.Vector(herobounds.x, herobounds.y),
                                herobounds.width,
                                herobounds.height
                            )).toPolygon();
                        }
                    }

                    let colliderpoly;

                    if(colliderHitArea) {
                        if(colliderHitArea instanceof Rectangle) {
                            const transformedEntityPoints = transformPoints([
                                colliderHitArea.x, colliderHitArea.y,
                                colliderHitArea.x + colliderHitArea.width, colliderHitArea.y,
                                colliderHitArea.x + colliderHitArea.width, colliderHitArea.y + colliderHitArea.height,
                                colliderHitArea.x, colliderHitArea.y + colliderHitArea.height
                            ], colliderDisplayObject.worldTransform, false);

                            const res = [];
                            let pindex;
                            for(pindex = 0; pindex < transformedEntityPoints.length; pindex+=2) {
                                res.push(new SAT.Vector(transformedEntityPoints[pindex], transformedEntityPoints[pindex+1]));
                            }

                            // $FlowFixMe
                            colliderpoly = new SAT.Polygon(
                                new SAT.Vector(0, 0), res
                            );
                        } else if(colliderHitArea instanceof Polygon) {
                            // $FlowFixMe
                            colliderpoly = new SAT.Polygon(
                                new SAT.Vector(0, 0),
                                transformPoints(colliderHitArea.points, colliderDisplayObject.worldTransform, true)
                            );
                        }
                    } else {
                        colliderpoly = (new SAT.Box(
                            new SAT.Vector(colliderbounds.x, colliderbounds.y),
                            colliderbounds.width,
                            colliderbounds.height
                        )).toPolygon();
                    }

                    if(colliderpoly && SAT.testPolygonPolygon(colliderpoly, heropoly)) {
                        if(heroDisplayObject instanceof Sprite) {
                            heroDisplayObject.tint = 0.4 * 0xFFFFFF;
                        }

                        if(colliderDisplayObject instanceof Sprite) {
                            colliderDisplayObject.tint = 0xFF00FF;
                        }
                    } else {
                        if(colliderDisplayObject instanceof Sprite) {
                            colliderDisplayObject.tint = 0x00FF00;
                        }
                    }
                });
            });
        });
    }
}


function aabbCollision(a: Rectangle, b: Rectangle) : boolean {
    return (
        (a.x < b.x + b.width) &&
        (a.x + a.width > b.x) &&
        (a.y < b.y + b.height) &&
        (a.height + a.y > b.y)
   );
}

function transformPoint(x, y, worldTransform) {
    return worldTransform.apply({ x, y });
}

function transformPoints(points, worldTransform, vector = false) {
    const res = [];
    let k;
    for(k = 0; k < points.length; k+=2) {
        let transformed = worldTransform.apply({ x: points[k], y: points[k+1] });
        if(vector) {
            res.push(new SAT.Vector(transformed.x, transformed.y));
        } else {
            res.push(transformed.x);
            res.push(transformed.y);
        }
    }

    return res;
}

function contains(x, y, item) {
    if(!item.worldVisible) return false;
    if(!item.hitArea) return false;

    const transformedPoint = transformPoint(x, y, item.worldTransform);
    return item.hitArea.contains(transformedPoint[0], transformedPoint[1]);
}

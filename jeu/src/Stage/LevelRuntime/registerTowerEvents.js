'use strict';

import eventbus from '../../Singleton/eventbus';

export default function({ towermenu, worldscale, state, towerCosts, economy, towerBuilders, spatialhash, pathtexture }) {
    eventbus.on('buildspot.focus', function({ spot }) {
        if(spot.tower) {
            towermenu.setPosition(spot.x, spot.y - 20 * worldscale);
        } else {
            towermenu.setPosition(spot.x, spot.y);
        }

        towermenu.enable(spot);
    });

    eventbus.on('buildspot.blur', function() {
        towermenu.disable();
    });

    eventbus.on('tower.add', function({ spot, type }) {
        if(spot.tower !== null) {
            return;
        }

        const towerbuilder = towerBuilders[type];
        if(!towerbuilder) {
            return;
        }

        const cost = towerCosts[type];
        if(typeof cost !== 'number' || state.coins < cost) {
            return;
        }

        state.coins -= cost;

        const tower = towerbuilder({ spot }).addCost(cost);
        eventbus.emit('tower.added', { spot, tower });
    });

    eventbus.on('tower.sell', function({ spot }) {
        if(!spot.tower) {
            return;
        }

        state.coins += (spot.tower.getTotalCost() * economy.towerSellRefundRate)|0;
        spot.tower.unmount();
        eventbus.emit('tower.sold', { spot });
    });

    eventbus.on('tower.redeploy', function({ spot }) {
        if(!spot.tower || !spot.tower.setDeployPoint) {
            return;
        }

        towermenu.disable();

        eventbus.once('background.click.preemption', function(e) {
            if(spot.current === false) {
                return;
            }

            e.stopPropagation();

            const rangecenter = spot.tower.getRangeCenterPoint();

            if(spatialhash.iswithinrange(
                rangecenter.x,
                rangecenter.y,
                e.data.global.x,
                e.data.global.y,
                spot.tower.rangeX,
                spot.tower.rangeY
            ) === false) {
                return;
            }

            const pixel = pathtexture.getPixel(e.data.global.x, e.data.global.y);
            if(pixel[0] === 255) {
                spot.tower.setDeployPoint({ x: e.data.global.x, y: e.data.global.y });
            }

            eventbus.emit('tower.redeployed', { spot });
        });
    });
}

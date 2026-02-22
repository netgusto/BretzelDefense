'use strict';

import eventbus from '../../Singleton/eventbus';
import EVENTS from '../../Singleton/events';

export default function({ towermenu, worldscale, state, towerCosts, economy, towerBuilders, spatialhash, pathtexture }) {
    const listeners = [];
    const pendingpreemptions = [];

    const on = function(name, handler) {
        eventbus.on(name, handler);
        listeners.push({ name, handler });
    };

    const onBuildspotFocus = function({ spot }) {
        if(spot.tower) {
            towermenu.setPosition(spot.x, spot.y - 20 * worldscale);
        } else {
            towermenu.setPosition(spot.x, spot.y);
        }

        towermenu.enable(spot);
    };

    const onBuildspotBlur = function() {
        towermenu.disable();
    };

    const onTowerAdd = function({ spot, type }) {
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
        eventbus.emit(EVENTS.TOWER_ADDED, { spot, tower });
    };

    const onTowerSell = function({ spot }) {
        if(!spot.tower) {
            return;
        }

        state.coins += (spot.tower.getTotalCost() * economy.towerSellRefundRate)|0;
        spot.tower.unmount();
        eventbus.emit(EVENTS.TOWER_SOLD, { spot });
    };

    const onTowerRedeploy = function({ spot }) {
        if(!spot.tower || !spot.tower.setDeployPoint) {
            return;
        }

        towermenu.disable();

        const onBackgroundClickPreemption = function(e) {
            const pendingindex = pendingpreemptions.indexOf(onBackgroundClickPreemption);
            if(pendingindex !== -1) {
                pendingpreemptions.splice(pendingindex, 1);
            }

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

            eventbus.emit(EVENTS.TOWER_REDEPLOYED, { spot });
        };

        pendingpreemptions.push(onBackgroundClickPreemption);
        eventbus.once(EVENTS.BACKGROUND_CLICK_PREEMPTION, onBackgroundClickPreemption);
    };

    on(EVENTS.BUILDSPOT_FOCUS, onBuildspotFocus);
    on(EVENTS.BUILDSPOT_BLUR, onBuildspotBlur);
    on(EVENTS.TOWER_ADD, onTowerAdd);
    on(EVENTS.TOWER_SELL, onTowerSell);
    on(EVENTS.TOWER_REDEPLOY, onTowerRedeploy);

    return {
        dispose() {
            for(let i = 0; i < listeners.length; i++) {
                eventbus.off(listeners[i].name, listeners[i].handler);
            }
            listeners.length = 0;

            while(pendingpreemptions.length) {
                const preemptionhandler = pendingpreemptions.pop();
                eventbus.off(EVENTS.BACKGROUND_CLICK_PREEMPTION, preemptionhandler);
            }
        }
    };
}

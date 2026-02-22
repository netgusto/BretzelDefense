'use strict';

const EVENTS = {
    GAME_FOCUS: 'game.focus',
    GAME_BLUR: 'game.blur',
    GAME_PAUSE: 'game.pause',
    GAME_RESUME: 'game.resume',
    GAME_PAUSE_TOGGLE: 'game.pausetoggle',
    GAME_FULLSCREEN_TOGGLE: 'game.fullscreentoggle',
    GAME_OVER: 'game.over',
    GAME_WIN: 'game.win',

    BACKGROUND_CLICK: 'background.click',
    BACKGROUND_CLICK_PREEMPTION: 'background.click.preemption',

    BUILDSPOT_FOCUS: 'buildspot.focus',
    BUILDSPOT_BLUR: 'buildspot.blur',

    TOWER_ADD: 'tower.add',
    TOWER_ADDED: 'tower.added',
    TOWER_SELL: 'tower.sell',
    TOWER_SOLD: 'tower.sold',
    TOWER_REDEPLOY: 'tower.redeploy',
    TOWER_REDEPLOYED: 'tower.redeployed',

    ENTITY_DEATH_BATCH: 'entity.death.batch',
    ENTITY_UNTRACK_BATCH: 'entity.untrack.batch',
    ENTITY_REMOVE_BATCH: 'entity.remove.batch',
    ENTITY_DESPAWN_BATCH: 'entity.despawn.batch',

    CREEP_SUCCEEDED: 'creep.succeeded',
    LIFE_DECREASE: 'life.decrease'
};

export default EVENTS;

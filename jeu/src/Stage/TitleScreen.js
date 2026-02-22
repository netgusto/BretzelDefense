'use strict';

import { Container, Graphics, Text } from 'pixi.js';
import screenfull from 'screenfull';

import { GameStage, GameLayer } from '../Utils/bobo';

import levels, { defaultLevel } from './levels';
import GenericEntity from '../Entity/Generic';
import isportrait from '../Utils/isportrait';

export default function({ world, canvas, swapstage, renderer }) {
    const stage = new GameStage(canvas);
    const layer = new GameLayer(stage);
    stage.addLayer(layer);
    let hasstarted = false;

    const titletext = new Text('Bretzel Defense', { font: '56px Arial', fill: 'white' });
    const subtitle = new Text('Select a level', { font: '30px Arial', fill: '#ffd5d5' });
    const orientation = new Text(isportrait() ? 'portrait mode' : 'landscape mode', { font: '22px Arial', fill: '#a5b0c8' });
    titletext.anchor.set(0.5);
    subtitle.anchor.set(0.5);
    orientation.anchor.set(0.5);
    titletext.position.set(0, -48);
    subtitle.position.set(0, 14);
    orientation.position.set(0, 138);

    const g = new Graphics();
    g.lineStyle(2, 0xFF2B2B, 0.85);
    g.beginFill(0x201820, 0.88);
    g.drawRoundedRect(-280, -112, 560, 224, 18);
    g.endFill();

    const container = new Container();
    container.addChild(g);
    container.addChild(titletext);
    container.addChild(subtitle);

    const levelscontainer = new Container();
    levelscontainer.position.set(0, 80);
    container.addChild(levelscontainer);

    const spacing = 190;
    const startx = ((levels.length - 1) * spacing) / -2;

    levels.map(function(level, index) {
        const button = new Graphics();
        button.beginFill(0x2A3348, 0.95);
        button.lineStyle(2, 0x7E90C7, 1);
        button.drawRoundedRect(-76, -24, 152, 48, 10);
        button.endFill();

        const label = new Text(level.label, { font: '24px Arial', fill: '#f0f4ff' });
        label.anchor.set(0.5);
        button.addChild(label);

        button.position.set(startx + (index * spacing), 0);
        button.interactive = true;
        button.click = button.tap = function(e) {
            e.stopPropagation();
            startgame(level.stage);
        };

        levelscontainer.addChild(button);
    });

    container.addChild(orientation);
    const title = GenericEntity({ displayobject: container });

    title.displayobject.position.set(world.resolution.width / 2, world.resolution.height / 2);
    title.displayobject.interactive = true;
    layer.container.interactive = true;
    const startgame = function(stagefactory = defaultLevel.stage) {
        if(hasstarted) {
            return;
        }
        hasstarted = true;

        renderer.view.style.width = world.resolution.effectivewidth + 'px';
        renderer.view.style.height = world.resolution.effectiveheight + 'px';

        if(screenfull.enabled) {
            try {
                const fullscreenrequest = screenfull.request();
                if(fullscreenrequest && fullscreenrequest.catch) {
                    fullscreenrequest.catch(function() {});
                }
            } catch(e) {
            }
        }

        swapstage(stagefactory);
    };

    title.displayobject.click = title.displayobject.tap = layer.container.click = layer.container.tap = function() {
        startgame(defaultLevel.stage);
    };

    layer.addEntity(title);

    return Promise.resolve(stage)/*.then(function() {
        title.displayobject.click();
    })*/;
}

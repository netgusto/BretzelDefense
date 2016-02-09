'use strict';

/* @flow */

import { loadspritesheet } from 'bobo';

import Mummy from './Mummy';

export default class MummyFactory {

    frames: Array<Texture>;

    constructor(texture: BaseTexture) {
        this.frames = loadspritesheet(texture, 37, 45, 18);
    }

    spawn() : Mummy {
        const mummy = new Mummy(this.frames);

        mummy.position.set(100, 200);
        mummy.play();

        return mummy;
    }
}

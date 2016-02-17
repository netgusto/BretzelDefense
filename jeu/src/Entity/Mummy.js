'use strict';

/* @flow */

import stampit from 'stampit';

import Entity from '../Component/Entity';
import Walkable from '../Component/Walkable';

let Mummy = stampit().compose(Entity, Walkable).init(function() {

    const displayobject = this.getDisplayObject();
    displayobject.play();
    displayobject.pivot.set(displayobject.width/2, displayobject.height/2);    // pas d'utilisation de la propriété anchor, car cause problème dans le calcul des déplacements de hitArea

    this.doStop();
    //this.hitArea = new Rectangle(10, 10, 20, 20);
});

export default Mummy;

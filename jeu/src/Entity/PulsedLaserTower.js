'use strict';

import compose from 'compose-js';
import LaserTower from './LaserTower';

const PulsedLaserTower = compose(LaserTower).compose({
    init: function() {
        this.firerate = 700;
        this.firedamage = 6;
        this.target = null;
        this.lastfire = null;
        this.lastfiredtarget = null;
        this.beamduration = 250;
    },
    methods: {
        engage(target, distance, centerx, centery, lasers) {
            this.target = target;

            const now = performance.now();
            //const diff = now - this.targetsince;
            if(this.lastfire === null || now - this.lastfire >= this.firerate) {
                target.life -= this.firedamage;
                if(target.life < 0) target.life = 0;
                this.lastfire = now;
                this.lastfiredtarget = target.id;
            }

            if(target.id === this.lastfiredtarget && now - this.lastfire <= this.beamduration) {
                lasers.moveTo(this.displayobject.x, this.displayobject.y - this.displayobject.height);
                lasers.lineTo(centerx, centery);
            }
        }
    }
});

export default PulsedLaserTower;

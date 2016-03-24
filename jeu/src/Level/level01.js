'use strict';

import { curveToLane } from '../Utils/lane';
//import creepsautospawn from '../Utils/creepsautospawn';
import { Graphics } from 'pixi.js';

import Background from '../Entity/Background';
import Mummy from '../Entity/Mummy';
import FireballTower from '../Entity/FireballTower';
//import ArcherPinTower from '../Entity/ArcherPinTower';
import ArcherTower from '../Entity/ArcherTower';
import BarrackTower from '../Entity/BarrackTower';

export default function({ resolution, state }) {

    Background.setTexturePath('/assets/sprites/level-' + resolution.width + '-' + resolution.height + '.jpg');

    return {
        loadAssets(loader) {
            Background.loadAssets(loader);
            Mummy.loadAssets(loader);
            FireballTower.loadAssets(loader);
            //ArcherPinTower.loadAssets(loader);
            ArcherTower.loadAssets(loader);
            BarrackTower.loadAssets(loader);
        },

        init() {
            console.log('level init');
            this.lanes = [
                { name: 'red',      width: 2048, height: 1536, color: 0xFF0000, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M849.785463,1609.33256 C849.785463,1609.33256 824.518578,1222.63558 874.98358,1150.3126 C925.448581,1077.98961 1010.21881,1080.7982 1093.81234,1080.7982 C1196.92576,1080.7982 1268.50285,974.359992 1225.82594,903.722092 C1183.14903,833.084192 1063.51958,818.921084 966.97361,847.894996 C918.190631,862.535003 811.767647,929.738386 625.088409,877.261521 C547.918818,855.568598 485.131987,779.784834 485.131987,699.706817 C485.131987,619.628801 521.333161,570.972113 625.088414,525.760228 C728.843667,480.548343 861.917457,543.752143 944.033402,494.94072 C1026.14935,446.129297 1016.49876,323.355616 1034.29848,275.432611 C1052.09819,227.509607 1125.01623,158.854929 1225.82594,158.85493 C1326.63564,158.85493 1376.43011,182.498321 1406.92917,239.54051 C1437.42823,296.582699 1427.68029,402.373258 1476.54638,470.116591 C1525.41246,537.859923 1645.34564,508.559325 1738.55632,508.559314 C1831.767,508.559303 2049.73042,480.473832 2181.7211,393.448956 C2313.71178,306.424081 2373.2371,361.935898 2373.2371,361.935898' },
                { name: 'yellow',   width: 2048, height: 1536, color: 0xFFFF00, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M893.797638,1638.67902 C893.797638,1638.67902 868.530753,1251.98205 918.995754,1179.65906 C969.460756,1107.33608 1073.43463,1129.11884 1154.19729,1112.615 C1225.38469,1098.06787 1299.21393,989.720953 1281.03029,920.748165 C1262.84666,851.775378 1207.76266,829.714986 1165.23472,809.200078 C1056.09828,756.554127 918.995762,844.742544 757.617787,855.971005 C676.069004,861.645059 586.99939,808.135072 554.995584,750.501419 C523.66663,694.083067 548.151387,633.971659 584.147919,597.802368 C653.495752,528.121712 889.54542,581.335105 971.661365,532.523682 C1053.77731,483.712259 1060.51094,352.702079 1078.31065,304.779075 C1096.11036,256.85607 1124.57497,202.817307 1225.38468,202.817308 C1272.22612,202.817308 1360.95705,221.823731 1379.20376,304.779077 C1397.45048,387.734422 1427.60797,499.111974 1478.93147,532.523682 C1550.62671,579.197437 1720.19005,549.363508 1781.77189,549.363508 C1925.69973,549.363508 2093.74259,509.820296 2225.73327,422.79542 C2357.72395,335.770545 2417.24927,391.282361 2417.24927,391.282361' },
                { name: 'blue',     width: 2048, height: 1536, color: 0x0000FF, offsetx: resolution.offsetx, offsety: resolution.offsety, path: 'M947.185318,1615.31075 C947.185318,1615.31075 933.100278,1263.32563 976.658575,1200.90086 C1020.21687,1138.47609 1198.53437,1151.85049 1244.61707,1111.50305 C1347.95977,1021.02194 1337.19011,955.041572 1321.49511,895.508487 C1305.80012,835.975403 1279.38555,808.805216 1198.36418,768.464665 C1105.10066,722.028749 959.076703,790.951645 821.344481,808.805227 C725.485455,821.230983 633.359386,804.746667 605.735661,755.000829 C578.694428,706.303964 583.842179,669.17308 612.876177,636.950093 C676.796986,566.008456 938.383376,602.717268 1009.26083,560.586238 C1080.13828,518.455209 1094.44325,398.7663 1109.80687,357.402099 C1125.17049,316.037898 1138.07944,245.042972 1225.0922,245.042972 C1265.52286,245.042972 1332.21028,261.448151 1347.95973,333.050122 C1363.70917,404.652094 1384.87665,531.747299 1429.17595,560.586238 C1491.05889,600.872165 1658.90938,585.969882 1712.06305,585.969882 C1776.5347,585.969882 1937.76607,572.55721 2067.86252,540.806034 C2188.44746,511.376223 2279.71828,464.893012 2305.25319,430.54472' }
            ].map(curveToLane(resolution.width, resolution.height));

            const before = performance.now();
            const promises = this.lanes.map(lane => lane.memoizeAllAsync());
            return Promise.all(promises).then(() => console.log('Lanes async memoization took ' + (performance.now() - before) + ' ms'));
        },

        waves({ layer, spatialhash }) {

            // const wavesprops = [
            //     { number: 9, frequency: 400, vps: 20, delay: 0 },
            //     { number: 15, frequency: 400, vps: 23, delay: 20000 },
            //     { number: 25, frequency: 400, vps: 30, delay: 30000 },
            //     { number: 40, frequency: 400, vps: 35, delay: 50000 },
            //     { number: 70, frequency: 400, vps: 38, delay: 75000 }
            // ];

            const wavesprops = [
                { number: 300, frequency: 10, vps: 50, delay: 0 }
            ];

            // Vagues de creeps
            let mummyindex = 0;
            const lanes = this.lanes;

            const spawn = function({ vps, frequency, number }) {
                let count = 0;
                let interval = window.setInterval(function() {
                    if(count >= number) return;
                    const mummy = Mummy({
                        worldscale: resolution.worldscale
                    })
                        .setVelocityPerSecond((vps + Math.floor(Math.random() * 50)) * resolution.worldscale);
                    layer.addEntity(mummy);
                    mummy.creep = true;
                    mummy.lane = lanes[mummyindex % lanes.length];
                    mummy.prevpos = { x: 0, y: 0 };
                    mummy.pixelswalked = 0;

                    mummyindex++;

                    const trackpoint = mummy.getSpatialTrackPoint();
                    spatialhash.insert(
                        trackpoint.x,
                        trackpoint.y,
                        mummy.id,
                        mummy
                    );

                    count++;

                    if(count === number) window.clearInterval(interval);
                }, frequency);
            };

            wavesprops.map(waveprops => {
                window.setTimeout(function() {
                    spawn(waveprops)
                }, waveprops.delay);
            });
        },

        setup({ cursor, spatialhash, creepslayer, backgroundlayer, meleeSystem }) {

            //creepsautospawn({ layer: creepslayer, resolution, spatialhash, lanes: this.lanes, vps: 20, frequency: 50 });
            this.waves({ layer: creepslayer, resolution, spatialhash });

            backgroundlayer.addEntity(Background({
                viewwidth: resolution.width,
                viewheight: resolution.height,
                onclick(event) {

                    const clickpoint = event.data.global;

                    let tower;
                    if(cursor.alt) {
                        BarrackTower({ worldscale: resolution.worldscale })
                            .mount({
                                worldscale: resolution.worldscale,
                                clickpoint,
                                creepslayer,
                                meleeSystem
                            });
                    } else if(cursor.shift) {
                        if(state.coins >= 100) {
                            tower = FireballTower({ worldscale: resolution.worldscale });
                            state.coins -= 100;
                        }
                    } else {
                        if(state.coins >= 70) {
                            tower = ArcherTower({ worldscale: resolution.worldscale });
                            state.coins -= 70;
                        }
                    }

                    if(tower) {
                        tower.setPosition(clickpoint.x, clickpoint.y);
                        creepslayer.addEntity(tower);

                        // let circle = new Graphics();
                        // circle.lineStyle(1, 0xFFFF00);
                        // backgroundlayer.addChild(circle);
                        // circle.drawCircle(tower.displayobject.x, tower.displayobject.y, tower.range);
                    }
                }
            }));

            return Promise.resolve();
        }
    }
}

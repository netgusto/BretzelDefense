'use strict';

import stampit from 'stampit';

const AssetLoader = stampit()
    .init(function({ instance, stamp }) {
        /*if (!stamp.fixed.methods.loadAssets) { // Avoid adding the same method to the prototype twice.

            let assetHandlers = [];

            stamp.fixed.methods.loadAssets = (loader) => {
                assetHandlers.map(cbk => cbk(loader));
            };

            stamp.fixed.methods.addAssetHandler = (cbk) => {
                assetHandlers.push(cbk);
            };

            console.log(',', instance, stamp);
        }*/

        console.log(stamp);

        stamp.fixed.static.assetHandlers = [];
        stamp.fixed.static.loadAssets = function() {
            this.assetHandlers.map(cbk => cbk(loader));
            return this;
        };

        stamp.fixed.static.addAssetHandler = function(cbk) {
            this.assetHandlers.push(cbk);
            return this;
        };

        stamp.fixed.methods.addAssetHandler = function() { console.log('YO!'); }
        stamp.fixed.addAssetHandler = function() { console.log('YO!'); }
        stamp.addAssetHandler = function() { console.log('YO!'); }

        this.declareImplements('AssetLoader');
    });

export default AssetLoader;

'use strict';

import compose from 'compose-js';

const AssetLoader = compose({
    assetHandlers: [],
    loadAssets(loader) {
        this.assetHandlers.map(cbk => cbk(loader));
        return this;
    },
    addAssetHandler(cbk) {
        this.assetHandlers.push(cbk);
        return this;
    },
    declareAssets() {
        return {};
    }
});

export default AssetLoader;

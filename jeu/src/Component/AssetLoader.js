'use strict';

import compose from 'compose-js';

export default compose({
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

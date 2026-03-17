import SpaceLevel from './SpaceLevel.js';
import { fetchJSON } from './utils.js';

class LevelSpaceLoader {
    constructor() {
        this.cache = new Map();
        this.activeSpaces = new Set();
    }

    async load(spaceDef) {
        const space = await this._fetchSpace(spaceDef);
        this.activeSpaces.add(space.id);
        return space;
    }

    preload(spaceDef) {
        return this._fetchSpace(spaceDef);
    }

    unload(spaceId) {
        this.activeSpaces.delete(spaceId);
        // for (const [path, space] of this.cache) {
        //     if (space.id === spaceId) { this.cache.delete(path); break; }
        // }
    }

    async _fetchSpace(spaceDef) {
        const { path, worldX, worldY } = spaceDef;
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }
        const data = await fetchJSON(path);
        const space = await new SpaceLevel(data, worldX, worldY).init();
        this.cache.set(path, space);
        return space;
    }
}

export default LevelSpaceLoader;

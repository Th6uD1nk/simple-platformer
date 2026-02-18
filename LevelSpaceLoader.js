class LevelSpaceLoader {
    constructor() {
        this.cache = new Map();
        this.activeSpaces = new Set();
    }

    load(space) {}
    preload(spaceId) {}
    unload(spaceId) {}
}

export default LevelSpaceLoader;


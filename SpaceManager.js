import LevelSpaceLoader from './LevelSpaceLoader.js';

/**
 * SpaceManager
 * Orchestrates the lifecycle of spaces (activation, preload, unload).
 *
 * Possible future responsibilities:
 * - Manage adjacent/visible spaces for seamless rendering across boundaries
 * - Activate/deactivate space-specific systems (enemies, items, events) on transition
 * - Handle transition effects between spaces (fades, delays, animations)
 * - Track space-local state (entities, triggers, runtime mutations) independently of the level
 */
 
class SpaceManager {
    constructor(canvas, cameraMovement, zoneTrigger) {
        this.canvas         = canvas;
        this.cameraMovement = cameraMovement;
        this.zoneTrigger    = zoneTrigger;
        this.spaceLoader    = new LevelSpaceLoader();

        this.activeSpaceIndex = 0;
        this.activeSpace      = null;
    }

    async activate(spaceIndex, levelDef, player) {
        const spaceDef = levelDef.spaces[spaceIndex];
        this.activeSpaceIndex = spaceIndex;

        this.activeSpace = await this.spaceLoader.load(spaceDef);

        const spaceZones = levelDef.zones.filter(z => z.spaceIndex === spaceIndex);
        this.zoneTrigger.registerZones(spaceZones);

        this.zoneTrigger.setContext(
            this.activeSpace.bounds,
            this.canvas.width,
            this.canvas.height,
            player,
            levelDef.camHeightMotion
        );

        this.cameraMovement.setSpaceLevel(
            this.activeSpace.bounds,
            levelDef.startPosition,
            player,
            levelDef.camHeightMotion
        );

        const nextDef = levelDef.spaces[spaceIndex + 1];
        if (nextDef) {
            this.spaceLoader.preload(nextDef).then(space => {
                console.log(`[SpaceManager] pre-load : ${space.id}`);
            });
        }
    }

    unload(spaceId) {
        this.spaceLoader.unload(spaceId);
    }

    preload(spaceDef) {
        this.spaceLoader.preload(spaceDef);
    }

    get cache() {
        return this.spaceLoader.cache;
    }
}

export default SpaceManager;


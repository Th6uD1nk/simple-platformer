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
import LevelSpaceLoader from './LevelSpaceLoader.js';

class SpaceManager {
    constructor(canvas, cameraMovement, zoneTrigger, eventManager, gravityUnit, collisionUnit) {
        this.canvas         = canvas;
        this.cameraMovement = cameraMovement;
        this.zoneTrigger    = zoneTrigger;
        this.eventManager   = eventManager;
        this.gravityUnit    = gravityUnit;
        this.collisionUnit  = collisionUnit;
        this.spaceLoader    = new LevelSpaceLoader();
        this.activeSpaceIndex = 0;
        this.activeSpace      = null;
        this._registeredBlocks = [];
    }

    async activate(spaceIndex, levelDef, player) {
        for (const block of this._registeredBlocks) {
            this.gravityUnit.unregister(block);
            this.collisionUnit.unregister(block);
        }
        this._registeredBlocks = [];

        const spaceDef        = levelDef.spaces[spaceIndex];
        this.activeSpaceIndex = spaceIndex;
        this.activeSpace      = await this.spaceLoader.load(spaceDef);

        this.eventManager.emit('space:activated', { space: this.activeSpace });

        for (const { block } of this.activeSpace.registeredBlocks) {
            for (const entry of block.registerIn) {
                if (entry.unit === 'gravity') {
                    this.gravityUnit.register(block);
                }
                if (entry.unit === 'collision') {
                    entry.type === 'static'
                        ? this.collisionUnit.registerStatic(block)
                        : this.collisionUnit.registerDynamic(block);
                }
            }
            this._registeredBlocks.push(block);
        }

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

    unload(spaceId)    { this.spaceLoader.unload(spaceId); }
    preload(spaceDef)  { this.spaceLoader.preload(spaceDef); }
    get cache()        { return this.spaceLoader.cache; }
}

export default SpaceManager;

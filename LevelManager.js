import PlayerCameraMovement from './PlayerCameraMovement.js';
import CameraZoneTrigger from './CameraZoneTrigger.js';
import LevelSpaceLoader from './LevelSpaceLoader.js';
import ResourceManager from './ResourceManager.js';

class LevelManager {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.currentLevel = 0;
        this.levelDef = null;
        this.activeSpaceIndex = 0;

        this.resources = new ResourceManager();
        this.cameraMovement = new PlayerCameraMovement(canvas);
        this.zoneTrigger = new CameraZoneTrigger();
        this.spaceLoader = new LevelSpaceLoader();

        this.zoneTrigger.on('cameraScrollStart', () => this.cameraMovement.onScrollStart());
        this.zoneTrigger.on('cameraScrollEnd',   () => this.cameraMovement.onScrollEnd());
        this.zoneTrigger.on('zoneEnter', (zoneData) => this.onZoneEnter(zoneData));
        this.zoneTrigger.on('zoneExit',  (zoneData) => this.onZoneExit(zoneData));
    }

    init() {
        this.loadLevel(this.currentLevel);
    }

    loadLevel(levelIndex) {
        this.levelDef = this.resources.getLevelDefinition(levelIndex);
        this.activeSpaceIndex = 0;
        this._activateSpace(0);
    }

    _activateSpace(spaceIndex) {
        const space = this.levelDef.spaces[spaceIndex];
        this.activeSpaceIndex = spaceIndex;

        this.spaceLoader.load(space);
        this.zoneTrigger.registerZones(this.levelDef.zones.filter(z => {
            return z.x >= space.bounds.x && z.x < space.bounds.x + space.bounds.width;
        }));
        this.zoneTrigger.setContext(space.bounds, this.canvas.width, this.canvas.height);
        this.cameraMovement.setSpaceLevel(space.bounds, this.levelDef.startPosition);
    }

    update(player, deltaTime) {
        this.zoneTrigger.check(player);
        this.cameraMovement.update(player);
    }

    render(player) {
        const { x: ox, y: oy } = this.cameraMovement.getOffset();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const space of this.levelDef.spaces) {
            const sx = space.bounds.x - ox;
            const sy = space.bounds.y - oy;
            this.ctx.fillStyle = space.color;
            this.ctx.fillRect(sx, sy, space.bounds.width, space.bounds.height);

            const dotCount = 20;
            const step = space.bounds.width / dotCount;
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            for (let i = 0; i <= dotCount; i++) {
                const dx = space.bounds.x + i * step - ox;
                const dy = space.bounds.y + space.bounds.height - 10 - oy;
                this.ctx.beginPath();
                this.ctx.arc(dx, dy, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        player.render(this.ctx, ox, oy);
    }

    onZoneEnter(zoneData) {
        if (zoneData.type === 'spaceTransition') {
            this._activateSpace(zoneData.targetSpaceIndex);
        }
        if (zoneData.type === 'load') this.spaceLoader.preload(zoneData.targetSpaceId);
    }

    onZoneExit(zoneData) {
        if (zoneData.type === 'unload') this.spaceLoader.unload(zoneData.targetSpaceId);
    }

    nextLevel() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }
}

export default LevelManager;


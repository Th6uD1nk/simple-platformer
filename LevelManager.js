import PlayerCameraMovement from './PlayerCameraMovement.js';
import CameraZoneTrigger from './CameraZoneTrigger.js';
import LevelSpaceLoader from './LevelSpaceLoader.js';

const LEVELS_BASE_PATH = '/data/levels';

class LevelManager {
    constructor(ctx, canvas) {
        this.ctx    = ctx;
        this.canvas = canvas;

        this.currentLevel    = 0;
        this.levelDef        = null;
        this.activeSpaceIndex = 0;
        this.activeSpace     = null;

        this.cameraMovement = new PlayerCameraMovement(canvas);
        this.zoneTrigger    = new CameraZoneTrigger();
        this.spaceLoader    = new LevelSpaceLoader();

        this.zoneTrigger.on('cameraScrollStart', () => this.cameraMovement.onScrollStart());
        this.zoneTrigger.on('cameraScrollEnd',   () => this.cameraMovement.onScrollEnd());
        this.zoneTrigger.on('zoneEnter', (zoneData) => this.onZoneEnter(zoneData));
        this.zoneTrigger.on('zoneExit',  (zoneData) => this.onZoneExit(zoneData));
    }

    async init() {
        await this.loadLevel(this.currentLevel);
    }

    async loadLevel(levelIndex) {
        const path = `${LEVELS_BASE_PATH}/level_${levelIndex}.json`;
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`LevelManager: can't load "${path}" (${response.status})`);
        }

        this.levelDef = await response.json();
        this.currentLevel = levelIndex;
        this.activeSpaceIndex = 0;

        await this._activateSpace(0);
    }

    async _activateSpace(spaceIndex) {
        const spaceDef = this.levelDef.spaces[spaceIndex];
        this.activeSpaceIndex = spaceIndex;

        this.activeSpace = await this.spaceLoader.load(spaceDef);

        const spaceZones = this.levelDef.zones.filter(z =>
            z.x >= this.activeSpace.bounds.x &&
            z.x  < this.activeSpace.bounds.x + this.activeSpace.bounds.width
        );
        this.zoneTrigger.registerZones(spaceZones);
        this.zoneTrigger.setContext(this.activeSpace.bounds, this.canvas.width, this.canvas.height, this.player);

        this.cameraMovement.setSpaceLevel(this.activeSpace.bounds, this.levelDef.startPosition, this.player);

        const nextDef = this.levelDef.spaces[spaceIndex + 1];
        if (nextDef) {
            this.spaceLoader.preload(nextDef).then(space => {
                console.log(`[LevelSpaceLoader] pre-load : ${space.id}`);
            });
        }
    }

    update(player, deltaTime) {
      this.player = player;
      this.zoneTrigger.check(player);
      this.cameraMovement.update(player);
    }

    render(player) {
        const { x: ox, y: oy } = this.cameraMovement.getOffset();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const spaceDef of this.levelDef.spaces) {
            const space = this.spaceLoader.cache.get(spaceDef.path);
            if (!space) continue;

            const sx = space.bounds.x - ox;
            const sy = space.bounds.y - oy;

            this.ctx.fillStyle = space.color;
            this.ctx.fillRect(sx, sy, space.bounds.width, space.bounds.height);

            this._renderGrid(space, ox, oy);

            // todo: to be replaced, temporary
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

    _renderGrid(space, ox, oy) {
        for (let row = 0; row < space.rows; row++) {
            for (let col = 0; col < space.cols; col++) {
                const block = space.getBlockAt(col, row);
                if (!block) continue;

                const bx = space.bounds.x + col * space.tileSize - ox;
                const by = space.bounds.y + row * space.tileSize - oy;

                this.ctx.fillStyle = block.color ?? '#ffffff';
                this.ctx.fillRect(bx, by, space.tileSize, space.tileSize);
            }
        }
    }

    onZoneEnter(zoneData) {
        if (zoneData.type === 'spaceTransition') {
            this._activateSpace(zoneData.targetSpaceIndex).catch(err => console.error(err));
        }
        if (zoneData.type === 'load') {
            const targetDef = this.levelDef.spaces[zoneData.targetSpaceIndex];
            if (targetDef) this.spaceLoader.preload(targetDef);
        }
    }

    onZoneExit(zoneData) {
        if (zoneData.type === 'unload') {
            this.spaceLoader.unload(zoneData.targetSpaceId);
        }
    }

    async nextLevel() {
        this.currentLevel++;
        await this.loadLevel(this.currentLevel);
    }
}

export default LevelManager;

import PlayerCameraMovement from './PlayerCameraMovement.js';
import CameraZoneTrigger from './CameraZoneTrigger.js';
import SpaceManager from './SpaceManager.js';

const LEVELS_BASE_PATH = '/data/levels';

class LevelManager {
    constructor(ctx, canvas) {
        this.ctx    = ctx;
        this.canvas = canvas;

        this.currentLevel = 0;
        this.levelDef     = null;
        this.player       = null;

        this.cameraMovement = new PlayerCameraMovement(canvas);
        this.zoneTrigger    = new CameraZoneTrigger();
        this.spaceManager   = new SpaceManager(canvas, this.cameraMovement, this.zoneTrigger);

        this.zoneTrigger.on('cameraScrollStart', () => this.cameraMovement.onScrollStart());
        this.zoneTrigger.on('cameraScrollEnd',   () => this.cameraMovement.onScrollEnd());
        this.zoneTrigger.on('zoneEnter', (zoneData) => this.onZoneEnter(zoneData));
        this.zoneTrigger.on('zoneExit',  (zoneData) => this.onZoneExit(zoneData));
        
        this.zoneTrigger.on('cameraScrollStartY', () => this.cameraMovement.onScrollStartY());
        this.zoneTrigger.on('cameraScrollEndY',   () => this.cameraMovement.onScrollEndY());
    }

    async init() {
        await this.loadLevel(this.currentLevel);
    }

    async loadLevel(levelIndex) {
        const path = `${LEVELS_BASE_PATH}/level_${levelIndex}.json`;
        const response = await fetch(path);
        if (!response.ok) throw new Error(`LevelManager: can't load "${path}" (${response.status})`);

        this.levelDef     = await response.json();
        this.currentLevel = levelIndex;

        let cursor = 0;
        this.levelDef.spaces = this.levelDef.spaces.map(s => {
            const width  = s.cols * s.tileSize;
            const height = s.rows * s.tileSize;
            const entry  = { ...s, worldX: cursor, worldY: 0, width, height };
            cursor += width;
            return entry;
        });

        const ts = this.levelDef.spaces[0].tileSize;
        this.levelDef.startPosition = {
            x: this.levelDef.startPosition.col * ts,
            y: this.levelDef.startPosition.row * ts
        };

        this.levelDef.zones = this.levelDef.zones.map(z => {
            const space       = this.levelDef.spaces[z.spaceIndex];
            const targetSpace = this.levelDef.spaces[z.targetSpaceIndex];
            const ts          = space.tileSize;
            return {
                ...z,
                x:      space.worldX + z.colRel * ts,
                y:      z.row * ts,
                width:  z.wCols * ts,
                height: z.hRows * ts,
                spawnX: targetSpace.worldX + z.spawnCol * ts
            };
        });

        await this.spaceManager.activate(0, this.levelDef, this.player);
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
            const space = this.spaceManager.cache.get(spaceDef.path);
            if (!space) continue;

            const sx = space.bounds.x - ox;
            const sy = space.bounds.y - oy;

            this.ctx.fillStyle = space.color;
            this.ctx.fillRect(sx, sy, space.bounds.width, space.bounds.height);

            this._renderGrid(space, ox, oy);
            /*
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
            */
        }

        player.render(this.ctx, ox, oy);
    }

    _renderGrid(space, ox, oy) {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        this.ctx.lineWidth = 1;
        for (let col = 0; col <= space.cols; col++) {
            const x = space.bounds.x + col * space.tileSize - ox;
            this.ctx.beginPath();
            this.ctx.moveTo(x, space.bounds.y - oy);
            this.ctx.lineTo(x, space.bounds.y + space.bounds.height - oy);
            this.ctx.stroke();
        }
        for (let row = 0; row <= space.rows; row++) {
            const y = space.bounds.y + row * space.tileSize - oy;
            this.ctx.beginPath();
            this.ctx.moveTo(space.bounds.x - ox, y);
            this.ctx.lineTo(space.bounds.x + space.bounds.width - ox, y);
            this.ctx.stroke();
        }

        for (let row = 0; row < space.rows; row++) {
            for (let col = 0; col < space.cols; col++) {
              const block = space.getBlockAt(col, row);
              if (!block) continue;
              const bx = space.bounds.x + col * space.tileSize - ox;
              const by = space.bounds.y + row * space.tileSize - oy;
              block.render(this.ctx, bx, by, space.tileSize);
            }
        }
    }

    onZoneEnter(zoneData) {
        if (zoneData.type === 'spaceTransition') {
            if (zoneData.spawnX !== undefined) {
                this.player.x = zoneData.spawnX;
            }
            this.spaceManager.activate(zoneData.targetSpaceIndex, this.levelDef, this.player)
                .catch(err => console.error(err));
        }
        if (zoneData.type === 'load') {
            const targetDef = this.levelDef.spaces[zoneData.targetSpaceIndex];
            if (targetDef) this.spaceManager.preload(targetDef);
        }
    }

    onZoneExit(zoneData) {
        if (zoneData.type === 'unload') {
            this.spaceManager.unload(zoneData.targetSpaceId);
        }
    }

    async nextLevel() {
        this.currentLevel++;
        await this.loadLevel(this.currentLevel);
    }
}

export default LevelManager;

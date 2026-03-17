import Block from './Block.js';
import { fetchJSON } from './utils.js';

const BLOCKS_DEF_URL = '/data/blocks.json';

export default class SpaceLevel {
    constructor(data, worldX, worldY) {
        this.id       = data.id;
        this.tileSize = data.tileSize;
        this.cols     = data.cols;
        this.rows     = data.rows;
        this.color    = data.color;
        this.worldX   = worldX;
        this.worldY   = worldY;
        this.width    = this.cols * this.tileSize;
        this.height   = this.rows * this.tileSize;
        this.bounds   = {
            x: this.worldX, y: this.worldY,
            width: this.width, height: this.height
        };
        this._localDefs   = data.blocks ?? {};
        this._definitions = null;
        this.grid = this._buildGrid(data.grid || []);

        this.registeredBlocks = [];
    }

    async init() {
        const globalDefs  = await SpaceLevel._loadDefinitions();
        this._definitions = { ...globalDefs, ...this._localDefs };

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const block = this.grid[row][col];
                if (!block) continue;
                block.build(this._definitions);
                if (block.registerIn) {
                    block.x      = this.worldX + col * this.tileSize;
                    block.y      = this.worldY + row * this.tileSize;
                    block.vx     = 0;
                    block.vy     = 0;
                    block.width  = this.tileSize;
                    block.height = this.tileSize;
                    this.registeredBlocks.push({ block, worldX: block.x, worldY: block.y });
                }
            }
        }

        return this;
    }

    static _defsCache = null;
    static async _loadDefinitions() {
        if (SpaceLevel._defsCache) return SpaceLevel._defsCache;
        SpaceLevel._defsCache = await fetchJSON(BLOCKS_DEF_URL);
        return SpaceLevel._defsCache;
    }

    _buildGrid(rawGrid) {
        const make = (type) => (type == null || type === "0") ? null : new Block(type);
        if (rawGrid.length === 0) {
            return Array.from({ length: this.rows }, () =>
                new Array(this.cols).fill(null)
            );
        }
        const src = Array.isArray(rawGrid[0])
            ? rawGrid
            : Array.from({ length: this.rows }, (_, r) =>
                rawGrid.slice(r * this.cols, (r + 1) * this.cols)
              );
        return src.map(row => row.map(cell => make(cell)));
    }

    getBlockAt(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
        const block = this.grid[row][col];
        if (block && !block.isBuilt) block.build(this._definitions);
        return block;
    }

    getBlockAtWorld(px, py) {
        const col = Math.floor((px - this.worldX) / this.tileSize);
        const row = Math.floor((py - this.worldY) / this.tileSize);
        return this.getBlockAt(col, row);
    }

    setBlockAt(col, row, typeOrBlock) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
        this.grid[row][col] = typeof typeOrBlock === 'string'
            ? new Block(typeOrBlock)
            : typeOrBlock;
    }
}


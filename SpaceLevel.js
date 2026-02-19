class SpaceLevel {
    constructor(data, worldX, worldY) {
        this.id       = data.id;
        this.tileSize = data.tileSize;
        this.cols     = data.cols;
        this.rows     = data.rows;
        this.color    = data.color;

        this.worldX = worldX;
        this.worldY = worldY;

        this.width  = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        this.bounds = {
            x:      this.worldX,
            y:      this.worldY,
            width:  this.width,
            height: this.height
        };

        this.grid = this._buildGrid(data.grid || []);
    }

    _buildGrid(rawGrid) {
        if (rawGrid.length === 0) {
            return Array.from({ length: this.rows }, () =>
                new Array(this.cols).fill(null)
            );
        }

        // 2D
        if (Array.isArray(rawGrid[0])) {
            return rawGrid;
        }

        // 1D => 2D
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid.push(rawGrid.slice(row * this.cols, (row + 1) * this.cols));
        }
        return grid;
    }

    getBlockAt(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
        return this.grid[row][col];
    }

    getBlockAtWorld(px, py) {
        const col = Math.floor((px - this.worldX) / this.tileSize);
        const row = Math.floor((py - this.worldY) / this.tileSize);
        return this.getBlockAt(col, row);
    }

    setBlockAt(col, row, blockData) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
        this.grid[row][col] = blockData;
    }
}

export default SpaceLevel;

export default class Block {
    constructor(type) {
        this.type       = type;
        this._def       = null;
        this.registerIn = null;
    }

    build(definitions) {
        if (this._def) return this;
        const def = definitions[this.type];
        if (!def) {
            console.warn(`Block: unknown type "${this.type}"`);
            return this;
        }
        
        // todo: other props
        this._def       = def;
        this.color      = def.color;
        this.registerIn = def.registerIn ?? null;

        return this;
    }

    get isBuilt() {
        return this._def !== null;
    }

    render(ctx, x, y, tileSize) {
        if (!this.color) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, tileSize, tileSize);
    }
}

class CollisionUnit {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this._static  = new Set();
        this._dynamic = new Set();
    }

    registerStatic(entity)  { this._static.add(entity); }
    registerDynamic(entity) { this._dynamic.add(entity); }

    unregister(entity) {
        this._static.delete(entity);
        this._dynamic.delete(entity);
    }

    update() {
        for (const dyn of this._dynamic) {
            for (const stat of this._static) {
                this._detect(dyn, stat);
            }
            for (const other of this._dynamic) {
                if (other !== dyn) this._detect(dyn, other);
            }
        }
    }

    _detect(entity, target) {
        if (
            entity.x + entity.width  <= target.x ||
            entity.x                 >= target.x + target.width ||
            entity.y + entity.height <= target.y ||
            entity.y                 >= target.y + target.height
        ) return;

        const overlapLeft   = (entity.x + entity.width)  - target.x;
        const overlapRight  = (target.x + target.width)  - entity.x;
        const overlapTop    = (entity.y + entity.height)  - target.y;
        const overlapBottom = (target.y + target.height)  - entity.y;

        const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        let side, overlap;
        if      (min === overlapLeft)   { side = 'right';  overlap = overlapLeft; }
        else if (min === overlapRight)  { side = 'left';   overlap = overlapRight; }
        else if (min === overlapTop)    { side = 'bottom'; overlap = overlapTop; }
        else                            { side = 'top';    overlap = overlapBottom; }

        this.eventManager.emit('collision:detected', { entity, target, side, overlap });
    }
}

export default CollisionUnit;

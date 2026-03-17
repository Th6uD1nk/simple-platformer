const DEFAULT_GRAVITY = 980;

class GravityUnit {
    constructor(eventManager, { gravity = DEFAULT_GRAVITY } = {}) {
        this.eventManager = eventManager;
        this.gravity      = gravity;
        this._entities    = new Set();
    }

    register(entity)   { this._entities.add(entity); }
    unregister(entity) { this._entities.delete(entity); }

    update(deltaTime) {
        const dvy = this.gravity * deltaTime;
        for (const entity of this._entities) {
            this.eventManager.emit('gravity:apply', { entity, dvy });
        }
    }
}

export default GravityUnit;

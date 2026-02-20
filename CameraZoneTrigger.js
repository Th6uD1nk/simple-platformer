class CameraZoneTrigger {
    constructor() {
        this.zones = [];
        this.listeners = {};
        this.spaceLevel = null;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this._midReached = false;
        this._endReached = false;
        
        this._midYReached = false;
    }

    setContext(spaceLevel, canvasWidth, canvasHeight, player = null, camHeightMotion = 0) {
        this.spaceLevel = spaceLevel;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.camHeightMotion = camHeightMotion;

        const mid = spaceLevel.x + canvasWidth / 2;
        const endThreshold = spaceLevel.x + spaceLevel.width - canvasWidth / 2;
        const playerCenterX = player ? player.x + player.width / 2 : -Infinity;

        this._midReached = playerCenterX >= mid;
        this._endReached = playerCenterX >= endThreshold;
        
        const midY = spaceLevel.y + spaceLevel.height - canvasHeight / 2;
        const playerCenterY = player ? player.y + player.height / 2 : Infinity;
        this._midYReached = playerCenterY <= midY;
    }

    registerZones(zones) {
        this.zones = zones.map(z => ({ ...z, _active: false }));
    }

    check(player) {
        if (this.spaceLevel) {
            const mid = this.spaceLevel.x + this.canvasWidth / 2;
            const endThreshold = this.spaceLevel.x + this.spaceLevel.width - this.canvasWidth / 2;
            const playerCenter = player.x + player.width / 2;

            if (!this._midReached && playerCenter >= mid) {
                this._midReached = true;
                this.emit('cameraScrollStart', {});
            }
            if (!this._endReached && playerCenter >= endThreshold) {
                this._endReached = true;
                this.emit('cameraScrollEnd', {});
            }
            if (this._endReached && playerCenter < endThreshold) {
                this._endReached = false;
                this.emit('cameraScrollStart', {});
            }
            if (this._midReached && playerCenter < mid) {
                this._midReached = false;
                this.emit('cameraScrollEnd', {});
            }
        }

        const midY = this.spaceLevel.y + this.spaceLevel.height - this.canvasHeight / 2;
        const playerCenterY = player.y + player.height / 2;

        if (!this._midYReached && playerCenterY <= midY) {
            this._midYReached = true;
            this.emit('cameraScrollStartY', {});
        }

        if (this._midYReached && playerCenterY > midY) {
            this._midYReached = false;
            this.emit('cameraScrollEndY', {});
        }

        for (const zone of this.zones) {
            const inside = this._isInside(player, zone);
            if (inside && !zone._active) {
                zone._active = true;
                this.emit('zoneEnter', zone);
            } else if (!inside && zone._active) {
                zone._active = false;
                this.emit('zoneExit', zone);
            }
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }

    _isInside(player, zone) {
        return (
            player.x + player.width  > zone.x &&
            player.x                 < zone.x + zone.width &&
            player.y + player.height > zone.y &&
            player.y                 < zone.y + zone.height
        );
    }
}

export default CameraZoneTrigger;


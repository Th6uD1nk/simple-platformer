class PlayerCameraMovement {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = { x: 0, y: 0 };
        this.spaceLevel = null;
        this.scrolling = false;
        this.scrollLocked = false;
        
        this.scrollingY = false;
    }

    setSpaceLevel(spaceLevel, startPosition, player = null, camHeightMotion = 0) {
        this.spaceLevel = spaceLevel;
        this.camHeightMotion = camHeightMotion;
        this.scrolling = false;
        this.scrollLocked = false;
        this.scrollingY = false;

        if (player) {
            const targetX = player.x + player.width / 2 - this.canvas.width / 2;
            const maxOffsetX = spaceLevel.x + spaceLevel.width - this.canvas.width;
            this.offset.x = Math.max(spaceLevel.x, Math.min(targetX, maxOffsetX));
        } else {
            this.offset.x = spaceLevel.x;
        }

        this.offset.y = spaceLevel.y + spaceLevel.height - this.canvas.height;
    }

    onScrollStart() {
        this.scrolling = true;
    }

    onScrollEnd() {
        this.scrolling = false;
    }

    onScrollStartY() {
        this.scrollingY = true;
    }

    onScrollEndY() {
        this.scrollingY = false;
    }

    update(player) {
        if (!this.spaceLevel) return;

        if (this.scrolling && !this.scrollLocked) {
            const targetX = player.x + player.width / 2 - this.canvas.width / 2;
            const maxOffsetX = this.spaceLevel.x + this.spaceLevel.width - this.canvas.width;
            this.offset.x = Math.max(this.spaceLevel.x, Math.min(targetX, maxOffsetX));
        }

        if (this.scrollingY && this.camHeightMotion > 0) {
            const targetY = player.y + player.height / 2 - this.canvas.height / 2;

            const maxOffsetY = this.spaceLevel.y + this.spaceLevel.height - this.canvas.height;
            const minOffsetY = maxOffsetY - this.camHeightMotion;

            this.offset.y = Math.max(minOffsetY, Math.min(targetY, maxOffsetY));
        }
    }

    getOffset() {
        return this.offset;
    }
}

export default PlayerCameraMovement;

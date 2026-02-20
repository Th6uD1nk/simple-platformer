class PlayerCameraMovement {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = { x: 0, y: 0 };
        this.spaceLevel = null;
        this.scrolling = false;
        this.scrollingY = false;
    }

    setSpaceLevel(spaceLevel, startPosition, player = null, camHeightMotion = 0) {
        this.spaceLevel = spaceLevel;
        this.camHeightMotion = camHeightMotion;
        this.scrolling = false;
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

        const targetX = player.x + player.width / 2 - this.canvas.width / 2;
        const smoothedX = this.offset.x + (targetX - this.offset.x) * 0.15;
        const maxX = this.spaceLevel.x + this.spaceLevel.width - this.canvas.width;
        const minX = this.spaceLevel.x;
        this.offset.x = Math.max(minX, Math.min(smoothedX, maxX));

        if (this.scrollingY && this.camHeightMotion > 0) {
            const targetY = player.y + player.height / 2 - this.canvas.height / 2;
            const smoothedY = this.offset.y + (targetY - this.offset.y) * 0.15;
            const maxY = this.spaceLevel.y + this.spaceLevel.height - this.canvas.height;
            const minY = maxY - this.camHeightMotion;
            this.offset.y = Math.max(minY, Math.min(smoothedY, maxY));
        } else {
            const baseY = this.spaceLevel.y + this.spaceLevel.height - this.canvas.height;
            this.offset.y = this.offset.y + (baseY - this.offset.y) * 0.15;
        }
    }

    getOffset() {
        return this.offset;
    }
}

export default PlayerCameraMovement;

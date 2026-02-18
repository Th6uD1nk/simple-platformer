class PlayerCameraMovement {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = { x: 0, y: 0 };
        this.spaceLevel = null;
        this.scrolling = false;
        this.scrollLocked = false;
    }

    setSpaceLevel(spaceLevel, startPosition) {
        this.spaceLevel = spaceLevel;
        this.scrolling = false;
        this.scrollLocked = false;
        this.offset.x = spaceLevel.x;
        this.offset.y = startPosition.y - this.canvas.height / 2;
    }

    onScrollStart() {
        this.scrolling = true;
    }

    onScrollEnd() {
        this.scrolling = false;
        this.scrollLocked = true;
    }

    update(player) {
        if (!this.spaceLevel || !this.scrolling || this.scrollLocked) return;

        const targetX = player.x + player.width / 2 - this.canvas.width / 2;
        const maxOffsetX = this.spaceLevel.x + this.spaceLevel.width - this.canvas.width;
        this.offset.x = Math.max(this.spaceLevel.x, Math.min(targetX, maxOffsetX));
    }

    getOffset() {
        return this.offset;
    }
}

export default PlayerCameraMovement;

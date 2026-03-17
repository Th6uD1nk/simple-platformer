const DIRECTIONS = ['up', 'down', 'left', 'right'];
const ZONE_RADIUS = 20;

function getDirs(dx, dy, radius, touchRadiusX = 0, touchRadiusY = 0) {
    const dirs = [];
    const points = {
        up:    { x: 0, y: -radius * 0.6 },
        down:  { x: 0, y:  radius * 0.6 },
        left:  { x: -radius * 0.6, y: 0 },
        right: { x:  radius * 0.6, y: 0 },
    };
    const touchRadius = Math.max(touchRadiusX, touchRadiusY, ZONE_RADIUS);
    for (const [dir, p] of Object.entries(points)) {
        if (Math.hypot(dx - p.x, dy - p.y) < ZONE_RADIUS + touchRadius) dirs.push(dir);
    }
    return dirs;
}

export class VirtualPad {
    constructor({ x, y, radius, events, eventManager }) {
        this.cx = x;
        this.cy = y;
        this.radius = radius;
        this.events = events;
        this.em = eventManager;
        this.touches = new Map();
    }

    onTouchStart(touch) {
        const dx = touch.clientX - this.cx;
        const dy = touch.clientY - this.cy;
        if (Math.hypot(dx, dy) > this.radius) return false;
        const dirs = getDirs(dx, dy, this.radius);
        
            console.log('dirs:', dirs, 'dx:', dx, 'dy:', dy);

        this.touches.set(touch.identifier, dirs);
        for (const dir of dirs) {
            if (!this._isDirActiveElsewhere(touch.identifier, dir)) this._emit(dir, true);
        }
        return true;
    }

    onTouchMove(touch) {
        if (!this.touches.has(touch.identifier)) return;
        const dx = touch.clientX - this.cx;
        const dy = touch.clientY - this.cy;
        const newDirs = getDirs(dx, dy, this.radius);
        const oldDirs = this.touches.get(touch.identifier);
        this.touches.set(touch.identifier, newDirs);
        for (const dir of oldDirs) {
            if (!newDirs.includes(dir) && !this._isDirActiveElsewhere(touch.identifier, dir)) this._emit(dir, false);
        }
        for (const dir of newDirs) {
            if (!oldDirs.includes(dir) && !this._isDirActiveElsewhere(touch.identifier, dir)) this._emit(dir, true);
        }
    }

    onTouchEnd(touch) {
        if (!this.touches.has(touch.identifier)) return;
        const dirs = this.touches.get(touch.identifier);
        this.touches.delete(touch.identifier);
        for (const dir of dirs) {
            if (!this._isDirActiveElsewhere(touch.identifier, dir)) this._emit(dir, false);
        }
    }

    reset() {
        for (const dirs of this.touches.values()) {
            for (const dir of dirs) this._emit(dir, false);
        }
        this.touches.clear();
    }

    _emit(dir, pressed) {
        this.em.emit(this.events[dir], { pressed });
    }

    _isDirActiveElsewhere(excludeId, dir) {
        for (const [id, dirs] of this.touches) {
            if (id !== excludeId && dirs.includes(dir)) return true;
        }
        return false;
    }

    get activeDirs() {
        const set = new Set();
        for (const dirs of this.touches.values()) {
            for (const dir of dirs) set.add(dir);
        }
        return set;
    }

    render(ctx, showUI) {
        if (!showUI) return;
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        const active = this.activeDirs;
        for (const dir of DIRECTIONS) {
            const angle = { up: -Math.PI/2, down: Math.PI/2, left: Math.PI, right: 0 }[dir];
            const ax = this.cx + Math.cos(angle) * this.radius * 0.6;
            const ay = this.cy + Math.sin(angle) * this.radius * 0.6;
            ctx.fillStyle = active.has(dir) ? 'yellow' : 'white';
            ctx.globalAlpha = active.has(dir) ? 0.8 : 0.1;
            ctx.beginPath();
            ctx.arc(ax, ay, ZONE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

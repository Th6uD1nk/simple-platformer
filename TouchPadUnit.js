import {
    RPAD_KEY_UP, RPAD_KEY_DOWN, RPAD_KEY_LEFT, RPAD_KEY_RIGHT,
    LPAD_KEY_UP, LPAD_KEY_DOWN, LPAD_KEY_LEFT, LPAD_KEY_RIGHT
} from './InputEvent.js';

const DIRECTIONS = ['up', 'down', 'left', 'right'];

function getDir(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'up' : 'down';
}

class VirtualPad {
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
        const dir = getDir(dx, dy);
        this.touches.set(touch.identifier, dir);
        this._emit(dir, true);
        return true;
    }

    onTouchMove(touch) {
        if (!this.touches.has(touch.identifier)) return;
        const dx = touch.clientX - this.cx;
        const dy = touch.clientY - this.cy;
        const newDir = getDir(dx, dy);
        const oldDir = this.touches.get(touch.identifier);
        if (newDir !== oldDir) {
            this.touches.set(touch.identifier, newDir);
            if (![...this.touches.values()].includes(oldDir)) this._emit(oldDir, false);
            this._emit(newDir, true);
        }
    }

    onTouchEnd(touch) {
        if (!this.touches.has(touch.identifier)) return;
        const dir = this.touches.get(touch.identifier);
        this.touches.delete(touch.identifier);
        if (![...this.touches.values()].includes(dir)) this._emit(dir, false);
    }

    reset() {
        for (const dir of this.touches.values()) {
            this._emit(dir, false);
        }
        this.touches.clear();
    }

    _emit(dir, pressed) {
        this.em.emit(this.events[dir], { pressed });
    }

    get activeDir() {
        const dirs = [...this.touches.values()];
        return dirs.length ? dirs[dirs.length - 1] : null;
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
        for (const dir of DIRECTIONS) {
            const angle = { up: -Math.PI/2, down: Math.PI/2, left: Math.PI, right: 0 }[dir];
            const ax = this.cx + Math.cos(angle) * this.radius * 0.6;
            const ay = this.cy + Math.sin(angle) * this.radius * 0.6;
            ctx.fillStyle = this.activeDir === dir ? 'yellow' : 'white';
            ctx.globalAlpha = this.activeDir === dir ? 0.8 : 0.1;
            ctx.beginPath();
            ctx.arc(ax, ay, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

export default class TouchPadUnit {
    constructor(eventManager, canvas, { showUI = true } = {}) {
        this.showUI = showUI;
        this.canvas = canvas;

        const r       = 70;
        const marginx = 32;
        const marginy = 64;
        const h = canvas.height;
        const w = canvas.width;

        this.lpad = new VirtualPad({
            x: marginx + r, y: h - marginy - r, radius: r,
            events: { up: LPAD_KEY_UP, down: LPAD_KEY_DOWN, left: LPAD_KEY_LEFT, right: LPAD_KEY_RIGHT },
            eventManager,
        });
        this.rpad = new VirtualPad({
            x: w - marginx - r, y: h - marginy - r, radius: r,
            events: { up: RPAD_KEY_UP, down: RPAD_KEY_DOWN, left: RPAD_KEY_LEFT, right: RPAD_KEY_RIGHT },
            eventManager,
        });

        canvas.addEventListener('touchstart',  e => { e.preventDefault(); this._dispatch('Start', e.changedTouches, e.touches); }, { passive: false });
        canvas.addEventListener('touchmove',   e => { e.preventDefault(); this._dispatch('Move',  e.changedTouches, e.touches); }, { passive: false });
        canvas.addEventListener('touchend',    e => { e.preventDefault(); this._dispatch('End',   e.changedTouches, e.touches); }, { passive: false });
        canvas.addEventListener('touchcancel', e => { e.preventDefault(); this._dispatch('End',   e.changedTouches, e.touches); }, { passive: false });
    }

    _dispatch(type, touches, allTouches) {
        for (const touch of touches) {
            this.lpad[`onTouch${type}`](touch);
            this.rpad[`onTouch${type}`](touch);
        }
        if (allTouches.length === 0) {
            this.lpad.reset();
            this.rpad.reset();
        }
    }

    render(ctx) {
        //this.lpad.render(ctx, this.showUI);
        this.rpad.render(ctx, this.showUI);
    }
}

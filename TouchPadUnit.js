import {
    RPAD_KEY_UP, RPAD_KEY_DOWN, RPAD_KEY_LEFT, RPAD_KEY_RIGHT,
    LPAD_KEY_UP, LPAD_KEY_DOWN, LPAD_KEY_LEFT, LPAD_KEY_RIGHT
} from './InputEvent.js';
import { VirtualPad } from './VirtualPad.js';

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


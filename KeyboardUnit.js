import {
    RPAD_KEY_UP, RPAD_KEY_DOWN, RPAD_KEY_LEFT, RPAD_KEY_RIGHT,
    LPAD_KEY_UP, LPAD_KEY_DOWN, LPAD_KEY_LEFT, LPAD_KEY_RIGHT
} from './InputEvent.js';

const KEY_MAP = {
    ArrowUp:    { event: RPAD_KEY_UP,    pressed: false },
    ArrowDown:  { event: RPAD_KEY_DOWN,  pressed: false },
    ArrowLeft:  { event: RPAD_KEY_LEFT,  pressed: false },
    ArrowRight: { event: RPAD_KEY_RIGHT, pressed: false },
    ' ':        { event: RPAD_KEY_UP,    pressed: false },
    w:          { event: LPAD_KEY_UP,    pressed: false },
    s:          { event: LPAD_KEY_DOWN,  pressed: false },
    a:          { event: LPAD_KEY_LEFT,  pressed: false },
    d:          { event: LPAD_KEY_RIGHT, pressed: false },
};

export default class KeyboardUnit {
    constructor(eventManager) {
        this.em = eventManager;
        window.addEventListener('keydown', e => this._handle(e.key, true));
        window.addEventListener('keyup',   e => this._handle(e.key, false));
    }

    _handle(key, isDown) {
        const mapping = KEY_MAP[key];
        if (!mapping) return;
        if (mapping.pressed === isDown) return;
        mapping.pressed = isDown;
        this.em.emit(mapping.event, { pressed: isDown });
    }

    render() {}
}


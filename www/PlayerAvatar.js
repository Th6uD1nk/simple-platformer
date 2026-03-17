const WALK_FRAME_MS = 160;

const WALK_STATES = new Set(['walk-right', 'walk-left']);

const STATE_SPRITES = {
    'idle-right'   : ['state-idle-right'],
    'idle-left'    : ['state-idle-left'],
    'walk-right'   : ['state-walk-right-a', 'state-walk-right-b'],
    'walk-left'    : ['state-walk-left-a',  'state-walk-left-b'],
    'jump-right'   : ['state-jump-right'],
    'jump-left'    : ['state-jump-left'],
    'crouch-right' : ['state-crouch-right'],
    'crouch-left'  : ['state-crouch-left'],
};

const AVATAR_CSS = `
.player-avatar {
    position       : absolute;
    top            : 0;
    left           : 0;
    width          : 32px;
    height         : 48px;
    overflow       : visible;
    pointer-events : none;
    will-change    : transform;
}
.player-avatar svg {
    transform: scale(1.2);
    transform-origin: center;
    position : absolute;
    top      : 1px;
    left     : 0;
    width    : 32px;
    height   : 48px;
    overflow : visible;
    display  : none;
}
.player-avatar svg.is-active {
    display : block;
}
`;

(function injectAvatarCSS() {
    if (document.getElementById('player-avatar-styles')) return;
    const style = document.createElement('style');
    style.id = 'player-avatar-styles';
    style.textContent = AVATAR_CSS;
    document.head.appendChild(style);
})();

export class PlayerAvatar {
    constructor(container, sprites) {
        this._state     = null;
        this._walkFrame = 0;
        this._walkTimer = 0;

        this._el = document.createElement('div');
        this._el.className = 'player-avatar';
        container.appendChild(this._el);

        this._svgEls = {};
        for (const frames of Object.values(STATE_SPRITES)) {
            for (const spriteId of frames) {
                if (this._svgEls[spriteId]) continue;
                const group = sprites[spriteId];
                if (!group) {
                    console.warn(`PlayerAvatar: sprite "${spriteId}" not found`);
                    continue;
                }
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 32 48');
                svg.appendChild(group.cloneNode(true));
                this._el.appendChild(svg);
                this._svgEls[spriteId] = svg;
            }
        }

        this.setState('idle-right');
    }

    tick(deltaMs) {
        if (!WALK_STATES.has(this._state)) return;
        this._walkTimer += deltaMs;
        if (this._walkTimer >= WALK_FRAME_MS) {
            this._walkTimer = 0;
            this._walkFrame = this._walkFrame === 0 ? 1 : 0;
            this._showCurrentFrame();
        }
    }

    setState(state) {
        if (state === this._state) return;
        if (!STATE_SPRITES[state]) {
            console.warn(`PlayerAvatar.setState: unknown state "${state}"`);
            return;
        }
        this._hideAll();
        this._state     = state;
        this._walkFrame = 0;
        this._walkTimer = 0;
        this._showCurrentFrame();
    }
    
    syncPosition(worldX, worldY, offsetX, offsetY) {
      this._el.style.transform = `translate(${Math.round(worldX - offsetX)}px, ${Math.round(worldY - offsetY)}px)`;
    }

    _hideAll() {
        for (const svg of Object.values(this._svgEls)) {
            svg.classList.remove('is-active');
        }
    }

    _showCurrentFrame() {
        const frames = STATE_SPRITES[this._state];

        for (const spriteId of frames) {
            const svg = this._svgEls[spriteId];
            if (svg) svg.classList.remove('is-active');
        }

        const spriteId = frames[this._walkFrame] ?? frames[0];
        const svg      = this._svgEls[spriteId];
        if (svg) svg.classList.add('is-active');
    }
}

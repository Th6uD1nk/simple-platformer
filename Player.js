import {
    RPAD_KEY_UP, RPAD_KEY_LEFT, RPAD_KEY_RIGHT, RPAD_KEY_DOWN,
    LPAD_KEY_UP, LPAD_KEY_LEFT, LPAD_KEY_RIGHT, LPAD_KEY_DOWN
} from './InputEvent.js';
import { fetchSVG } from './utils.js';
import { PlayerAvatar } from './PlayerAvatar.js';

const PLAYER_SVG_PATH = 'data/assets/player.svg';

class Player {
    constructor(x, y, eventManager) {
        this.x          = x;
        this.y          = y;
        this.width      = 32;
        this.height     = 48;
        this.vx         = 0;
        this.vy         = 0;
        this.speed      = 200;
        this.isOnGround = false;
        this._deltaTime     = 0;
        this._isJumping     = false;
        this._landingBuffer = false;
        this._landingTimer  = 0;

        this.pad  = { up: false, down: false, left: false, right: false };
        this.lpad = { up: false, down: false, left: false, right: false };

        this._avatar     = null;
        this._lastFacing = 'right';

        eventManager.on(RPAD_KEY_UP,    ({ pressed }) => this.pad.up    = pressed);
        eventManager.on(RPAD_KEY_DOWN,  ({ pressed }) => this.pad.down  = pressed);
        eventManager.on(RPAD_KEY_LEFT,  ({ pressed }) => this.pad.left  = pressed);
        eventManager.on(RPAD_KEY_RIGHT, ({ pressed }) => this.pad.right = pressed);

        eventManager.on(LPAD_KEY_UP,    ({ pressed }) => this.lpad.up    = pressed);
        eventManager.on(LPAD_KEY_LEFT,  ({ pressed }) => this.lpad.left  = pressed);
        eventManager.on(LPAD_KEY_RIGHT, ({ pressed }) => this.lpad.right = pressed);

        eventManager.on('gravity:apply', ({ entity, dvy }) => {
            if (entity !== this) return;
            this.vy += dvy;
        });

        eventManager.on('collision:detected', ({ entity, side, overlap }) => {
            if (entity !== this) return;
            if (side === 'bottom') {
                this.y         -= overlap;
                this.vy         = 0;
                this.isOnGround = true;
                if (this._isJumping) {
                    this._isJumping     = false;
                    this._landingBuffer = true;
                    this._landingTimer  = 0;
                }
            } else if (side === 'top') {
                this.y += overlap;
                this.vy  = 0;
            } else if (side === 'left') {
                this.x += overlap;
                this.vx  = 0;
            } else if (side === 'right') {
                this.x -= overlap;
                this.vx  = 0;
            }
        });
    }

    async init(container) {
        const sprites = await fetchSVG(PLAYER_SVG_PATH);
        this._avatar  = new PlayerAvatar(container, sprites);
    }

    _resolveAvatarState() {
        if (!this._avatar) return;

        if (this.pad.left)  this._lastFacing = 'left';
        if (this.pad.right) this._lastFacing = 'right';
        if (this.pad.up)    this._isJumping  = true;

        let state;

        if (this._landingBuffer) {
            if (this.pad.left) {
                state = 'walk-left';
            } else if (this.pad.right) {
                state = 'walk-right';
            } else {
                state = `idle-${this._lastFacing}`;
            }
        } else if (this._isJumping) {
            if (this.pad.down) {
                state = `crouch-${this._lastFacing}`;
            } else {
                state = `jump-${this._lastFacing}`;
            }
        } else if (this.pad.left) {
            state = 'walk-left';
        } else if (this.pad.right) {
            state = 'walk-right';
        } else if (this.pad.down) {
            state = `crouch-${this._lastFacing}`;
        } else {
            state = `idle-${this._lastFacing}`;
        }

        this._avatar.setState(state);
    }

    updateForDebug(deltaTime) {
        this._deltaTime = deltaTime;
        if (this.pad.left)  this.x -= this.speed * deltaTime;
        if (this.pad.right) this.x += this.speed * deltaTime;
        if (this.pad.up)    this.y -= this.speed * deltaTime;
        if (this.pad.down)  this.y += this.speed * deltaTime;
    }

    update(deltaTime) {
        this._deltaTime = deltaTime;

        if (this._landingBuffer) {
            this._landingTimer += deltaTime * 1000;
            if (this._landingTimer > 480) this._landingBuffer = false;
        }

        const ACCELERATION    = 1500;  // how fast the player reaches max speed
        const FRICTION_GROUND = 800;   // how fast the player slows down on ground
        const FRICTION_AIR    = 0;     // air resistance (0 = keep momentum)
        const JUMP_FORCE      = 500;   // jump strength
        
        const targetVx = this.pad.left ? -this.speed : this.pad.right ? this.speed : 0;
        const friction = this.isOnGround ? FRICTION_GROUND : FRICTION_AIR;

        if (targetVx !== 0) {
            const dir = Math.sign(targetVx - this.vx);
            this.vx  += dir * ACCELERATION * deltaTime;
            if (Math.sign(targetVx - this.vx) !== dir) this.vx = targetVx;
        } else {
            const dir = Math.sign(this.vx);
            this.vx  -= dir * friction * deltaTime;
            if (Math.sign(this.vx) !== dir) this.vx = 0;
        }

        if (this.pad.up && this.isOnGround) {
            this.vy         = -JUMP_FORCE;
            this.isOnGround = false;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        this.isOnGround = false;
    }

    render(ctx, offsetX, offsetY) {
        this._resolveAvatarState();

        if (this._avatar) {
            this._avatar.tick(this._deltaTime * 1000);
            this._avatar.syncPosition(this.x, this.y, offsetX, offsetY);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        }
    }
}

export default Player;

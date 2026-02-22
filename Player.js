import { RPAD_KEY_UP, RPAD_KEY_LEFT, RPAD_KEY_RIGHT, LPAD_KEY_UP, LPAD_KEY_LEFT, LPAD_KEY_RIGHT } from './InputEvent.js';

class Player {
    constructor(x, y, eventManager) {
        this.x = x;
        this.y = y;
        this.width  = 32;
        this.height = 32;
        this.color  = '#e74c3c';
        this.vx = 0;
        this.vy = 0;
        this.speed      = 200;
        this.isOnGround = false;

        this.pad = { up: false, down: false, left: false, right: false };
        this.lpad = { up: false, down: false, left: false, right: false };

        eventManager.on(RPAD_KEY_UP,    ({ pressed }) => this.pad.up    = pressed);
        eventManager.on(RPAD_KEY_LEFT,  ({ pressed }) => this.pad.left  = pressed);
        eventManager.on(RPAD_KEY_RIGHT, ({ pressed }) => this.pad.right = pressed);
        eventManager.on(LPAD_KEY_UP,    ({ pressed }) => this.lpad.up   = pressed);
        eventManager.on(LPAD_KEY_LEFT,  ({ pressed }) => this.lpad.left = pressed);
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

    // debugging purpose
    updateForDebug(deltaTime) {
        if (this.lpad.left)  this.x -= this.speed * deltaTime;
        if (this.lpad.right) this.x += this.speed * deltaTime;
        if (this.lpad.up)    this.y -= this.speed * deltaTime;
        if (this.lpad.down)  this.y += this.speed * deltaTime;
    }
  
    update(deltaTime) {
        const ACCELERATION    = 1500;  // how fast the player reaches max speed
        const FRICTION_GROUND = 800;   // how fast the player slows down on ground
        const FRICTION_AIR    = 0;     // air resistance (0 = keep momentum)
        const JUMP_FORCE      = 500;   // jump strength

        const targetVx = this.pad.left ? -this.speed : this.pad.right ? this.speed : 0;
        const friction = this.isOnGround ? FRICTION_GROUND : FRICTION_AIR;

        if (targetVx !== 0) {
            const dir = Math.sign(targetVx - this.vx);
            this.vx += dir * ACCELERATION * deltaTime;
            if (Math.sign(targetVx - this.vx) !== dir) this.vx = targetVx;
        } else {
            const dir = Math.sign(this.vx);
            this.vx -= dir * friction * deltaTime;
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
    }
}

export default Player;


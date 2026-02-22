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

        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup',   e => this.keys[e.key] = false);

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

    update(deltaTime) {
        this.vx = 0;
        
        // debugging purpose
        if (this.keys['a']) this.x -= this.speed * deltaTime;
        if (this.keys['d']) this.x += this.speed * deltaTime;
        if (this.keys['w']) this.y -= this.speed * deltaTime;
        if (this.keys['s']) this.y += this.speed * deltaTime;
        //
        
        if (this.keys['ArrowLeft']  || this.keys['a']) this.vx = -this.speed;
        if (this.keys['ArrowRight'] || this.keys['d']) this.vx =  this.speed;

        if ((this.keys['ArrowUp'] || this.keys['w'] || this.keys[' ']) && this.isOnGround) {
            this.vy         = -500;
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


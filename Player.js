class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.color = '#e74c3c';
        this.speed = 200;
        this.keys = {};

        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup',   (e) => this.keys[e.key] = false);
    }

    update(deltaTime) {
        if (this.keys['ArrowLeft']  || this.keys['a']) this.x -= this.speed * deltaTime;
        if (this.keys['ArrowRight'] || this.keys['d']) this.x += this.speed * deltaTime;
        if (this.keys['ArrowUp']    || this.keys['w']) this.y -= this.speed * deltaTime;
        if (this.keys['ArrowDown']  || this.keys['s']) this.y += this.speed * deltaTime;
    }

    render(ctx, offsetX, offsetY) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
    }
}

export default Player;

import LevelManager from './LevelManager.js';
import Player from './Player.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';
canvas.style.display = 'block';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

const levelManager = new LevelManager(ctx, canvas);
levelManager.init();

const player = new Player(levelManager.levelDef.startPosition.x, levelManager.levelDef.startPosition.y);

let lastTime = 0;
function loop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    player.update(deltaTime);
    levelManager.update(player, deltaTime);
    levelManager.render(player);

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    levelManager.loadLevel(levelManager.currentLevel);
});


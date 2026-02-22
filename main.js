import LevelManager  from './LevelManager.js';
import Player        from './Player.js';
import EventManager  from './EventManager.js';
import GravityUnit   from './GravityUnit.js';
import CollisionUnit from './CollisionUnit.js';

import KeyboardUnit from './KeyboardUnit.js';
import TouchPadUnit from './TouchPadUnit.js';

const canvas = document.createElement('canvas');
const ctx    = canvas.getContext('2d');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position        = 'fixed';
canvas.style.bottom          = '0';
canvas.style.left            = '0';
canvas.style.backgroundColor = 'black';
canvas.style.display         = 'block';
document.body.style.margin   = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

const eventManager  = new EventManager();
const gravityUnit   = new GravityUnit(eventManager);
const collisionUnit = new CollisionUnit(eventManager);

const levelManager  = new LevelManager(ctx, canvas, eventManager, gravityUnit, collisionUnit);

async function startGame() {
    await levelManager.init().catch(err => console.error('[init error]', err));

    const { x, y } = levelManager.levelDef.startPosition;
    const player = new Player(x, y, eventManager);

    gravityUnit.register(player);
    collisionUnit.registerDynamic(player);

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
    const inputUnit = isMobile
        ? new TouchPadUnit(eventManager, canvas, { showUI: true })
        : new KeyboardUnit(eventManager);
    
    let lastTime = 0;
    function loop(timestamp) {
        const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        // player.updateForDebug(deltaTime);
        player.update(deltaTime);
        
        gravityUnit.update(deltaTime);
        collisionUnit.update();

        levelManager.update(player, deltaTime);
        levelManager.render(player);

        inputUnit.render(ctx);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    window.addEventListener('resize', () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const bounds = levelManager.spaceManager.activeSpace.bounds;
        levelManager.zoneTrigger.setContext(bounds, canvas.width, canvas.height);
        levelManager.cameraMovement.setSpaceLevel(
            bounds,
            levelManager.levelDef.startPosition,
            null,
            levelManager.levelDef.camHeightMotion ?? 0
        );
    });
}

async function requestFullscreen() {
    const el = document.documentElement;
    try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch(e) {
        window.scrollTo(0, 1);
    }
}

function showStartScreen() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: black;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-family: sans-serif;
        z-index: 9999;
        cursor: pointer;
    `;
    overlay.textContent = 'Tap to play';
    document.body.appendChild(overlay);

    const handler = async () => {
        await requestFullscreen().catch(() => {});
        overlay.remove();
        startGame().catch(err => console.error('[main] Error at game start :', err));
    };

    overlay.addEventListener('click',      handler, { once: true });
    overlay.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('fullscreenchange', () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    });
}

showStartScreen();

const canvas = document.getElementById("rocketCanvas");
const ctx = canvas.getContext("2d");

// Initialize objects
let space;
let rocket;
let controls;

let isMobile = window.innerWidth <= 768;

// HUD button regions (mobile)
const hud = {
    left: { x: 30, y: 0, w: 60, h: 60, label: "⬅" },
    right: { x: 110, y: 0, w: 60, h: 60, label: "➡" },
    engine: { x: 0, y: 0, w: 60, h: 60, label: "🔥" }
};

// HUD throttle slider (mobile)
const throttleBar = {
    x: 0,
    y: 100,
    w: 40,
    h: 0,
    knobY: 0
};

function initializeSimulation() {
    space = new Space(canvas.width, canvas.height);
    rocket = new Rocket(0, 500); // Start at world coordinates (0, 500)
    controls = new Controls();
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Reinitialize space with new dimensions
    if (space) {
        space.width = canvas.width;
        space.height = canvas.height;
    } else {
        initializeSimulation();
    }

    // Update HUD positions
    hud.left.y = canvas.height - 80;
    hud.right.y = canvas.height - 80;
    hud.engine.x = canvas.width - 90;
    hud.engine.y = canvas.height - 80;

    // Position throttle bar on right side
    throttleBar.x = canvas.width - 70;
    throttleBar.h = canvas.height - 200;
    throttleBar.knobY = throttleBar.y + throttleBar.h; // start at 0% throttle
}

resizeCanvas();

window.addEventListener("resize", () => {
    resizeCanvas();
    isMobile = window.innerWidth <= 768;
});

// Touch input
canvas.addEventListener("touchstart", handleTouch, { passive: true });
canvas.addEventListener("touchmove", handleTouch, { passive: true });
canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

function handleTouch(e) {
    const rect = canvas.getBoundingClientRect();
    for (let touch of e.touches) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check throttle slider
        if (
            x > throttleBar.x && x < throttleBar.x + throttleBar.w &&
            y > throttleBar.y && y < throttleBar.y + throttleBar.h
        ) {
            throttleBar.knobY = y;
            const percent = 100 - ((y - throttleBar.y) / throttleBar.h) * 100;
            controls.throttle = Math.max(0, Math.min(100, Math.round(percent)));
        }

        // Buttons
        if (inside(x, y, hud.left)) {
            controls.left = true;
        }
        if (inside(x, y, hud.right)) {
            controls.right = true;
        }
        if (inside(x, y, hud.engine)) {
            controls.engine = !controls.engine;
        }
    }
}

function handleTouchEnd() {
    controls.left = false;
    controls.right = false;
}

function inside(x, y, btn) {
    return x > btn.x && x < btn.x + btn.w && y > btn.y && y < btn.y + btn.h;
}

// Draw HUD and info
function drawHUD() {
    if (!isMobile) return;
    
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw buttons
    Object.values(hud).forEach(btn => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "#fff";
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    });

    // Draw throttle bar
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(throttleBar.x, throttleBar.y, throttleBar.w, throttleBar.h);
    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(throttleBar.x, throttleBar.y, throttleBar.w, throttleBar.h);

    // Draw throttle knob
    ctx.fillStyle = "#0f0";
    ctx.fillRect(throttleBar.x, throttleBar.knobY - 10, throttleBar.w, 20);

    // Draw throttle label
    ctx.fillStyle = "#0f0";
    ctx.fillText(`${controls.throttle}%`, throttleBar.x + throttleBar.w / 2, throttleBar.y - 20);
}

function drawInfo() {
    // Draw info panel
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 250, 100);
    ctx.strokeStyle = "#444";
    ctx.strokeRect(10, 10, 250, 100);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    
    const speed = rocket.getSpeed().toFixed(2);
    const altitude = (-rocket.y).toFixed(0);
    
    ctx.fillText(`Position: (${rocket.x.toFixed(0)}, ${rocket.y.toFixed(0)})`, 20, 30);
    ctx.fillText(`Velocity: (${rocket.vx.toFixed(2)}, ${rocket.vy.toFixed(2)})`, 20, 45);
    ctx.fillText(`Speed: ${speed}`, 20, 60);
    ctx.fillText(`Altitude: ${altitude}`, 20, 75);
    ctx.fillText(`Throttle: ${controls.throttle}%`, 20, 90);
}

function animate() {
    // Clear canvas
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update rocket controls
    rocket.engineOn = controls.engine;
    rocket.throttle = controls.throttle;

    if (controls.left) rocket.angle -= rocket.ROTATION_SPEED;
    if (controls.right) rocket.angle += rocket.ROTATION_SPEED;

    // Update rocket physics
    rocket.update(space);
    
    // Update camera to follow rocket
    space.updateCamera(rocket.x, rocket.y);

    // Draw space background
    space.draw(ctx);
    
    // Draw rocket
    rocket.draw(ctx, space);

    // Draw UI
    if (isMobile) {
        drawHUD();
    }
    drawInfo();

    // Draw crosshair at rocket position (debug)
    if (false) { // Set to true to show crosshair
        const screenPos = space.worldToScreen(rocket.x, rocket.y);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 10, screenPos.y);
        ctx.lineTo(screenPos.x + 10, screenPos.y);
        ctx.moveTo(screenPos.x, screenPos.y - 10);
        ctx.lineTo(screenPos.x, screenPos.y + 10);
        ctx.stroke();
    }

    requestAnimationFrame(animate);
}

// Initialize and start
initializeSimulation();
animate();
const canvas = document.getElementById("rocketCanvas");
const ctx = canvas.getContext("2d");

const rocket = new Rocket(canvas.width / 2, canvas.height - 100);
const controls = new Controls();

let isMobile = window.innerWidth <= 768;

// HUD button regions (mobile)
const hud = {
    left: { x: 30, y: canvas.height - 80, w: 60, h: 60, label: "⬅" },
    right: { x: 110, y: canvas.height - 80, w: 60, h: 60, label: "➡" },
    engine: { x: canvas.width - 90, y: canvas.height - 80, w: 60, h: 60, label: "🔥" }
};

// HUD throttle slider (mobile)
const throttleBar = {
    x: null, // set dynamically
    y: 100,
    w: 40,
    h: null, // set dynamically
    knobY: 0
};

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // update HUD positions
    hud.left.y = canvas.height - 80;
    hud.right.y = canvas.height - 80;
    hud.engine.x = canvas.width - 90;
    hud.engine.y = canvas.height - 80;

    // position throttle bar on right side
    throttleBar.x = canvas.width - 70;
    throttleBar.h = canvas.height - 200;
    throttleBar.knobY = throttleBar.y + throttleBar.h; // start at 0% throttle
}
resizeCanvas();
window.addEventListener("resize", () => {
    resizeCanvas();
    isMobile = window.innerWidth <= 768;
});

// touch input
canvas.addEventListener("touchstart", handleTouch, { passive: true });
canvas.addEventListener("touchmove", handleTouch, { passive: true });
canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

function handleTouch(e) {
    const rect = canvas.getBoundingClientRect();
    for (let touch of e.touches) {
        
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        console.log(x, y);
        
        // check throttle slider
        if (
            x > throttleBar.x && x < throttleBar.x + throttleBar.w &&
            y > throttleBar.y && y < throttleBar.y + throttleBar.h
        ) {
            throttleBar.knobY = y;
            const percent = 100 - ((y - throttleBar.y) / throttleBar.h) * 100;
            controls.throttle = Math.max(0, Math.min(100, Math.round(percent)));
        }

        // buttons
        if (inside(x, y, hud.left)) {
            controls.left = true;
            console.log("left clicked", x, y);
        }
        if (inside(x, y, hud.right)) {
            controls.right = true;
            console.log("right clicked", x, y);
        }
        if (inside(x, y, hud.engine)) {
            controls.engine = !controls.engine;
            console.log("engine clicked", x, y);
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

// draw HUD
function drawHUD() {
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // buttons
    Object.values(hud).forEach(btn => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "#fff";
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    });

    // throttle bar
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(throttleBar.x, throttleBar.y, throttleBar.w, throttleBar.h);
    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(throttleBar.x, throttleBar.y, throttleBar.w, throttleBar.h);

    // knob
    ctx.fillStyle = "#0f0";
    ctx.fillRect(throttleBar.x, throttleBar.knobY - 10, throttleBar.w, 20);

    // label
    ctx.fillStyle = "#0f0";
    ctx.fillText(`${controls.throttle}%`, throttleBar.x + throttleBar.w / 2, throttleBar.y - 20);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update rocket
    rocket.engineOn = controls.engine;
    rocket.throttle = controls.throttle;

    if (controls.left) rocket.angle -= 0.05;
    if (controls.right) rocket.angle += 0.05;

    rocket.update();
    rocket.draw(ctx);

    if (isMobile) {
        drawHUD();
    }

    requestAnimationFrame(animate);
}
animate();

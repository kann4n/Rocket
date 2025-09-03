class Rocket {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.engineOn = false;
    this.throttle = 0; // 0–100
  }

  update() {
    if (this.engineOn) {
      const thrust = this.throttle / 50; // scale force
      this.vx += Math.sin(this.angle) * thrust;
      this.vy -= Math.cos(this.angle) * thrust;
    }
    // gravity
    this.vy += 0.05;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "white";
    ctx.fillRect(-10, -20, 20, 40);

    if (this.engineOn && this.throttle > 0) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.moveTo(-8, 20);
      ctx.lineTo(8, 20);
      ctx.lineTo(0, 30 + Math.random() * 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

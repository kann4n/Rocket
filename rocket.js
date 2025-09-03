class Rocket {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.engineOn = false;
    this.throttle = 0; // 0–100
    
    // Constants
    this.GRAVITY = 0.05;
    this.THRUST_SCALE = 2; // Increased for better control
    this.ROTATION_SPEED = 0.05;
    this.MAX_VELOCITY = 15;
    this.DRAG = 0.998; // Air resistance
  }

  update(space) {
    // Engine thrust
    if (this.engineOn && this.throttle > 0) {
      const thrust = (this.throttle / 100) * this.THRUST_SCALE;
      this.vx += Math.sin(this.angle) * thrust;
      this.vy -= Math.cos(this.angle) * thrust;
    }
    
    // Gravity (reduced when far from planets)
    this.vy += this.GRAVITY;
    
    // Optional: Add planetary gravity
    if (space) {
      const gravForce = space.getGravitationalForce(this.x, this.y);
      this.vx += gravForce.x;
      this.vy += gravForce.y;
    }
    
    // Apply drag
    this.vx *= this.DRAG;
    this.vy *= this.DRAG;
    
    // Limit maximum velocity
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.MAX_VELOCITY) {
      this.vx = (this.vx / speed) * this.MAX_VELOCITY;
      this.vy = (this.vy / speed) * this.MAX_VELOCITY;
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Clamp to space boundaries
    if (space) {
      const clamped = space.clampToBounds(this.x, this.y);
      this.x = clamped.x;
      this.y = clamped.y;
      
      // Bounce off boundaries
      if (this.x <= space.bounds.left || this.x >= space.bounds.right) {
        this.vx = -this.vx * 0.5;
      }
      if (this.y <= space.bounds.top || this.y >= space.bounds.bottom) {
        this.vy = -this.vy * 0.5;
      }
    }
  }

  draw(ctx, space) {
    // Convert world coordinates to screen coordinates
    let screenPos = { x: this.x, y: this.y };
    if (space) {
      screenPos = space.worldToScreen(this.x, this.y);
    }
    
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(this.angle);
    
    // Draw rocket body
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-10, -20, 20, 40);
    
    // Draw rocket nose
    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(0, -30);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();
    
    // Draw fins
    ctx.fillStyle = "#888888";
    ctx.fillRect(-15, 10, 10, 15);
    ctx.fillRect(5, 10, 10, 15);
    
    // Draw engine flame
    if (this.engineOn && this.throttle > 0) {
      const flameIntensity = this.throttle / 100;
      const flameLength = 20 + Math.random() * 15 * flameIntensity;
      
      // Outer flame (orange/red)
      ctx.fillStyle = `rgba(255, ${100 + Math.random() * 50}, 0, ${flameIntensity})`;
      ctx.beginPath();
      ctx.moveTo(-8, 20);
      ctx.lineTo(8, 20);
      ctx.lineTo(0, 20 + flameLength);
      ctx.closePath();
      ctx.fill();
      
      // Inner flame (yellow/white)
      ctx.fillStyle = `rgba(255, 255, ${150 + Math.random() * 105}, ${flameIntensity * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(-5, 20);
      ctx.lineTo(5, 20);
      ctx.lineTo(0, 20 + flameLength * 0.7);
      ctx.closePath();
      ctx.fill();
      
      // Core flame (bright white)
      ctx.fillStyle = `rgba(255, 255, 255, ${flameIntensity * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(-3, 20);
      ctx.lineTo(3, 20);
      ctx.lineTo(0, 20 + flameLength * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw velocity vector (debug)
    if (space && false) { // Set to true to show velocity vector
      const velocityScale = 10;
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(
        screenPos.x + this.vx * velocityScale, 
        screenPos.y + this.vy * velocityScale
      );
      ctx.stroke();
    }
  }
  
  // Get rocket's current speed
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }
  
  // Get distance from a point
  getDistanceFrom(x, y) {
    return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
  }
}
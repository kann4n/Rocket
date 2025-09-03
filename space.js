class Space {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    
    // Camera offset for following the rocket
    this.cameraX = 0;
    this.cameraY = 0;
    
    // Space boundaries (world coordinates)
    this.bounds = {
      left: -2000,
      right: 2000,
      top: -3000,
      bottom: 1000
    };
    
    // Celestial bodies
    this.planets = [
      {
        x: 0,
        y: 800,
        radius: 200,
        color: "#4a4a8a",
        atmosphere: "#6666cc",
        name: "Home Planet"
      },
      {
        x: -800,
        y: -500,
        radius: 80,
        color: "#cc6666",
        atmosphere: "#ff8888",
        name: "Red Moon"
      },
      {
        x: 1200,
        y: -1200,
        radius: 150,
        color: "#66cc66",
        atmosphere: "#88ff88",
        name: "Green World"
      },
      {
        x: -1500,
        y: -2000,
        radius: 120,
        color: "#cccc66",
        atmosphere: "#ffff88",
        name: "Golden Sphere"
      }
    ];
    
    // Stars for background
    this.stars = [];
    this.generateStars();
  }
  
  generateStars() {
    // Generate random stars in world space
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * (this.bounds.right - this.bounds.left) + this.bounds.left,
        y: Math.random() * (this.bounds.top - this.bounds.bottom) + this.bounds.bottom,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5
      });
    }
  }
  
  updateCamera(rocketX, rocketY) {
    // Follow the rocket with smooth camera movement
    const targetCameraX = -rocketX + this.width / 2;
    const targetCameraY = -rocketY + this.height / 2;
    
    // Smooth camera following
    this.cameraX += (targetCameraX - this.cameraX) * 0.1;
    this.cameraY += (targetCameraY - this.cameraY) * 0.1;
  }
  
  worldToScreen(worldX, worldY) {
    return {
      x: worldX + this.cameraX,
      y: worldY + this.cameraY
    };
  }
  
  screenToWorld(screenX, screenY) {
    return {
      x: screenX - this.cameraX,
      y: screenY - this.cameraY
    };
  }
  
  isInBounds(x, y) {
    return x >= this.bounds.left && 
           x <= this.bounds.right && 
           y >= this.bounds.top && 
           y <= this.bounds.bottom;
  }
  
  clampToBounds(x, y) {
    return {
      x: Math.max(this.bounds.left, Math.min(this.bounds.right, x)),
      y: Math.max(this.bounds.top, Math.min(this.bounds.bottom, y))
    };
  }
  
  draw(ctx) {
    // Draw stars
    ctx.fillStyle = "#ffffff";
    this.stars.forEach(star => {
      const screenPos = this.worldToScreen(star.x, star.y);
      
      // Only draw stars that are on screen
      if (screenPos.x >= -10 && screenPos.x <= this.width + 10 && 
          screenPos.y >= -10 && screenPos.y <= this.height + 10) {
        
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add twinkle effect
        if (Math.random() < 0.01) {
          ctx.globalAlpha = star.brightness * 1.5;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.globalAlpha = 1;
    
    // Draw planets
    this.planets.forEach(planet => {
      const screenPos = this.worldToScreen(planet.x, planet.y);
      
      // Only draw planets that might be visible
      if (screenPos.x >= -planet.radius - 50 && screenPos.x <= this.width + planet.radius + 50 && 
          screenPos.y >= -planet.radius - 50 && screenPos.y <= this.height + planet.radius + 50) {
        
        // Draw atmosphere glow
        const gradient = ctx.createRadialGradient(
          screenPos.x, screenPos.y, planet.radius * 0.8,
          screenPos.x, screenPos.y, planet.radius * 1.3
        );
        gradient.addColorStop(0, planet.atmosphere + "40");
        gradient.addColorStop(1, planet.atmosphere + "00");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, planet.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw planet body
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some surface detail
        ctx.fillStyle = planet.color + "80";
        for (let i = 0; i < 3; i++) {
          const detailX = screenPos.x + (Math.cos(i * 2.1) * planet.radius * 0.6);
          const detailY = screenPos.y + (Math.sin(i * 2.1) * planet.radius * 0.6);
          ctx.beginPath();
          ctx.arc(detailX, detailY, planet.radius * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw planet name if close enough
        const distance = Math.sqrt(
          Math.pow(planet.x - (-this.cameraX + this.width / 2), 2) + 
          Math.pow(planet.y - (-this.cameraY + this.height / 2), 2)
        );
        
        if (distance < planet.radius * 3) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillText(planet.name, screenPos.x, screenPos.y - planet.radius - 20);
        }
      }
    });
  }
  
  // Get gravitational force from planets (optional feature)
  getGravitationalForce(x, y) {
    let totalForceX = 0;
    let totalForceY = 0;
    
    this.planets.forEach(planet => {
      const dx = planet.x - x;
      const dy = planet.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > planet.radius) {
        const force = (planet.radius * 0.001) / (distance * distance);
        totalForceX += (dx / distance) * force;
        totalForceY += (dy / distance) * force;
      }
    });
    
    return { x: totalForceX, y: totalForceY };
  }
}
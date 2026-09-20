/**
 * YNR FISHES — Marine Simulation & Kinetic Underwater Physics
 * Realistic fish spine undulation, prawn propulsion, volumetric lighting,
 * and multi-depth parallax mechanics.
 */

// Utility for smooth clamping and lerping
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Fish Class with Multi-Segment Spine Wave Undulation
 */
export class SimulatedFish {
  constructor({
    type = 'midground', // 'foreground', 'midground', 'background'
    x = 0,
    y = 0,
    speed = 1.2,
    direction = 1, // 1 = moving right, -1 = moving left
    scale = 1.0,
    palette = 'seer', // 'seer', 'pomfret', 'snapper'
  }) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.speed = speed;
    this.direction = direction;
    this.scale = scale;
    this.palette = palette;

    // Movement heading angle and vertical oscillation
    this.angle = direction === 1 ? 0 : Math.PI;
    this.targetAngle = this.angle;
    this.swimTime = Math.random() * 100;
    this.swimFrequency = 2.4 + Math.random() * 0.8;
    this.verticalWobblePhase = Math.random() * Math.PI * 2;
    this.verticalWobbleSpeed = 0.015 + Math.random() * 0.01;
    this.verticalWobbleAmp = 20 + Math.random() * 35;

    // Multi-segment spine configuration
    this.numSegments = type === 'foreground' ? 14 : (type === 'midground' ? 10 : 8);
    this.segmentLength = (type === 'foreground' ? 16 : (type === 'midground' ? 10 : 6)) * scale;
    
    // Spine joint positions
    this.spine = [];
    for (let i = 0; i < this.numSegments; i++) {
      this.spine.push({
        x: this.x - (i * this.segmentLength * direction),
        y: this.y,
        angle: this.angle
      });
    }

    // Depth attributes
    if (type === 'foreground') {
      this.depthZ = 1.0;
      this.opacity = 0.95;
      this.blur = 0;
      this.scrollParallax = 1.8;
    } else if (type === 'midground') {
      this.depthZ = 0.6;
      this.opacity = 0.75;
      this.blur = 0.5;
      this.scrollParallax = 1.0;
    } else {
      this.depthZ = 0.3;
      this.opacity = 0.45;
      this.blur = 2.0;
      this.scrollParallax = 0.45;
    }
  }

  update(dt, canvasWidth, canvasHeight, scrollOffset = 0) {
    this.swimTime += dt * this.swimFrequency;
    this.verticalWobblePhase += this.verticalWobbleSpeed;

    // Swimming forward
    const vx = Math.cos(this.angle) * this.speed * (canvasWidth / 1200);
    const vy = Math.sin(this.angle) * this.speed * 0.5 + Math.sin(this.verticalWobblePhase) * 0.35;

    this.x += vx;
    this.y += vy;

    // Edge wrapping: smoothly recycle fish from beyond screen borders
    const margin = 200 * this.scale;
    if (this.direction === 1 && this.x > canvasWidth + margin) {
      this.x = -margin;
      this.y = 80 + Math.random() * (canvasHeight - 160);
      this.baseY = this.y;
    } else if (this.direction === -1 && this.x < -margin) {
      this.x = canvasWidth + margin;
      this.y = 80 + Math.random() * (canvasHeight - 160);
      this.baseY = this.y;
    }

    // Update head position
    this.spine[0].x = this.x;
    // Apply scroll parallax to vertical position
    const visualY = this.y - (scrollOffset * this.scrollParallax * 120);
    this.spine[0].y = visualY;
    this.spine[0].angle = this.angle;

    // Propagate wave down the spine (fish swimming wave equation)
    const waveAmp = (this.type === 'foreground' ? 1.3 : 1.0) * this.scale;
    for (let i = 1; i < this.numSegments; i++) {
      const prev = this.spine[i - 1];
      const curr = this.spine[i];

      // Lateral swish increases quadratically toward the caudal fin
      const progression = i / this.numSegments;
      const swish = Math.sin(this.swimTime - progression * 3.8) * progression * waveAmp * 12;

      // Desired distance constraint
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const targetAngle = Math.atan2(dy, dx);
      curr.angle = targetAngle;

      curr.x = prev.x + (dx / dist) * this.segmentLength;
      curr.y = prev.y + (dy / dist) * this.segmentLength + (swish * 0.2);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Body profile widths along spine segments
    const widths = [];
    for (let i = 0; i < this.numSegments; i++) {
      const p = i / (this.numSegments - 1);
      // Natural hydrodynamic fish spindle shape (thickest around 25-35% from head)
      let w = Math.sin(p * Math.PI) * Math.pow(1 - p * 0.45, 0.7);
      if (this.palette === 'pomfret') {
        w = Math.sin(p * Math.PI * 0.95) * 1.5; // Pomfret has deep, diamond-round body
      }
      widths.push(w * 22 * this.scale);
    }

    // Compute left and right body contour points
    const leftPoints = [];
    const rightPoints = [];

    for (let i = 0; i < this.numSegments; i++) {
      const joint = this.spine[i];
      let normal = joint.angle + Math.PI / 2;
      const w = widths[i];

      leftPoints.push({
        x: joint.x + Math.cos(normal) * w,
        y: joint.y + Math.sin(normal) * w
      });
      rightPoints.push({
        x: joint.x - Math.cos(normal) * w,
        y: joint.y - Math.sin(normal) * w
      });
    }

    // Draw caudal (tail) fin
    const tailIndex = this.numSegments - 1;
    const tailJoint = this.spine[tailIndex];
    const tailDir = this.direction;
    const tailAngle = tailJoint.angle;

    ctx.fillStyle = this.getFinColor();
    ctx.beginPath();
    ctx.moveTo(tailJoint.x, tailJoint.y);
    const finLength = 36 * this.scale;
    const finSpread = 28 * this.scale;

    // Forked caudal fin
    const fTopX = tailJoint.x - Math.cos(tailAngle) * finLength + Math.sin(tailAngle) * finSpread;
    const fTopY = tailJoint.y - Math.sin(tailAngle) * finLength - Math.cos(tailAngle) * finSpread;
    const fMidX = tailJoint.x - Math.cos(tailAngle) * (finLength * 0.55);
    const fMidY = tailJoint.y - Math.sin(tailAngle) * (finLength * 0.55);
    const fBotX = tailJoint.x - Math.cos(tailAngle) * finLength - Math.sin(tailAngle) * finSpread;
    const fBotY = tailJoint.y - Math.sin(tailAngle) * finLength + Math.cos(tailAngle) * finSpread;

    ctx.lineTo(fTopX, fTopY);
    ctx.quadraticCurveTo(fMidX, fMidY, fBotX, fBotY);
    ctx.closePath();
    ctx.fill();

    // Draw Dorsal fin (flows along top segments 2 to 6)
    if (this.spine.length >= 7) {
      ctx.beginPath();
      const dStart = leftPoints[2];
      const dMid = leftPoints[4];
      const dEnd = leftPoints[6];
      const dNormal = this.spine[4].angle + Math.PI / 2;
      const dHeight = 16 * this.scale;

      ctx.moveTo(dStart.x, dStart.y);
      ctx.quadraticCurveTo(
        dMid.x + Math.cos(dNormal) * dHeight,
        dMid.y + Math.sin(dNormal) * dHeight,
        dEnd.x,
        dEnd.y
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw main Fish Body with smooth gradient counter-shading
    ctx.beginPath();
    ctx.moveTo(this.spine[0].x, this.spine[0].y);

    // Head snout
    const headX = this.spine[0].x + Math.cos(this.angle) * (18 * this.scale);
    const headY = this.spine[0].y + Math.sin(this.angle) * (18 * this.scale);
    ctx.lineTo(headX, headY);

    // Left contour
    for (let i = 0; i < leftPoints.length; i++) {
      ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }
    // Tail tip
    ctx.lineTo(tailJoint.x, tailJoint.y);
    // Right contour backward
    for (let i = rightPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    ctx.closePath();

    // Natural Marine Gradient (Sunlit dorsal back, silvery/iridescent belly)
    const bodyGrad = ctx.createLinearGradient(
      this.spine[0].x,
      this.spine[0].y - 30 * this.scale,
      this.spine[0].x,
      this.spine[0].y + 30 * this.scale
    );

    if (this.palette === 'seer') {
      bodyGrad.addColorStop(0, '#0c4760'); // Deep ocean dorsal
      bodyGrad.addColorStop(0.35, '#197c92'); // Metallic blue-green
      bodyGrad.addColorStop(0.55, '#3ec5ce'); // Iridescent lateral line
      bodyGrad.addColorStop(1, '#a6e8eb'); // Silvery counter-shaded belly
    } else if (this.palette === 'pomfret') {
      bodyGrad.addColorStop(0, '#103e51');
      bodyGrad.addColorStop(0.4, '#2aa2b0');
      bodyGrad.addColorStop(0.7, '#62d7de');
      bodyGrad.addColorStop(1, '#d8f6f7');
    } else {
      // Sea Bream / Snapper
      bodyGrad.addColorStop(0, '#0f4f5f');
      bodyGrad.addColorStop(0.4, '#1b8b9b');
      bodyGrad.addColorStop(0.8, '#41cbd4');
      bodyGrad.addColorStop(1, '#bcf2f4');
    }

    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Pectoral fin fluttering
    const pecSegment = this.spine[1] || this.spine[0];
    const pecAngle = pecSegment.angle + Math.PI / 2 + Math.sin(this.swimTime * 1.5) * 0.4;
    const pecLen = 22 * this.scale;
    ctx.beginPath();
    ctx.moveTo(pecSegment.x, pecSegment.y);
    ctx.lineTo(
      pecSegment.x + Math.cos(pecAngle) * pecLen - Math.cos(pecSegment.angle) * 10 * this.scale,
      pecSegment.y + Math.sin(pecAngle) * pecLen - Math.sin(pecSegment.angle) * 10 * this.scale
    );
    ctx.lineTo(pecSegment.x - Math.cos(pecSegment.angle) * 6 * this.scale, pecSegment.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(114, 222, 229, 0.45)';
    ctx.fill();

    // Fish Eye (only clearly rendered on foreground & midground)
    if (this.type !== 'background') {
      const eyeOffsetDist = 12 * this.scale;
      const eyeAngle = this.angle - (this.direction === 1 ? 0.35 : -0.35);
      const eyeX = this.spine[0].x + Math.cos(eyeAngle) * eyeOffsetDist;
      const eyeY = this.spine[0].y + Math.sin(eyeAngle) * eyeOffsetDist;

      // Sclera / ring
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.2 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#67dbe0';
      ctx.fill();

      // Pupil
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 1.8 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#02121e';
      ctx.fill();

      // Specular shine glint
      ctx.beginPath();
      ctx.arc(eyeX - 0.7 * this.scale, eyeY - 0.7 * this.scale, 0.8 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }

  getFinColor() {
    if (this.type === 'foreground') {
      return 'rgba(61, 192, 204, 0.65)';
    } else if (this.type === 'midground') {
      return 'rgba(35, 161, 175, 0.45)';
    }
    return 'rgba(14, 86, 114, 0.35)';
  }
}

/**
 * Prawn / Shrimp Class with Characteristic Kick-and-Glide Movement
 * Anatomical carapace, antennae, abdominal segments, and pleopods.
 */
export class SimulatedPrawn {
  constructor({
    x = 0,
    y = 0,
    direction = 1,
    scale = 1.0,
    depthZ = 0.8
  }) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.scale = scale;
    this.depthZ = depthZ;

    // Movement state machine: 'gliding' or 'kicking'
    this.state = 'gliding';
    this.timer = Math.random() * 3;
    this.kickPower = 0;
    this.angle = direction === 1 ? -0.15 : Math.PI + 0.15;
    this.baseSpeed = 0.35;
    this.vx = 0;
    this.vy = 0;

    // Segment articulation (curved natural posture)
    this.curlAmount = 0.18;
    this.antennaeSway = 0;
  }

  update(dt, canvasWidth, canvasHeight, scrollOffset = 0) {
    this.timer += dt;
    this.antennaeSway += dt * 2.5;

    // Kick cycle triggers periodically (realistic crustacean caridoid burst)
    if (this.state === 'gliding') {
      if (this.timer > 2.8 + Math.random() * 2.0) {
        this.state = 'kicking';
        this.timer = 0;
        this.kickPower = 3.5 * this.scale;
        // Prawn kicks backwards/upwards
        this.vx = (this.direction === 1 ? 1 : -1) * 2.2;
        this.vy = -1.2 + (Math.random() - 0.5) * 0.8;
      } else {
        // Slow gentle drift with swimmerets
        this.vx = (this.direction === 1 ? 0.6 : -0.6) * this.baseSpeed;
        this.vy = Math.sin(this.timer * 1.5) * 0.25;
      }
    } else if (this.state === 'kicking') {
      // Fluid drag decelerates the kick
      this.vx *= 0.94;
      this.vy *= 0.94;
      if (this.timer > 0.65) {
        this.state = 'gliding';
        this.timer = 0;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Edge wrapping
    const margin = 120 * this.scale;
    if (this.direction === 1 && this.x > canvasWidth + margin) {
      this.x = -margin;
      this.y = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.5);
    } else if (this.direction === -1 && this.x < -margin) {
      this.x = canvasWidth + margin;
      this.y = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.5);
    }
  }

  draw(ctx, scrollOffset = 0) {
    ctx.save();
    const visualY = this.y - (scrollOffset * 0.9 * 100);
    ctx.translate(this.x, visualY);

    if (this.direction === -1) {
      ctx.scale(-1, 1);
    }

    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = 0.85;

    // Draw Long Graceful Sensory Antennae (two sweeping curves)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'; // Amber gold translucent
    ctx.lineWidth = 1.0;
    
    // Antenna 1
    ctx.beginPath();
    ctx.moveTo(25, -4);
    const antWave1 = Math.sin(this.antennaeSway) * 6;
    ctx.bezierCurveTo(45, -25 + antWave1, 75, -35, 110, -25 + antWave1 * 1.5);
    ctx.stroke();

    // Antenna 2
    ctx.strokeStyle = 'rgba(61, 192, 204, 0.4)';
    ctx.beginPath();
    ctx.moveTo(25, -2);
    const antWave2 = Math.cos(this.antennaeSway * 0.8) * 8;
    ctx.bezierCurveTo(40, -15 + antWave2, 80, -15, 130, -5 + antWave2);
    ctx.stroke();

    // Draw Cephalothorax (Head Carapace & Rostrum)
    const headGrad = ctx.createLinearGradient(0, -15, 25, 10);
    headGrad.addColorStop(0, 'rgba(42, 162, 176, 0.7)');
    headGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.55)');
    headGrad.addColorStop(1, 'rgba(14, 86, 114, 0.75)');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(25, 0); // Head point
    ctx.lineTo(35, -4); // Pointed Rostrum spine
    ctx.quadraticCurveTo(24, -6, 15, -10);
    ctx.quadraticCurveTo(0, -12, -8, -6);
    ctx.closePath();
    ctx.fill();

    // Rostrum serration teeth
    ctx.strokeStyle = 'rgba(238, 216, 152, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(24, -4);
    ctx.lineTo(35, -4);
    ctx.stroke();

    // Dark Stalked Eye
    ctx.fillStyle = '#010c14';
    ctx.beginPath();
    ctx.arc(20, -5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#72dee5';
    ctx.beginPath();
    ctx.arc(19.3, -5.6, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Segmented Curved Abdomen (6 overlapping abdominal plates)
    const segments = 6;
    let segX = -8;
    let segY = -6;
    let currentCurl = 0;

    for (let s = 0; s < segments; s++) {
      currentCurl += this.curlAmount * (this.state === 'kicking' ? 1.4 : 1.0);
      const nextX = segX - Math.cos(currentCurl) * 9;
      const nextY = segY + Math.sin(currentCurl) * 6;

      ctx.fillStyle = (s % 2 === 0)
        ? 'rgba(42, 162, 176, 0.65)'
        : 'rgba(212, 175, 55, 0.45)';
      ctx.strokeStyle = 'rgba(61, 192, 204, 0.3)';
      ctx.lineWidth = 0.7;

      ctx.beginPath();
      ctx.ellipse(
        (segX + nextX) / 2,
        (segY + nextY) / 2,
        7 - s * 0.7,
        5 - s * 0.4,
        currentCurl,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();

      // Pleopods (swimming paddle feet fluttering beneath abdomen)
      if (s >= 1 && s <= 4) {
        ctx.strokeStyle = 'rgba(114, 222, 229, 0.4)';
        ctx.lineWidth = 1;
        const paddleWave = Math.sin(this.antennaeSway * 2 + s) * 4;
        ctx.beginPath();
        ctx.moveTo(segX, segY + 4);
        ctx.lineTo(segX - 3, segY + 11 + paddleWave);
        ctx.stroke();
      }

      segX = nextX;
      segY = nextY;
    }

    // Uropods & Telson (Fan tail)
    ctx.fillStyle = 'rgba(61, 192, 204, 0.55)';
    ctx.beginPath();
    ctx.moveTo(segX, segY);
    ctx.lineTo(segX - 14, segY - 5);
    ctx.lineTo(segX - 16, segY + 3);
    ctx.lineTo(segX - 12, segY + 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Volumetric Sun Rays & Caustic Light Simulation
 */
export class VolumetricRays {
  constructor(canvasWidth, canvasHeight) {
    this.rays = [];
    this.init(canvasWidth, canvasHeight);
  }

  init(width, height) {
    this.rays = [
      { x: width * 0.15, topWidth: 60, bottomWidth: 240, baseAlpha: 0.14, speed: 0.0008, phase: 0 },
      { x: width * 0.32, topWidth: 90, bottomWidth: 320, baseAlpha: 0.22, speed: 0.0011, phase: 1.2 },
      { x: width * 0.48, topWidth: 70, bottomWidth: 280, baseAlpha: 0.18, speed: 0.0009, phase: 2.8 },
      { x: width * 0.65, topWidth: 100, bottomWidth: 360, baseAlpha: 0.24, speed: 0.0013, phase: 4.1 },
      { x: width * 0.82, topWidth: 80, bottomWidth: 300, baseAlpha: 0.16, speed: 0.0010, phase: 5.5 },
    ];
  }

  draw(ctx, width, height, time, scrollProgress = 0) {
    // Rays fade as user dives deeper into the dark ocean
    const depthFade = Math.max(0, 1 - scrollProgress * 1.25);
    if (depthFade <= 0.01) return;

    ctx.save();
    for (const ray of this.rays) {
      const alphaWave = Math.sin(time * ray.speed + ray.phase) * 0.06;
      const alpha = Math.max(0, (ray.baseAlpha + alphaWave) * depthFade);

      const grad = ctx.createLinearGradient(ray.x, 0, ray.x + 120, height);
      grad.addColorStop(0, `rgba(166, 232, 235, ${alpha * 1.5})`);
      grad.addColorStop(0.35, `rgba(61, 192, 204, ${alpha * 0.8})`);
      grad.addColorStop(0.8, `rgba(19, 119, 143, ${alpha * 0.3})`);
      grad.addColorStop(1, 'rgba(7, 42, 66, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Ray originates slightly above screen top and casts down diagonally
      const topOffset = ray.topWidth / 2;
      const botOffset = ray.bottomWidth / 2;
      const slant = 140;

      ctx.moveTo(ray.x - topOffset, -20);
      ctx.lineTo(ray.x + topOffset, -20);
      ctx.lineTo(ray.x + botOffset + slant, height);
      ctx.lineTo(ray.x - botOffset + slant, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * Floating Micro-Particles (Marine Snow) & Rising Micro-Bubbles
 */
export class ParticleSystem {
  constructor(count, width, height) {
    this.particles = [];
    this.bubbles = [];

    // Marine snow particles
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.0 + Math.random() * 2.2,
        speedY: 0.2 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.5,
        depth: 0.3 + Math.random() * 0.7
      });
    }

    // Micro-bubbles
    const bubbleCount = Math.floor(count * 0.25);
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.8 + Math.random() * 3.5,
        speedY: 0.8 + Math.random() * 1.4,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleAmp: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.35 + Math.random() * 0.45
      });
    }
  }

  updateAndDraw(ctx, width, height, scrollOffset = 0) {
    ctx.save();

    // Render Marine Snow Particles
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(p.phase) * 0.25 + p.speedX;
      p.phase += 0.015;

      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      const visualY = (p.y - scrollOffset * p.depth * 150) % (height + 20);
      const renderedY = visualY < 0 ? visualY + height : visualY;

      ctx.beginPath();
      ctx.arc(p.x, renderedY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(166, 232, 235, ${p.alpha})`;
      ctx.fill();
    }

    // Render Rising Organic Bubbles
    for (const b of this.bubbles) {
      b.y -= b.speedY;
      b.x += Math.sin(b.phase) * b.wobbleAmp;
      b.phase += b.wobbleSpeed;

      if (b.y < -20) {
        b.y = height + 20;
        b.x = Math.random() * width;
      }

      const visualY = (b.y - scrollOffset * 100) % (height + 30);
      const renderedY = visualY < 0 ? visualY + height : visualY;

      // Bubble outer rim
      ctx.beginPath();
      ctx.arc(b.x, renderedY, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(61, 192, 204, ${b.alpha * 0.25})`;
      ctx.strokeStyle = `rgba(166, 232, 235, ${b.alpha})`;
      ctx.lineWidth = 0.75;
      ctx.fill();
      ctx.stroke();

      // Micro specular highlight
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, renderedY - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();
    }

    ctx.restore();
  }
}

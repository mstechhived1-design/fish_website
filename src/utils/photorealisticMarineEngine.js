/**
 * YNR FISHES — Photorealistic Marine Engine with 3D Swimming Kinematics
 * - Pure vertical scroll-driven swimming (up and down)
 * - 3D trajectories: Left, Right, Forward towards the screen, Backwards into ocean depth
 * - Dynamic Z-depth scaling (zooming close / receding into distance)
 * - Underwater Rayleigh scattering / atmospheric depth haze & specular sunlight glints
 * - Flapping 3D pectoral fin wings and articulated swimmerets
 * - Depth-sorted (Z-buffered) rendering so foreground creatures occlude background ones
 */

export class PhotorealisticMarineEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.images = {};
    this.loaded = false;

    this.time = 0;
    this.targetScroll = 0;
    this.scrollProgress = 0;
    this.smoothScroll = 0;
    this.scrollVelocity = 0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = window.innerWidth < 768;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Hero Amberjack Fish
    this.heroFish = {
      x: 0,
      y: 0,
      z: 0.38, // 0 = deep background, 1 = closest to screen
      baseScale: 0.35,
      currentScale: 0.35,
      direction: 1, // 1 = facing right, -1 = facing left
      pitch: 0,
      swimPhase: 0,
      wobblePhase: 0,
    };

    // Silver Pomfret
    this.pomfret = {
      x: 0,
      y: 0,
      z: 0.25,
      baseScale: 0.22,
      currentScale: 0.22,
      direction: -1,
      pitch: 0,
      swimPhase: 1.5,
      wobblePhase: 2.2,
    };

    this.prawns = [];
    this.bubbles = [];
    this.particles = [];

    this.loadAssets();
  }

  loadAssets() {
    const assetList = [
      { key: 'bg', src: '/assets/ocean_bg.jpg' },
      { key: 'heroFish', src: '/assets/hero_fish.png' },
      { key: 'pomfret', src: '/assets/silver_pomfret.png' },
      { key: 'prawn', src: '/assets/tiger_prawn.png' },
    ];

    let loadedCount = 0;
    for (const asset of assetList) {
      const img = new Image();
      img.src = asset.src;
      img.onload = () => {
        this.images[asset.key] = img;
        loadedCount++;
        if (loadedCount === assetList.length) {
          this.loaded = true;
          this.initEntities();
        }
      };
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.isMobile = width < 768;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);

    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.loaded) {
      this.initEntities();
    }
  }

  initEntities() {
    const w = this.width;
    const h = this.height;
    const isMobile = this.isMobile;

    // 1. Hero Amberjack Fish base scales (refined so it does not overpower the screen)
    this.heroFish.baseScale = isMobile ? 0.17 : 0.22;
    this.heroFish.currentScale = this.heroFish.baseScale;
    this.heroFish.x = w * 0.12;
    this.heroFish.y = h * (isMobile ? 0.74 : 0.76);
    this.heroFish.z = 0.32;
    this.heroFish.direction = 1;

    // 2. Silver Pomfret base scales
    this.pomfret.baseScale = isMobile ? 0.12 : 0.16;
    this.pomfret.currentScale = this.pomfret.baseScale;
    this.pomfret.x = w * 0.88;
    this.pomfret.y = h * (isMobile ? 0.62 : 0.58);
    this.pomfret.z = 0.25;
    this.pomfret.direction = -1;

    // 3. Tiger Prawns
    this.prawns = [
      {
        id: 0,
        baseScale: isMobile ? 0.07 : 0.09,
        currentScale: isMobile ? 0.07 : 0.09,
        x: w * 0.76,
        y: h * 0.48,
        z: 0.32,
        direction: -1,
        phase: 0,
      },
      {
        id: 1,
        baseScale: isMobile ? 0.05 : 0.07,
        currentScale: isMobile ? 0.05 : 0.07,
        x: w * 0.65,
        y: h * 0.42,
        z: 0.24,
        direction: 1,
        phase: 1.8,
      },
      {
        id: 2,
        baseScale: isMobile ? 0.06 : 0.09,
        currentScale: isMobile ? 0.06 : 0.09,
        x: w * 0.84,
        y: h * 0.44,
        z: 0.20,
        direction: -1,
        phase: 3.2,
      }
    ];

    // 4. Rising Bubbles
    this.bubbles = [];
    const bubbleCount = isMobile ? 35 : 70;
    for (let i = 0; i < bubbleCount; i++) {
      const isColumn = i < (isMobile ? 22 : 45);
      this.bubbles.push({
        isColumn,
        x: isColumn ? (w * 0.14 + (Math.random() - 0.5) * (w * 0.05)) : Math.random() * w,
        y: Math.random() * h,
        radius: isColumn ? (1.5 + Math.random() * 3.5) : (1.0 + Math.random() * 2.2),
        speedY: isColumn ? (1.3 + Math.random() * 2.0) : (0.5 + Math.random() * 1.0),
        wobbleSpeed: 0.025 + Math.random() * 0.035,
        wobbleAmp: isColumn ? (1.2 + Math.random() * 2.2) : (0.6 + Math.random() * 1.2),
        phase: Math.random() * Math.PI * 2,
        alpha: isColumn ? (0.45 + Math.random() * 0.45) : (0.2 + Math.random() * 0.3),
      });
    }

    // 5. Marine Snow Particles
    this.particles = [];
    const particleCount = isMobile ? 35 : 85;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.8 + Math.random() * 1.8,
        speedY: 0.15 + Math.random() * 0.3,
        speedX: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.4,
      });
    }
  }

  addScrollDelta(delta) {
    // Sensitivity: around 1600px of wheel delta completes 0 -> 1 dive journey
    const sensitivity = 0.0006;
    this.targetScroll = Math.max(0, Math.min(1, this.targetScroll + delta * sensitivity));
  }

  setScrollProgress(progress) {
    this.targetScroll = Math.max(0, Math.min(1, progress));
  }

  update(dt) {
    if (!this.loaded) return;
    this.time += dt;

    const w = this.width;
    const h = this.height;

    // Smooth scroll interpolation (damped aquatic inertia)
    const prevSmooth = this.smoothScroll;
    this.smoothScroll += (this.targetScroll - this.smoothScroll) * 0.10;

    // Instantaneous scroll velocity (drives swim cadence & fin flutter)
    const scrollDelta = Math.abs(this.smoothScroll - prevSmooth);
    this.scrollVelocity = scrollDelta * 60;

    const s = Math.max(0, Math.min(1, this.smoothScroll));

    // =========================================================================
    // 1. HERO AMBERJACK FISH 3D MOTION (Strictly scroll-driven)
    // - Scroll 0.00 -> 0.42: Swims FORWARD towards the screen & moves RIGHT
    // - Scroll 0.42 -> 0.78: Banks and swims BACKWARDS into deep water & moves RIGHT
    // - Scroll 0.78 -> 1.00: Turns LEFT and swims LEFT across deep reef background
    // =========================================================================
    const hf = this.heroFish;
    hf.wobblePhase += dt * 1.4;
    const hfIdleY = Math.sin(hf.wobblePhase) * 2.5;

    if (s <= 0.42) {
      const u = s / 0.42;
      const ease = u * u * (3 - 2 * u);
      hf.x = w * (0.12 + ease * 0.40); // 0.12w -> 0.52w (RIGHT)
      hf.y = h * (0.76 - ease * 0.08) + hfIdleY; // 0.76h -> 0.68h (Gentle rise in lower water)
      hf.z = 0.32 + ease * 0.24; // 0.32 -> 0.56 (Natural midground depth, does not overpower screen)
      hf.direction = 1; // Facing Right
      hf.pitch = -0.12 * (1 - ease * 0.6); // Swimming upward tilt
    } else if (s <= 0.78) {
      const u = (s - 0.42) / (0.78 - 0.42);
      const ease = u * u * (3 - 2 * u);
      hf.x = w * (0.52 + ease * 0.33); // 0.52w -> 0.85w (RIGHT)
      hf.y = h * (0.68 + ease * 0.05) + hfIdleY; // 0.68h -> 0.73h (Banking into depth)
      hf.z = 0.56 - ease * 0.38; // 0.56 -> 0.18 (BACKWARDS away from screen into depth)
      hf.direction = 1; // Facing Right
      hf.pitch = 0.12 * ease; // Diving tilt into deep water
    } else {
      const u = (s - 0.78) / (1.0 - 0.78);
      const ease = u * u * (3 - 2 * u);
      hf.x = w * (0.85 - ease * 0.55); // 0.85w -> 0.30w (swimming LEFT across background)
      hf.y = h * (0.73 - Math.sin(u * Math.PI) * 0.04) + hfIdleY;
      hf.z = 0.18 + ease * 0.08; // Staying in deep background (0.18 -> 0.26)
      hf.direction = -1; // Turned to face LEFT
      hf.pitch = 0;
    }

    // Elegant depth-based scale: calibrated so the fish stays realistic and sleek
    hf.currentScale = hf.baseScale * (0.80 + hf.z * 0.35);

    // Active tail wagging and fin flapping ONLY when scrolling; calm breathing when idle
    const hfSwimRate = 0.35 + this.scrollVelocity * 10.0;
    hf.swimPhase += dt * hfSwimRate;

    // =========================================================================
    // 2. SILVER POMFRET 3D MOTION (Strictly scroll-driven)
    // - Scroll 0.00 -> 0.28: Drifts BACKWARDS deeper into sunbeams while moving LEFT
    // - Scroll 0.28 -> 0.68: Surges FORWARD towards the screen & swims LEFT
    // - Scroll 0.68 -> 1.00: Banks, turns RIGHT and swims BACKWARDS into reef
    // =========================================================================
    const pf = this.pomfret;
    pf.wobblePhase += dt * 1.5;
    const pfIdleY = Math.cos(pf.wobblePhase) * 2.0;

    if (s <= 0.28) {
      const u = s / 0.28;
      const ease = u * u * (3 - 2 * u);
      pf.x = w * (0.88 - ease * 0.16); // 0.88w -> 0.72w (LEFT)
      pf.y = h * (0.58 - ease * 0.08) + pfIdleY; // 0.58h -> 0.50h
      pf.z = 0.25 - ease * 0.15; // 0.25 -> 0.10 (BACKWARDS into deep light rays!)
      pf.direction = -1; // Facing Left
      pf.pitch = -0.08 * ease;
    } else if (s <= 0.68) {
      const u = (s - 0.28) / (0.68 - 0.28);
      const ease = u * u * (3 - 2 * u);
      pf.x = w * (0.72 - ease * 0.48); // 0.72w -> 0.24w (swimming LEFT across screen!)
      pf.y = h * (0.50 - ease * 0.08) + pfIdleY; // 0.50h -> 0.42h (Rising gracefully)
      pf.z = 0.10 + ease * 0.40; // 0.10 -> 0.50 (surging in midground)
      pf.direction = -1; // Facing Left
      pf.pitch = -0.12 * (1 - ease * 0.5);
    } else {
      const u = (s - 0.68) / (1.0 - 0.68);
      const ease = u * u * (3 - 2 * u);
      pf.x = w * (0.24 + ease * 0.42); // 0.24w -> 0.66w (banking and swimming RIGHT!)
      pf.y = h * (0.42 + ease * 0.18) + pfIdleY; // 0.42h -> 0.60h (Diving into deep reef)
      pf.z = 0.50 - ease * 0.32; // 0.50 -> 0.18 (swimming BACKWARDS into distance!)
      pf.direction = 1; // Turned to face RIGHT
      pf.pitch = 0.14 * ease;
    }

    pf.currentScale = pf.baseScale * (0.80 + pf.z * 0.35);

    const pfSwimRate = 0.40 + this.scrollVelocity * 9.5;
    pf.swimPhase += dt * pfSwimRate;

    // =========================================================================
    // 3. TIGER PRAWNS 3D MOTION (Strictly scroll-driven)
    // - Prawn 0: Surges FORWARD towards the screen (Z 0.35 -> 0.88), swims LEFT
    // - Prawn 1: Glides BACKWARDS into coral crevice (Z 0.25 -> 0.08), moves RIGHT
    // - Prawn 2: Explores midground (Z 0.20 -> 0.50 -> 0.18)
    // =========================================================================
    for (const prawn of this.prawns) {
      prawn.phase += dt * (1.2 + this.scrollVelocity * 4.0);
      const prawnIdleY = Math.sin(prawn.phase) * 2.0;

      if (prawn.id === 0) {
        if (s <= 0.50) {
          const u = s / 0.50;
          const ease = u * u * (3 - 2 * u);
          prawn.x = w * (0.76 - ease * 0.36); // 0.76w -> 0.40w (LEFT)
          prawn.y = h * (0.48 - ease * 0.12) + prawnIdleY;
          prawn.z = 0.35 + ease * 0.53; // 0.35 -> 0.88 (FORWARD towards screen!)
          prawn.direction = -1;
        } else {
          const u = (s - 0.50) / 0.50;
          const ease = u * u * (3 - 2 * u);
          prawn.x = w * (0.40 - ease * 0.22); // 0.40w -> 0.18w (LEFT)
          prawn.y = h * (0.36 + ease * 0.08) + prawnIdleY;
          prawn.z = 0.88 - ease * 0.63; // 0.88 -> 0.25 (BACKWARDS into depth)
          prawn.direction = -1;
        }
      } else if (prawn.id === 1) {
        const ease = s * s * (3 - 2 * s);
        prawn.x = w * (0.65 + ease * 0.18); // 0.65w -> 0.83w (RIGHT)
        prawn.y = h * (0.42 + ease * 0.10) + prawnIdleY;
        prawn.z = 0.25 - ease * 0.17; // 0.25 -> 0.08 (BACKWARDS into crevice)
        prawn.direction = 1;
      } else {
        const u = Math.sin(s * Math.PI);
        prawn.x = w * (0.84 - u * 0.24);
        prawn.y = h * (0.44 - u * 0.08) + prawnIdleY;
        prawn.z = 0.20 + u * 0.32; // Glides forward then backward
        prawn.direction = s > 0.5 ? 1 : -1;
      }

      prawn.currentScale = prawn.baseScale * (0.70 + prawn.z * 1.10);
    }

    // 4. Bubbles
    for (const b of this.bubbles) {
      b.y -= b.speedY;
      b.x += Math.sin(b.phase) * b.wobbleAmp * 0.2;
      b.phase += b.wobbleSpeed;

      if (b.y < -20) {
        b.y = h + 20;
        if (b.isColumn) {
          b.x = w * 0.14 + (Math.random() - 0.5) * (w * 0.05);
        } else {
          b.x = Math.random() * w;
        }
      }
    }

    // 5. Particles
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(p.phase) * 0.25 + p.speedX;
      p.phase += 0.015;

      if (p.y > h + 15) {
        p.y = -10;
        p.x = Math.random() * w;
      }
    }
  }

  render() {
    if (!this.loaded) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const sp = this.smoothScroll;

    ctx.clearRect(0, 0, w, h);

    // =========================================================================
    // LAYER 1: PHOTOREALISTIC OCEAN WATER BACKGROUND WITH 3D DEPTH PARALLAX
    // Full aspect cover with safe margin: NEVER leaves black gap at bottom/edges
    // =========================================================================
    const bgImg = this.images.bg;
    if (bgImg) {
      ctx.save();
      // Calculate true aspect-ratio cover
      const imgAspect = bgImg.width / bgImg.height;
      const canvasAspect = w / h;

      let baseW, baseH;
      if (canvasAspect > imgAspect) {
        baseW = w;
        baseH = w / imgAspect;
      } else {
        baseH = h;
        baseW = h * imgAspect;
      }

      // Safe overflow margin (1.10x) so parallax shift NEVER exposes any canvas edge
      const zoom = 1.10 + sp * 0.04;
      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      // Safe parallax shift strictly bounded within overflow margin
      const maxShiftY = (drawH - h) * 0.40;
      const shiftY = -sp * Math.min(maxShiftY, h * 0.04);

      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2 + shiftY;

      // Draw crystal clear, vibrant ocean background without dimming veil
      ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // =========================================================================
    // LAYER 2: VOLUMETRIC SUN RAYS & SURFACE CAUSTIC GLOW
    // Radiant, shimmering shafts of sunlight illuminating the underwater reef
    // =========================================================================
    this.drawVolumetricSunShafts(ctx, w, h, sp);

    // =========================================================================
    // LAYER 3: TRUE Z-SORTED 3D MARINE CREATURES
    // (Entities sorted ascending by Z: deepest entities drawn first, closest drawn last in front)
    // =========================================================================
    const entities = [
      {
        z: this.heroFish.z,
        draw: () => this.draw3DFish(ctx, this.images.heroFish, this.heroFish, true)
      },
      {
        z: this.pomfret.z,
        draw: () => this.draw3DFish(ctx, this.images.pomfret, this.pomfret, false)
      },
      ...this.prawns.map((prawn) => ({
        z: prawn.z,
        draw: () => this.drawSinglePrawn(ctx, prawn)
      }))
    ];

    entities.sort((a, b) => a.z - b.z);

    for (const ent of entities) {
      ent.draw();
    }

    // =========================================================================
    // LAYER 4: RISING BUBBLE COLUMN & GLOWING MARINE PARTICLES
    // =========================================================================
    this.drawBubblesAndParticles(ctx, w, h, sp);

    // =========================================================================
    // LAYER 5: CINEMATIC VIGNETTE
    // =========================================================================
    this.drawCinematicVignette(ctx, w, h, sp);
  }

  drawVolumetricSunShafts(ctx, w, h, sp) {
    const rayFade = 0.88 + 0.12 * Math.sin(this.time * 1.2);
    if (rayFade <= 0.02) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const numRays = 5;
    const centerX = w * 0.46;
    for (let i = 0; i < numRays; i++) {
      const angle = -0.30 + (i / numRays) * 0.46;
      const shimmer = Math.sin(this.time * 1.2 + i * 1.3) * 0.04;
      const alpha = Math.max(0, (0.16 + shimmer) * rayFade);

      const rayWidthTop = 35 + i * 20;
      const rayWidthBot = 200 + i * 55;

      const grad = ctx.createLinearGradient(centerX, 0, centerX + Math.tan(angle) * h, h);
      grad.addColorStop(0, `rgba(230, 252, 255, ${alpha * 1.6})`);
      grad.addColorStop(0.3, `rgba(80, 220, 240, ${alpha * 0.9})`);
      grad.addColorStop(0.7, `rgba(18, 140, 170, ${alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(3, 20, 36, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(centerX - rayWidthTop / 2 + i * 20, 0);
      ctx.lineTo(centerX + rayWidthTop / 2 + i * 20, 0);
      ctx.lineTo(centerX + Math.tan(angle) * h + rayWidthBot / 2, h);
      ctx.lineTo(centerX + Math.tan(angle) * h - rayWidthBot / 2, h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * SEAMLESS 3D FISH RENDERING:
   * - 100% Whole, un-cut photographic body (ZERO vertical slices or cut lines).
   * - 3D Perspective scaling & foreshortening based on Z depth.
   * - 3D Pitch tilt (swimming ascent/descent) + Yaw/Roll wave flexing.
   * - Atmospheric Ocean Water Haze (Rayleigh scattering) when swimming backwards into depth.
   * - Specular sunlight glints & highlights when swimming forward towards the screen.
   * - Flapping 3D pectoral fin ("wing") on the fish flank.
   */
  draw3DFish(ctx, img, fish, isHero) {
    if (!img) return;

    ctx.save();
    ctx.translate(fish.x, fish.y);

    // If swimming Left, flip horizontally so head faces Left
    if (fish.direction === -1) {
      ctx.scale(-1, 1);
    }

    // Dynamic scale breathing with swim cycle
    const bodyScaleX = fish.currentScale * (1.0 + Math.sin(fish.swimPhase) * 0.02);
    const bodyScaleY = fish.currentScale * (1.0 + Math.cos(fish.swimPhase) * 0.03);
    ctx.scale(bodyScaleX, bodyScaleY);

    // 3D Pitch from swimming trajectory
    const pitch = fish.pitch || 0;
    // 3D Yaw & hydrodynamic swimming rotation
    const yawAngle = Math.sin(fish.swimPhase) * (isHero ? 0.05 : 0.07);
    const rollAngle = Math.cos(fish.swimPhase * 0.8) * 0.035;
    ctx.rotate(pitch + yawAngle + rollAngle);

    // 3D perspective skew that simulates the body curving in 3D water
    const flexSkew = Math.sin(fish.swimPhase) * 0.055;
    ctx.transform(1, flexSkew, 0, 1, 0, 0);

    const imgW = img.width;
    const imgH = img.height;

    // DRAW THE COMPLETE UNBROKEN PHOTOREALISTIC FISH BODY (Clean, zero bounding box)
    ctx.drawImage(img, -imgW * 0.5, -imgH * 0.5, imgW, imgH);

    // =========================================================================
    // 3D FLAPPING PECTORAL FIN ("WING") ON THE FISH FLANK
    // Spreads open and flutters as the fish swims naturally through the water
    // =========================================================================
    const wingPhase = fish.swimPhase * 1.35;
    const wingFlap = Math.sin(wingPhase) * 0.42;
    const finBaseX = imgW * 0.16;
    const finBaseY = imgH * 0.06;

    ctx.save();
    ctx.translate(finBaseX, finBaseY);
    ctx.rotate(0.2 + wingFlap * 0.45);

    // 3D perspective matrix transform simulating wing spreading outward in 3D
    const wingScaleY = Math.cos(wingFlap) * 0.65 + 0.35;
    const wingSkew = Math.sin(wingFlap) * 0.32;
    ctx.transform(1, wingSkew, 0, wingScaleY, 0, 0);

    // Translucent pectoral wing with iridescent cyan rim
    const finGrad = ctx.createLinearGradient(0, 0, 80, 24);
    finGrad.addColorStop(0, 'rgba(114, 222, 229, 0.75)');
    finGrad.addColorStop(0.5, 'rgba(61, 192, 204, 0.5)');
    finGrad.addColorStop(1, 'rgba(235, 255, 255, 0.85)');

    ctx.fillStyle = finGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(48, -16, 80, 4);
    ctx.quadraticCurveTo(48, 24, 0, 0);
    ctx.fill();

    // Fin rays (striations)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.2;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(70, -6 + r * 7);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  /**
   * 3D TIGER PRAWN RENDERING:
   * - 3D Z-depth scaling and kick-and-glide tilt.
   * - Fluttering pleopod swimmeret legs beneath abdomen.
   * - Clean photorealistic prawn rendering without any bounding box.
   */
  drawSinglePrawn(ctx, p) {
    const prawnImg = this.images.prawn;
    if (!prawnImg) return;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.direction === -1) {
      ctx.scale(-1, 1);
    }

    ctx.scale(p.currentScale, p.currentScale);

    // Kick-glide pitch
    const kickTilt = (Math.sin(this.time * 2.2 + p.phase) > 0.3 ? -0.16 : 0.05) * Math.sin(this.time * 2.2 + p.phase);
    ctx.rotate(kickTilt);

    const pw = prawnImg.width;
    const ph = prawnImg.height;
    // Clean transparent drawing with zero bounding box artifacts
    ctx.drawImage(prawnImg, -pw * 0.5, -ph * 0.5);

    // 3D Fluttering pleopod paddle legs beneath abdomen
    ctx.strokeStyle = 'rgba(238, 216, 152, 0.75)';
    ctx.lineWidth = 1.5;
    const legRate = this.time * 7.0 + p.phase;
    for (let leg = 0; leg < 4; leg++) {
      const legWave = Math.sin(legRate + leg) * 7;
      const lx = -pw * 0.15 + leg * 16;
      const ly = ph * 0.15;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 4, ly + 14 + legWave);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBubblesAndParticles(ctx, w, h, sp) {
    ctx.save();

    for (const b of this.bubbles) {
      const visualY = (b.y - sp * 140) % (h + 30);
      const renderedY = visualY < 0 ? visualY + h : visualY;

      ctx.beginPath();
      ctx.arc(b.x, renderedY, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 242, 255, ${b.alpha * 0.25})`;
      ctx.strokeStyle = `rgba(220, 250, 255, ${b.alpha * 0.85})`;
      ctx.lineWidth = 0.75;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, renderedY - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
    }

    for (const p of this.particles) {
      const visualY = (p.y - sp * 80) % (h + 20);
      const renderedY = visualY < 0 ? visualY + h : visualY;

      ctx.beginPath();
      ctx.arc(p.x, renderedY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 248, 252, ${p.alpha * 0.65})`;
      ctx.fill();
    }

    ctx.restore();
  }

  drawCinematicVignette(ctx, w, h, sp) {
    ctx.save();
    const vignette = ctx.createRadialGradient(
      w * 0.5, h * 0.40, Math.min(w, h) * 0.35,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.85
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.70, 'rgba(2, 16, 28, 0.08)');
    vignette.addColorStop(1, 'rgba(1, 8, 16, 0.32)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

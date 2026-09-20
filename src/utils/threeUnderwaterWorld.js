/**
 * YNR FISHES — True 3D Underwater Marine Engine (Three.js)
 * Features:
 * - Real 3D fish with articulated spine, flapping 3D pectoral fins ("wings"), and wagging caudal tail.
 * - 3D tiger prawns with curved segmented carapaces and swaying antennae.
 * - Volumetric 3D sun shafts, caustics, floating marine snow, and rising physical bubbles.
 * - Pure scroll-driven 3D kinematics: fish and prawns swim through 3D space strictly as user scrolls.
 * - Gentle idle micro-breathing when stationary.
 */

import * as THREE from 'three';

export class ThreeUnderwaterWorld {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    this.scrollProgress = 0;
    this.smoothScroll = 0;
    this.scrollVelocity = 0;
    this.time = 0;

    this.initScene();
    this.initLights();
    this.initBackground();
    this.initHeroFish();
    this.initSilverPomfret();
    this.initPrawns();
    this.initBubblesAndParticles();
    this.initVolumetricRays();

    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);

    window.addEventListener('resize', this.handleResize);
    this.animId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x021324, 0.022);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 0, 18);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.pointerEvents = 'none';
  }

  initLights() {
    // 1. Intense sunlight shaft from above surface
    this.sunLight = new THREE.DirectionalLight(0xe8fbff, 3.2);
    this.sunLight.position.set(2, 16, 8);
    this.scene.add(this.sunLight);

    // 2. Ambient deep turquoise ocean light
    this.ambientLight = new THREE.AmbientLight(0x083b54, 1.8);
    this.scene.add(this.ambientLight);

    // 3. Specular blue-cyan under-lighting for caustic bounce
    this.causticLight = new THREE.PointLight(0x3dc0cc, 2.5, 30);
    this.causticLight.position.set(0, -6, 5);
    this.scene.add(this.causticLight);
  }

  initBackground() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/ocean_bg.jpg', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const bgGeo = new THREE.PlaneGeometry(54, 30);
      const bgMat = new THREE.MeshBasicMaterial({
        map: texture,
        depthWrite: false,
      });
      this.bgMesh = new THREE.Mesh(bgGeo, bgMat);
      this.bgMesh.position.set(0, -0.5, -12);
      this.scene.add(this.bgMesh);
    });
  }

  /**
   * Helper to create a 3D fish geometry with streamlined hydrodynamic cross-sections
   */
  createFishBodyGeometry(length = 5.5, maxRadiusY = 1.2, maxRadiusZ = 0.45) {
    const segmentsL = 24;
    const segmentsRadial = 16;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segmentsL; i++) {
      const u = i / segmentsL;
      // Head is at u=1, tail at u=0
      const x = (u - 0.5) * length;

      // Spindle radius curve (thickest around 65% from tail towards head)
      let ry = Math.sin(u * Math.PI) * maxRadiusY;
      let rz = Math.sin(u * Math.PI) * maxRadiusZ;

      // Flatten tail peduncle laterally
      if (u < 0.25) {
        ry *= 0.65;
        rz *= 0.35;
      }

      for (let j = 0; j <= segmentsRadial; j++) {
        const v = j / segmentsRadial;
        const theta = v * Math.PI * 2;

        const y = Math.cos(theta) * ry;
        const z = Math.sin(theta) * rz;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let i = 0; i < segmentsL; i++) {
      for (let j = 0; j < segmentsRadial; j++) {
        const a = i * (segmentsRadial + 1) + j;
        const b = a + segmentsRadial + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    // Store original rest positions for spine wave deformation
    geo.userData = { originalPositions: Float32Array.from(geo.attributes.position.array) };
    return geo;
  }

  /**
   * Create 3D Fin Geometry (Pectoral fin / Caudal tail fin)
   */
  createFinGeometry(width, height, isCaudal = false) {
    const shape = new THREE.Shape();
    if (isCaudal) {
      // Forked caudal tail
      shape.moveTo(0, 0);
      shape.lineTo(-width * 0.9, height * 0.65);
      shape.quadraticCurveTo(-width * 0.45, 0, -width * 0.9, -height * 0.65);
      shape.lineTo(0, 0);
    } else {
      // Streamlined pectoral fin ("wing")
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(width * 0.7, height * 0.4, width, height * 0.15);
      shape.quadraticCurveTo(width * 0.7, -height * 0.2, 0, 0);
    }

    const geo = new THREE.ShapeGeometry(shape, 8);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Build the 3D Hero Amberjack Fish
   */
  initHeroFish() {
    this.heroGroup = new THREE.Group();
    this.scene.add(this.heroGroup);

    const textureLoader = new THREE.TextureLoader();
    const fishTex = textureLoader.load('/assets/hero_fish.png');
    fishTex.colorSpace = THREE.SRGBColorSpace;

    // Shiny, wet iridescent fish scale physical material
    const fishMat = new THREE.MeshPhysicalMaterial({
      map: fishTex,
      roughness: 0.28,
      metalness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      reflectivity: 0.95,
      side: THREE.DoubleSide,
      color: 0xdff5f8,
      emissive: 0x052a3a,
      emissiveIntensity: 0.25,
    });

    // 1. Main 3D Fish Body
    this.heroBodyGeo = this.createFishBodyGeometry(5.2, 1.15, 0.42);
    this.heroBodyMesh = new THREE.Mesh(this.heroBodyGeo, fishMat);
    this.heroGroup.add(this.heroBodyMesh);

    // 2. Caudal Fin (Tail)
    const finMat = new THREE.MeshPhysicalMaterial({
      map: fishTex,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.6,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      color: 0x58d3dc,
    });

    const tailGeo = this.createFinGeometry(1.6, 1.8, true);
    this.heroTailMesh = new THREE.Mesh(tailGeo, finMat);
    this.heroTailMesh.position.set(-2.55, 0, 0);
    this.heroGroup.add(this.heroTailMesh);

    // 3. 3D PECTORAL FINS ("WINGS" that flap in and out)
    const pecGeoL = this.createFinGeometry(1.4, 0.55, false);
    this.heroPecLeft = new THREE.Mesh(pecGeoL, finMat);
    this.heroPecLeft.position.set(0.65, -0.2, 0.38);
    this.heroPecLeft.rotation.set(0.1, 0.35, -0.25);
    this.heroGroup.add(this.heroPecLeft);

    const pecGeoR = this.createFinGeometry(1.4, 0.55, false);
    this.heroPecRight = new THREE.Mesh(pecGeoR, finMat);
    this.heroPecRight.position.set(0.65, -0.2, -0.38);
    this.heroPecRight.rotation.set(-0.1, -0.35, -0.25);
    this.heroGroup.add(this.heroPecRight);

    // 4. Dorsal Fin (top)
    const dorsalGeo = this.createFinGeometry(1.5, 0.5, false);
    this.heroDorsal = new THREE.Mesh(dorsalGeo, finMat);
    this.heroDorsal.position.set(-0.6, 0.95, 0);
    this.heroDorsal.rotation.set(0, Math.PI, 0.3);
    this.heroGroup.add(this.heroDorsal);

    // Initial 3D placement (lower left, facing right)
    this.heroStartX = -6.5;
    this.heroStartY = -3.8;
    this.heroStartZ = 3.5;

    this.heroGroup.position.set(this.heroStartX, this.heroStartY, this.heroStartZ);
    this.heroGroup.scale.set(0.78, 0.78, 0.78);
  }

  /**
   * Build the 3D Silver Pomfret
   */
  initSilverPomfret() {
    this.pomfretGroup = new THREE.Group();
    this.scene.add(this.pomfretGroup);

    const textureLoader = new THREE.TextureLoader();
    const pomfretTex = textureLoader.load('/assets/silver_pomfret.png');
    pomfretTex.colorSpace = THREE.SRGBColorSpace;

    const pomfretMat = new THREE.MeshPhysicalMaterial({
      map: pomfretTex,
      roughness: 0.22,
      metalness: 0.45,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
      color: 0xf0fdff,
      emissive: 0x073542,
      emissiveIntensity: 0.2,
    });

    // Diamond flat round body
    this.pomfretBodyGeo = this.createFishBodyGeometry(3.6, 1.45, 0.24);
    this.pomfretBodyMesh = new THREE.Mesh(this.pomfretBodyGeo, pomfretMat);
    this.pomfretGroup.add(this.pomfretBodyMesh);

    // Tail fin
    const tailGeo = this.createFinGeometry(1.2, 1.4, true);
    this.pomfretTailMesh = new THREE.Mesh(tailGeo, pomfretMat);
    this.pomfretTailMesh.position.set(-1.75, 0, 0);
    this.pomfretGroup.add(this.pomfretTailMesh);

    // Pectoral wings
    const pecGeo = this.createFinGeometry(1.1, 0.45, false);
    this.pomfretPecLeft = new THREE.Mesh(pecGeo, pomfretMat);
    this.pomfretPecLeft.position.set(0.4, -0.15, 0.22);
    this.pomfretPecLeft.rotation.set(0.1, 0.3, -0.2);
    this.pomfretGroup.add(this.pomfretPecLeft);

    this.pomfretPecRight = new THREE.Mesh(pecGeo, pomfretMat);
    this.pomfretPecRight.position.set(0.4, -0.15, -0.22);
    this.pomfretPecRight.rotation.set(-0.1, -0.3, -0.2);
    this.pomfretGroup.add(this.pomfretPecRight);

    // Initial 3D placement (mid right, facing left)
    this.pomfretStartX = 6.2;
    this.pomfretStartY = -1.2;
    this.pomfretStartZ = 1.2;

    this.pomfretGroup.position.set(this.pomfretStartX, this.pomfretStartY, this.pomfretStartZ);
    this.pomfretGroup.scale.set(0.62, 0.62, 0.62);
    this.pomfretGroup.rotation.y = Math.PI; // Swimming Left
  }

  /**
   * Build 3D Tiger Prawns
   */
  initPrawns() {
    this.prawns = [];
    const textureLoader = new THREE.TextureLoader();
    const prawnTex = textureLoader.load('/assets/tiger_prawn.png');
    prawnTex.colorSpace = THREE.SRGBColorSpace;

    const prawnMat = new THREE.MeshPhysicalMaterial({
      map: prawnTex,
      roughness: 0.25,
      metalness: 0.15,
      transmission: 0.35,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      color: 0xffeedd,
      emissive: 0x3d1c06,
      emissiveIntensity: 0.22,
    });

    const configs = [
      { startX: 4.6, startY: -0.4, startZ: 2.2, scale: 0.85, dir: -1 },
      { startX: 3.2, startY: 0.8, startZ: 0.8, scale: 0.65, dir: 1 },
      { startX: 5.8, startY: 0.2, startZ: 1.4, scale: 0.60, dir: -1 },
    ];

    for (const cfg of configs) {
      const pGroup = new THREE.Group();
      // Curved 3D body plane with organic depth
      const pGeo = new THREE.PlaneGeometry(2.4, 1.4, 8, 4);
      // Curve plane
      const pos = pGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        pos.setZ(i, -Math.sin(((px + 1.2) / 2.4) * Math.PI) * 0.35);
      }
      pGeo.computeVertexNormals();

      const pMesh = new THREE.Mesh(pGeo, prawnMat);
      pGroup.add(pMesh);

      // 3D Sensory Antennae (spline curve)
      const antCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.0, 0.2, 0),
        new THREE.Vector3(1.6, 0.6, 0.2),
        new THREE.Vector3(2.5, 0.9, -0.1),
        new THREE.Vector3(3.4, 0.8, 0.3),
      ]);
      const antGeo = new THREE.TubeGeometry(antCurve, 16, 0.02, 6, false);
      const antMat = new THREE.MeshBasicMaterial({ color: 0xeed898, transparent: true, opacity: 0.75 });
      const antMesh = new THREE.Mesh(antGeo, antMat);
      pGroup.add(antMesh);

      pGroup.position.set(cfg.startX, cfg.startY, cfg.startZ);
      pGroup.scale.set(cfg.scale, cfg.scale, cfg.scale);
      if (cfg.dir === -1) pGroup.rotation.y = Math.PI;

      this.scene.add(pGroup);
      this.prawns.push({
        group: pGroup,
        startX: cfg.startX,
        startY: cfg.startY,
        startZ: cfg.startZ,
        dir: cfg.dir,
        phase: Math.random() * Math.PI,
      });
    }
  }

  /**
   * 3D Physical Rising Bubbles and Marine Snow
   */
  initBubblesAndParticles() {
    // 1. Rising 3D Bubbles
    const bubbleCount = 45;
    const bubbleGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xd6f7fa,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.65,
      ior: 1.33,
    });

    this.bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    this.bubbleData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < bubbleCount; i++) {
      const isCol = i < 28;
      const x = isCol ? -5.5 + (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 24;
      const y = -8 + Math.random() * 16;
      const z = -2 + Math.random() * 8;
      const scale = 0.5 + Math.random() * 1.5;

      this.bubbleData.push({
        x, y, z,
        baseX: x,
        scale,
        speedY: 0.035 + Math.random() * 0.045,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      });

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.bubbleMesh.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(this.bubbleMesh);

    // 2. Floating Marine Snow Particles
    const snowCount = 120;
    const snowGeo = new THREE.BufferGeometry();
    const snowPos = [];
    for (let i = 0; i < snowCount; i++) {
      snowPos.push(
        (Math.random() - 0.5) * 26,
        -7 + Math.random() * 14,
        -4 + Math.random() * 12
      );
    }
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xa6e8eb,
      size: 0.16,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    this.snowPoints = new THREE.Points(snowGeo, snowMat);
    this.scene.add(this.snowPoints);
  }

  /**
   * 3D Volumetric Sun Beams streaming from surface
   */
  initVolumetricRays() {
    this.rayGroup = new THREE.Group();
    this.scene.add(this.rayGroup);

    const rayGeo = new THREE.ConeGeometry(3.5, 22, 16, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x90e0ef,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const offsets = [-3.5, -0.8, 1.8, 4.2];
    this.volumetricMeshes = [];
    for (let i = 0; i < offsets.length; i++) {
      const ray = new THREE.Mesh(rayGeo, rayMat.clone());
      ray.position.set(offsets[i], 8, -2 + i * 0.8);
      ray.rotation.z = -0.22 + i * 0.08;
      ray.scale.set(0.6 + i * 0.15, 1, 0.4);
      this.rayGroup.add(ray);
      this.volumetricMeshes.push(ray);
    }
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  handleResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  /**
   * Animate 3D Spine Wave Undulation along the Fish Mesh Vertices
   */
  updateFishSpineWave(geo, swimPhase, amplitude = 0.35, isHero = true) {
    const pos = geo.attributes.position;
    const orig = geo.userData.originalPositions;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = orig[i3];
      const oy = orig[i3 + 1];
      const oz = orig[i3 + 2];

      // u progression: 0 at tail (max swish), 1 at head (stable)
      const u = (ox + 2.6) / 5.2;
      const tailWeight = Math.pow(Math.max(0, 1 - u), 1.7);
      const waveZ = Math.sin(swimPhase - (1 - u) * 4.5) * amplitude * tailWeight;

      pos.setXYZ(i, ox, oy, oz + waveZ);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  animate(currentTime) {
    this.animId = requestAnimationFrame(this.animate);
    const dt = 0.016;
    this.time += dt;

    // Smooth scroll interpolation (damped inertia)
    const prevSmooth = this.smoothScroll;
    this.smoothScroll += (this.scrollProgress - this.smoothScroll) * 0.1;
    this.scrollVelocity = Math.abs(this.smoothScroll - prevSmooth) * 60;

    const sp = this.smoothScroll;
    const vel = this.scrollVelocity;

    // -------------------------------------------------------------------------
    // 1. 3D HERO FISH: Moves across screen strictly with scroll
    // -------------------------------------------------------------------------
    if (this.heroGroup) {
      // Horizontal & vertical glide in 3D space
      const travelX = 13.5;
      const travelY = 2.4;
      const travelZ = -2.0;

      // Micro-idle breathing when stationary
      const idleY = Math.sin(this.time * 1.5) * 0.08;
      const idleRoll = Math.sin(this.time * 1.2) * 0.03;

      this.heroGroup.position.x = this.heroStartX + sp * travelX;
      this.heroGroup.position.y = this.heroStartY + sp * travelY + idleY;
      this.heroGroup.position.z = this.heroStartZ + sp * travelZ;

      // Swimming cadence: fast active tail wag when user scrolls, calm idle flutter when paused
      const swimRate = 1.0 + vel * 12.0;
      this.heroFish.swimPhase += dt * swimRate;

      // Deform 3D spine
      const dynamicWaveAmp = 0.12 + Math.min(vel * 0.6, 0.4);
      this.updateFishSpineWave(this.heroBodyGeo, this.heroFish.swimPhase, dynamicWaveAmp, true);

      // Tail fin follows with phase lag
      if (this.heroTailMesh) {
        this.heroTailMesh.rotation.y = Math.sin(this.heroFish.swimPhase - 3.8) * (0.35 + vel * 0.5);
      }

      // PECTORAL FINS ("WINGS") FLAPPING IN 3D!
      const wingPhase = this.heroFish.swimPhase * 1.2;
      const wingFlap = Math.sin(wingPhase) * (0.22 + vel * 0.45);

      if (this.heroPecLeft) {
        this.heroPecLeft.rotation.y = 0.35 + wingFlap;
        this.heroPecLeft.rotation.z = -0.25 - Math.abs(wingFlap) * 0.4;
      }
      if (this.heroPecRight) {
        this.heroPecRight.rotation.y = -0.35 - wingFlap;
        this.heroPecRight.rotation.z = -0.25 - Math.abs(wingFlap) * 0.4;
      }

      // Banking angle turns into direction of motion
      this.heroGroup.rotation.z = idleRoll + (vel > 0.05 ? 0.06 : 0);
    }

    // -------------------------------------------------------------------------
    // 2. 3D SILVER POMFRET: Moves Right -> Left strictly with scroll
    // -------------------------------------------------------------------------
    if (this.pomfretGroup) {
      const pTravelX = -12.5;
      const pTravelY = 1.6;
      const pIdleY = Math.cos(this.time * 1.6) * 0.06;

      this.pomfretGroup.position.x = this.pomfretStartX + sp * pTravelX;
      this.pomfretGroup.position.y = this.pomfretStartY + sp * pTravelY + pIdleY;

      const pSwimRate = 1.1 + vel * 10.5;
      this.pomfret.swimPhase += dt * pSwimRate;

      const pWaveAmp = 0.10 + Math.min(vel * 0.45, 0.32);
      this.updateFishSpineWave(this.pomfretBodyGeo, this.pomfret.swimPhase, pWaveAmp, false);

      if (this.pomfretTailMesh) {
        this.pomfretTailMesh.rotation.y = Math.sin(this.pomfret.swimPhase - 3.5) * (0.3 + vel * 0.4);
      }

      // Pomfret wings flapping
      const pWingFlap = Math.sin(this.pomfret.swimPhase) * (0.2 + vel * 0.38);
      if (this.pomfretPecLeft) {
        this.pomfretPecLeft.rotation.y = 0.3 + pWingFlap;
      }
      if (this.pomfretPecRight) {
        this.pomfretPecRight.rotation.y = -0.3 - pWingFlap;
      }
    }

    // -------------------------------------------------------------------------
    // 3. 3D TIGER PRAWNS: Kick-and-glide across with scroll
    // -------------------------------------------------------------------------
    for (const p of this.prawns) {
      const idleY = Math.sin(this.time * 2.0 + p.phase) * 0.05;
      const kickTilt = (vel > 0.05 ? -0.22 : 0.04) * Math.sin(this.time * 3.5);

      p.group.position.x = p.startX + sp * (p.dir === 1 ? 5.2 : -5.8);
      p.group.position.y = p.startY + sp * 2.2 + idleY;
      p.group.rotation.z = kickTilt;
    }

    // -------------------------------------------------------------------------
    // 4. Rising 3D Physical Bubbles
    // -------------------------------------------------------------------------
    if (this.bubbleMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.bubbleData.length; i++) {
        const b = this.bubbleData[i];
        b.y += b.speedY;
        b.x = b.baseX + Math.sin(this.time * 2.0 + b.phase) * 0.15;

        if (b.y > 10) {
          b.y = -9;
        }

        dummy.position.set(b.x, b.y - sp * 3.5, b.z);
        dummy.scale.set(b.scale, b.scale, b.scale);
        dummy.updateMatrix();
        this.bubbleMesh.setMatrixAt(i, dummy.matrix);
      }
      this.bubbleMesh.instanceMatrix.needsUpdate = true;
    }

    // -------------------------------------------------------------------------
    // 5. Marine Snow drifting
    // -------------------------------------------------------------------------
    if (this.snowPoints) {
      const pos = this.snowPoints.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - 0.012;
        if (y < -8) y = 8;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------------------
    // 6. Volumetric Light Shimmer
    // -------------------------------------------------------------------------
    if (this.volumetricMeshes) {
      const rayAlpha = Math.max(0, 1 - sp * 1.4);
      for (let i = 0; i < this.volumetricMeshes.length; i++) {
        const ray = this.volumetricMeshes[i];
        const pulse = Math.sin(this.time * 1.5 + i * 1.2) * 0.03;
        ray.material.opacity = (0.12 + pulse) * rayAlpha;
      }
    }

    // Camera dive depth
    this.camera.position.y = -sp * 3.0;
    this.camera.position.z = 18 - sp * 2.5;

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.handleResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}

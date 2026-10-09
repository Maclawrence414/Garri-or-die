/**
 * 3D Game Scene Engine using Three.js
 * Renders the Expressive Nigerian Character, Soaked Garri Bowl, Dynamic Spoon,
 * Table environment, realistic lighting, and comedic facial animations.
 */

import * as THREE from 'three';

export interface SceneConfig {
  garriType: 'ijebu' | 'yellow' | 'student';
  outfit: 'ankara' | 'jersey' | 'singlet';
  toppings: {
    groundnuts: boolean;
    milk: boolean;
    ice: boolean;
  };
}

export class GameScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Character hierarchy
  private characterGroup: THREE.Group;
  private headGroup: THREE.Group;
  private jawMesh: THREE.Mesh;
  private upperMouthMesh: THREE.Mesh;
  private leftEye: THREE.Mesh;
  private rightEye: THREE.Mesh;
  private leftPupil: THREE.Mesh;
  private rightPupil: THREE.Mesh;
  private leftBrow: THREE.Mesh;
  private rightBrow: THREE.Mesh;
  private torsoMesh: THREE.Mesh;
  private spinningStarsGroup: THREE.Group;

  // Bowl & Spoon
  private bowlGroup: THREE.Group;
  private spoonGroup: THREE.Group;
  private spoonGarriMesh: THREE.Mesh;
  private liquidMesh: THREE.Mesh;

  // Particle systems
  private hitParticles: THREE.Points;
  private hitParticleGeo: THREE.BufferGeometry;
  private hitParticleVelocities: Float32Array;
  private hitParticleActive: boolean = false;
  private hitParticleTimer: number = 0;

  // State
  private mouthOpenAmount: number = 0.5; // 0 (closed) to 1 (wide open)
  private targetMouthOpen: number = 0.5;
  private isChewing: boolean = false;
  private chewTimer: number = 0;
  private isMissShock: boolean = false;
  private missShockTimer: number = 0;
  private isFainted: boolean = false;
  private faintProgress: number = 0;
  private hungerRatio: number = 1.0;
  private config: SceneConfig;

  // Spoon animation state
  private spoonState: 'idle' | 'scooping' | 'feeding' | 'returning' | 'dropping' = 'idle';
  private spoonProgress: number = 0;
  private spoonStartPos = new THREE.Vector3(0.5, -0.2, 1.4);
  private spoonBowlPos = new THREE.Vector3(0.1, -0.45, 1.5);
  private spoonMouthPos = new THREE.Vector3(0, 0.45, 1.0);

  constructor(container: HTMLElement, config: SceneConfig) {
    this.container = container;
    this.config = config;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a1a0a); // Warm Nigerian dining tone
    this.scene.fog = new THREE.FogExp2(0x2a1a0a, 0.12);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 0.85, 3.2);
    this.camera.lookAt(0, 0.25, 0.3);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // Setup Lighting
    this.setupLighting();

    // Build Environment
    this.buildEnvironment();

    // Build Character
    const charElements = this.buildCharacter();
    this.characterGroup = charElements.characterGroup;
    this.headGroup = charElements.headGroup;
    this.jawMesh = charElements.jawMesh;
    this.upperMouthMesh = charElements.upperMouthMesh;
    this.leftEye = charElements.leftEye;
    this.rightEye = charElements.rightEye;
    this.leftPupil = charElements.leftPupil;
    this.rightPupil = charElements.rightPupil;
    this.leftBrow = charElements.leftBrow;
    this.rightBrow = charElements.rightBrow;
    this.torsoMesh = charElements.torsoMesh;
    this.spinningStarsGroup = charElements.spinningStars;

    // Build Bowl & Spoon
    const tableItems = this.buildTableItems();
    this.bowlGroup = tableItems.bowlGroup;
    this.spoonGroup = tableItems.spoonGroup;
    this.spoonGarriMesh = tableItems.spoonGarriMesh;
    this.liquidMesh = tableItems.liquidMesh;

    // Build Particle System
    const particles = this.buildParticles();
    this.hitParticles = particles.points;
    this.hitParticleGeo = particles.geo;
    this.hitParticleVelocities = particles.velocities;

    // Window resize
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm Ambient Light
    const ambient = new THREE.AmbientLight(0xffecd2, 0.65);
    this.scene.add(ambient);

    // Warm Key Sun/Room Light
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Spotlight directly on the Garri bowl for appetizing shine
    const bowlSpot = new THREE.SpotLight(0xfffaed, 2.2, 5, Math.PI / 4, 0.3, 1);
    bowlSpot.position.set(0, 2.2, 1.8);
    bowlSpot.target.position.set(0, -0.4, 1.5);
    this.scene.add(bowlSpot);
    this.scene.add(bowlSpot.target);

    // Rim light behind character
    const rimLight = new THREE.DirectionalLight(0xffa500, 0.8);
    rimLight.position.set(-2, 2.5, -2);
    this.scene.add(rimLight);
  }

  private buildEnvironment() {
    // Wooden Table
    const tableGeo = new THREE.BoxGeometry(4.5, 0.2, 2.8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x5a2d0c,
      roughness: 0.4,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, -0.6, 1.2);
    table.receiveShadow = true;
    this.scene.add(table);

    // Back wall with warm cream/ochre paint
    const wallGeo = new THREE.PlaneGeometry(12, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.8,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2, -2.5);
    this.scene.add(wall);

    // Window frame or subtle wall poster "GARRI IS LIFE"
    const frameGeo = new THREE.PlaneGeometry(1.6, 1.1);
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = 512;
    frameCanvas.height = 350;
    const ctx = frameCanvas.getContext('2d')!;
    ctx.fillStyle = '#225522';
    ctx.fillRect(0, 0, 512, 350);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 330);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GARRI EMPIRE', 256, 120);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('NIGERIAN SURVIVAL KIT', 256, 175);
    ctx.fillStyle = '#90ee90';
    ctx.font = '20px sans-serif';
    ctx.fillText('Est. Ijebu Ode 1960', 256, 230);
    const frameTex = new THREE.CanvasTexture(frameCanvas);
    const frameMat = new THREE.MeshBasicMaterial({ map: frameTex });
    const wallFrame = new THREE.Mesh(frameGeo, frameMat);
    wallFrame.position.set(-1.8, 1.8, -2.4);
    this.scene.add(wallFrame);
  }

  private createOutfitTexture(type: 'ankara' | 'jersey' | 'singlet'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (type === 'ankara') {
      // Vibrant yellow, teal & orange geometric African pattern
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#0284c7';
      for (let x = 0; x < 512; x += 64) {
        for (let y = 0; y < 512; y += 64) {
          ctx.beginPath();
          ctx.arc(x + 32, y + 32, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x + 24, y + 24, 16, 16);
          ctx.fillStyle = '#0284c7';
        }
      }
    } else if (type === 'jersey') {
      // Nigerian Super Eagles Green & White Chevron Jersey
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let y = 0; y < 512; y += 80) {
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + 40);
        ctx.lineTo(512, y);
        ctx.lineTo(512, y + 30);
        ctx.lineTo(256, y + 70);
        ctx.lineTo(0, y + 30);
      }
      ctx.fill();
      // Eagle crest
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NIGERIA 9', 256, 320);
    } else {
      // Hostel singlet (white ribbed vest)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#cbd5e1';
      for (let x = 0; x < 512; x += 8) {
        ctx.fillRect(x, 0, 2, 512);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  private buildCharacter() {
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0, 0);
    this.scene.add(characterGroup);

    // Torso / Body
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.2, 24);
    const outfitTex = this.createOutfitTexture(this.config.outfit);
    const torsoMat = new THREE.MeshStandardMaterial({
      map: outfitTex,
      roughness: 0.6,
      bumpScale: 0.05,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, -0.35, 0.1);
    torsoMesh.castShadow = true;
    characterGroup.add(torsoMesh);

    // Arms resting on table / posed
    const armMat = new THREE.MeshStandardMaterial({ color: 0x3d2012, roughness: 0.6 });
    // Left arm
    const leftArmGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 16);
    const leftArm = new THREE.Mesh(leftArmGeo, armMat);
    leftArm.position.set(-0.7, -0.4, 0.6);
    leftArm.rotation.set(Math.PI / 4, 0, Math.PI / 6);
    characterGroup.add(leftArm);

    // Right arm (ready to receive garri)
    const rightArm = new THREE.Mesh(leftArmGeo, armMat);
    rightArm.position.set(0.7, -0.4, 0.6);
    rightArm.rotation.set(Math.PI / 4, 0, -Math.PI / 6);
    characterGroup.add(rightArm);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.4, 16);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x3a1f10,
      roughness: 0.55,
      metalness: 0.05,
    });
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.25, 0.1);
    characterGroup.add(neck);

    // Head Group (for head bobbing, nodding, and fainting)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.68, 0.15);
    characterGroup.add(headGroup);

    // Upper Cranium (Head top & temples)
    const headGeo = new THREE.SphereGeometry(0.48, 32, 24);
    headGeo.scale(0.95, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Hair: Stylized textured fade
    const hairGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7);
    hairGeo.scale(0.97, 1.16, 0.97);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x110a05,
      roughness: 0.95,
      metalness: 0.05,
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.05, -0.02);
    headGroup.add(hairMesh);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.09, 0.22, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.02, 0.48);
    nose.rotation.x = Math.PI / 2.2;
    headGroup.add(nose);

    // Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, skinMat);
    leftCheek.position.set(-0.25, -0.1, 0.4);
    headGroup.add(leftCheek);
    const rightCheek = new THREE.Mesh(cheekGeo, skinMat);
    rightCheek.position.set(0.25, -0.1, 0.4);
    headGroup.add(rightCheek);

    // Eyes
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0502 });
    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.045, 12, 12);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.17, 0.08, 0.42);
    headGroup.add(leftEye);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.08);
    leftEye.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.17, 0.08, 0.42);
    headGroup.add(rightEye);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.08);
    rightEye.add(rightPupil);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.18, 0.04, 0.04);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x110804 });

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.18, 0.22, 0.44);
    leftBrow.rotation.z = 0.1;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.18, 0.22, 0.44);
    rightBrow.rotation.z = -0.1;
    headGroup.add(rightBrow);

    // MOUTH: Upper Lip & Cavity
    const upperLipGeo = new THREE.TorusGeometry(0.12, 0.035, 12, 24, Math.PI);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x4a2518, roughness: 0.4 });
    const upperMouthMesh = new THREE.Mesh(upperLipGeo, lipMat);
    upperMouthMesh.position.set(0, -0.16, 0.44);
    upperMouthMesh.rotation.x = Math.PI;
    headGroup.add(upperMouthMesh);

    // Teeth (Upper clean arcade teeth)
    const teethGeo = new THREE.BoxGeometry(0.14, 0.04, 0.05);
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const upperTeeth = new THREE.Mesh(teethGeo, teethMat);
    upperTeeth.position.set(0, -0.02, 0.02);
    upperMouthMesh.add(upperTeeth);

    // JAW (Hinges downward for opening mouth!)
    const jawMesh = new THREE.Mesh(upperLipGeo, lipMat);
    jawMesh.position.set(0, -0.22, 0.44);
    jawMesh.rotation.x = 0;
    headGroup.add(jawMesh);

    // Mouth Cavity interior (Dark red)
    const mouthCavityGeo = new THREE.SphereGeometry(0.14, 16, 12);
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x1a0505 });
    const cavity = new THREE.Mesh(mouthCavityGeo, cavityMat);
    cavity.position.set(0, -0.2, 0.38);
    cavity.scale.set(1, 0.6, 0.8);
    headGroup.add(cavity);

    // Cartoon Spinning Stars (Activated when Fainted / Game Over)
    const spinningStars = new THREE.Group();
    spinningStars.position.set(0, 0.65, 0.2);
    spinningStars.visible = false;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const starGeo = new THREE.ConeGeometry(0.08, 0.16, 5);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xffeb3b,
        emissive: 0xffc107,
        roughness: 0.2,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.1, Math.sin(angle) * 0.45);
      star.rotation.z = Math.PI / 4;
      spinningStars.add(star);
    }
    headGroup.add(spinningStars);

    return {
      characterGroup,
      headGroup,
      jawMesh,
      upperMouthMesh,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
      leftBrow,
      rightBrow,
      torsoMesh,
      spinningStars,
    };
  }

  private createGarriLiquidTexture(type: 'ijebu' | 'yellow' | 'student'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base color
    if (type === 'yellow') {
      ctx.fillStyle = '#eab308'; // rich palm-oil yellow
    } else if (type === 'student') {
      ctx.fillStyle = '#f1f5f9'; // cloudy student white
    } else {
      ctx.fillStyle = '#fef08a'; // classic Ijebu cream
    }
    ctx.fillRect(0, 0, 512, 512);

    // Cassava grains speckles
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.7 + 0.3;
      if (type === 'yellow') {
        ctx.fillStyle = `rgba(${250 + Math.random() * 5}, ${180 + Math.random() * 50}, 30, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${255}, ${240 + Math.random() * 15}, ${200 + Math.random() * 55}, ${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirl of Peak milk if enabled
    if (this.config.toppings.milk) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(256, 256, 120, 0.3, Math.PI * 1.6);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  private buildTableItems() {
    // 1. Classic Nigerian Floral Ceramic Bowl
    const bowlGroup = new THREE.Group();
    bowlGroup.position.set(0, -0.42, 1.45);
    this.scene.add(bowlGroup);

    const bowlGeo = new THREE.CylinderGeometry(0.5, 0.3, 0.28, 32, 1, true);
    const bowlMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
    bowlMesh.castShadow = true;
    bowlMesh.receiveShadow = true;
    bowlGroup.add(bowlMesh);

    // Floral rim band on bowl
    const rimBandGeo = new THREE.TorusGeometry(0.5, 0.02, 12, 32);
    const rimBandMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.2 });
    const rimBand = new THREE.Mesh(rimBandGeo, rimBandMat);
    rimBand.rotation.x = Math.PI / 2;
    rimBand.position.y = 0.14;
    bowlGroup.add(rimBand);

    // Garri Liquid Surface
    const liquidGeo = new THREE.CircleGeometry(0.48, 32);
    const liquidTex = this.createGarriLiquidTexture(this.config.garriType);
    const liquidMat = new THREE.MeshStandardMaterial({
      map: liquidTex,
      roughness: 0.3,
      metalness: 0.05,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 0.08;
    bowlGroup.add(liquidMesh);

    // Floating Groundnuts in Bowl
    if (this.config.toppings.groundnuts) {
      const nutGeo = new THREE.SphereGeometry(0.045, 12, 8);
      nutGeo.scale(1.7, 0.8, 1);
      const nutMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.5 });
      for (let i = 0; i < 7; i++) {
        const nut = new THREE.Mesh(nutGeo, nutMat);
        const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 0.15 + Math.random() * 0.22;
        nut.position.set(Math.cos(angle) * dist, 0.09, Math.sin(angle) * dist);
        nut.rotation.y = Math.random() * Math.PI;
        bowlGroup.add(nut);
      }
    }

    // Floating Ice Block
    if (this.config.toppings.ice) {
      const iceGeo = new THREE.BoxGeometry(0.12, 0.06, 0.12);
      const iceMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.8,
        opacity: 0.85,
        transparent: true,
        roughness: 0.1,
        ior: 1.31,
      });
      const iceCube = new THREE.Mesh(iceGeo, iceMat);
      iceCube.position.set(-0.15, 0.09, 0.1);
      iceCube.rotation.y = 0.4;
      bowlGroup.add(iceCube);
    }

    // 2. Table Side Props (Iconic Peak Milk Tin, Glass of Water, Sugar Box)
    // Peak Milk Tin
    const milkTinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 24);
    const milkTinCanvas = document.createElement('canvas');
    milkTinCanvas.width = 256;
    milkTinCanvas.height = 256;
    const mctx = milkTinCanvas.getContext('2d')!;
    mctx.fillStyle = '#0284c7';
    mctx.fillRect(0, 0, 256, 128);
    mctx.fillStyle = '#facc15';
    mctx.fillRect(0, 128, 256, 128);
    mctx.fillStyle = '#ffffff';
    mctx.font = 'bold 32px sans-serif';
    mctx.textAlign = 'center';
    mctx.fillText('PEAK', 128, 80);
    mctx.font = 'bold 20px sans-serif';
    mctx.fillText('MILK', 128, 110);
    const milkTinTex = new THREE.CanvasTexture(milkTinCanvas);
    const milkTinMat = new THREE.MeshStandardMaterial({
      map: milkTinTex,
      metalness: 0.7,
      roughness: 0.3,
    });
    const milkTin = new THREE.Mesh(milkTinGeo, milkTinMat);
    milkTin.position.set(1.2, -0.4, 1.3);
    milkTin.castShadow = true;
    this.scene.add(milkTin);

    // Glass of Water
    const glassGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.45, 24);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-1.15, -0.38, 1.25);
    glass.castShadow = true;
    this.scene.add(glass);

    // 3. The Spoon
    const spoonGroup = new THREE.Group();
    spoonGroup.position.copy(this.spoonStartPos);
    this.scene.add(spoonGroup);

    // Spoon Metal Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.7, 16);
    const spoonMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });
    const handle = new THREE.Mesh(handleGeo, spoonMetalMat);
    handle.position.set(0.2, 0.15, -0.15);
    handle.rotation.set(-Math.PI / 4, 0, -Math.PI / 6);
    spoonGroup.add(handle);

    // Spoon Bowl / Head
    const spoonHeadGeo = new THREE.SphereGeometry(0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    spoonHeadGeo.scale(1.1, 0.4, 1.4);
    const spoonHead = new THREE.Mesh(spoonHeadGeo, spoonMetalMat);
    spoonHead.rotation.x = Math.PI;
    spoonGroup.add(spoonHead);

    // Garri mound on spoon
    const spoonGarriGeo = new THREE.SphereGeometry(0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    spoonGarriGeo.scale(1.0, 0.35, 1.3);
    const spoonGarriMat = new THREE.MeshStandardMaterial({
      map: liquidTex,
      roughness: 0.4,
    });
    const spoonGarriMesh = new THREE.Mesh(spoonGarriGeo, spoonGarriMat);
    spoonGarriMesh.position.set(0, 0.01, 0);
    spoonGroup.add(spoonGarriMesh);

    // Roasted groundnut riding on the spoon
    const spoonNutGeo = new THREE.SphereGeometry(0.04, 10, 8);
    spoonNutGeo.scale(1.6, 0.8, 1);
    const spoonNutMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.5 });
    const spoonNut = new THREE.Mesh(spoonNutGeo, spoonNutMat);
    spoonNut.position.set(0, 0.05, 0.02);
    spoonGroup.add(spoonNut);

    return {
      bowlGroup,
      spoonGroup,
      spoonGarriMesh,
      liquidMesh,
    };
  }

  private buildParticles() {
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = (Math.random() - 0.5) * 2.5;
      velocities[i * 3 + 1] = Math.random() * 2.2 + 0.5;
      velocities[i * 3 + 2] = Math.random() * 2.0 + 0.2;

      // Golden crunch / milky white particles
      if (Math.random() > 0.4) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.2;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.9;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0,
    });

    const points = new THREE.Points(geo, mat);
    points.position.set(0, 0.45, 1.0); // Mouth level
    this.scene.add(points);

    return { points, geo, velocities };
  }

  // --- Public Animation & Gameplay Triggers ---

  public setMouthOpen(amount: number) {
    this.targetMouthOpen = THREE.MathUtils.clamp(amount, 0, 1);
  }

  public setHungerRatio(ratio: number) {
    this.hungerRatio = THREE.MathUtils.clamp(ratio, 0, 1);
  }

  public setHungerLevel(ratio: number) {
    this.setHungerRatio(ratio);
  }

  public updateConfig(newConfig: SceneConfig) {
    this.config = newConfig;
    const outfitTex = this.createOutfitTexture(newConfig.outfit);
    (this.torsoMesh.material as THREE.MeshStandardMaterial).map = outfitTex;
    (this.torsoMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

    const liquidTex = this.createGarriLiquidTexture(newConfig.garriType);
    (this.liquidMesh.material as THREE.MeshStandardMaterial).map = liquidTex;
    (this.liquidMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
    (this.spoonGarriMesh.material as THREE.MeshStandardMaterial).map = liquidTex;
    (this.spoonGarriMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
  }

  public triggerFeed(isSuccess: boolean) {
    if (this.isFainted) return;

    this.spoonState = 'feeding';
    this.spoonProgress = 0;

    if (isSuccess) {
      // Successful bite!
      setTimeout(() => {
        this.triggerChompSatisfaction();
      }, 280);
    } else {
      // Miss! Spoon wobbles or garri drops onto table!
      setTimeout(() => {
        this.triggerMissReaction();
      }, 300);
    }
  }

  private triggerChompSatisfaction() {
    this.isChewing = true;
    this.chewTimer = 0;
    this.targetMouthOpen = 0;

    // Burst particles
    this.hitParticleActive = true;
    this.hitParticleTimer = 0;
    (this.hitParticles.material as THREE.PointsMaterial).opacity = 1.0;
    const pos = this.hitParticleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] = (Math.random() - 0.5) * 0.15;
      pos[i + 1] = (Math.random() - 0.5) * 0.15;
      pos[i + 2] = (Math.random() - 0.5) * 0.15;
    }
    this.hitParticleGeo.attributes.position.needsUpdate = true;
  }

  private triggerMissReaction() {
    this.isMissShock = true;
    this.missShockTimer = 0;
    this.targetMouthOpen = 1.0; // Gaping shock!
  }

  public triggerGameOverFaint() {
    this.isFainted = true;
    this.faintProgress = 0;
    this.spinningStarsGroup.visible = true;
  }

  public reset() {
    this.isFainted = false;
    this.faintProgress = 0;
    this.isChewing = false;
    this.isMissShock = false;
    this.spinningStarsGroup.visible = false;
    this.characterGroup.rotation.set(0, 0, 0);
    this.headGroup.rotation.set(0, 0, 0);
    this.characterGroup.position.set(0, 0, 0);
    this.spoonState = 'idle';
    this.spoonProgress = 0;
    this.spoonGroup.position.copy(this.spoonStartPos);
    this.spoonGroup.rotation.set(0, 0, 0);
  }

  // --- Main Animation Loop ---

  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      this.updateAnimations(delta, elapsed);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private updateAnimations(delta: number, elapsed: number) {
    // 1. Mouth Opening & Jaw Morphing
    this.mouthOpenAmount = THREE.MathUtils.lerp(this.mouthOpenAmount, this.targetMouthOpen, delta * 12);
    // Move jaw downwards when mouth opens
    this.jawMesh.position.y = -0.16 - this.mouthOpenAmount * 0.14;
    this.jawMesh.scale.set(1 + this.mouthOpenAmount * 0.15, 1, 1);

    // 2. Character Facial Expressions & Hunger Tremors
    if (!this.isFainted) {
      // Hunger shivering increases as hunger ratio drops
      const hungerTremor = (1 - this.hungerRatio) * 0.04;
      const tremorX = (Math.random() - 0.5) * hungerTremor;
      const tremorY = (Math.random() - 0.5) * hungerTremor;

      // Natural breathing & head tilt
      const breath = Math.sin(elapsed * 2.5) * 0.03;
      this.characterGroup.position.y = breath + tremorY;

      // Chewing sequence
      if (this.isChewing) {
        this.chewTimer += delta;
        // Chomp jaw vigorously 3 times
        const chomp = Math.abs(Math.sin(this.chewTimer * 16));
        this.jawMesh.position.y = -0.16 - chomp * 0.08;
        // Head nodding in bliss
        this.headGroup.rotation.x = Math.sin(this.chewTimer * 14) * 0.12;
        // Eyes closed in sweet satisfaction
        this.leftEye.scale.y = 0.2;
        this.rightEye.scale.y = 0.2;
        // Eyebrows raised happily
        this.leftBrow.position.y = 0.26;
        this.rightBrow.position.y = 0.26;

        if (this.chewTimer > 0.8) {
          this.isChewing = false;
          this.leftEye.scale.y = 1.0;
          this.rightEye.scale.y = 1.0;
        }
      }
      // Miss Shock sequence
      else if (this.isMissShock) {
        this.missShockTimer += delta;
        // Head jerks back in comical disbelief
        this.headGroup.rotation.x = -0.25;
        this.headGroup.rotation.y = Math.sin(this.missShockTimer * 20) * 0.1;
        // Eyes popping wide
        this.leftEye.scale.set(1.4, 1.4, 1.4);
        this.rightEye.scale.set(1.4, 1.4, 1.4);
        // Eyebrows furrowed in shock
        this.leftBrow.position.y = 0.16;
        this.rightBrow.position.y = 0.16;
        this.leftBrow.rotation.z = -0.3;
        this.rightBrow.rotation.z = 0.3;

        if (this.missShockTimer > 0.9) {
          this.isMissShock = false;
          this.leftEye.scale.set(1, 1, 1);
          this.rightEye.scale.set(1, 1, 1);
          this.headGroup.rotation.set(0, 0, 0);
          this.leftBrow.rotation.z = 0.1;
          this.rightBrow.rotation.z = -0.1;
        }
      } else {
        // Idle state: eyes track spoon slightly, eyebrows reflect hunger
        this.headGroup.rotation.x = Math.sin(elapsed * 1.5) * 0.04 + tremorX;
        this.headGroup.rotation.y = Math.cos(elapsed * 1.2) * 0.04;

        // Brow tension based on hunger
        const browDrop = (1 - this.hungerRatio) * 0.08;
        this.leftBrow.position.y = 0.22 - browDrop;
        this.rightBrow.position.y = 0.22 - browDrop;

        // Pupils track spoon
        const spoonDeltaX = (this.spoonGroup.position.x - 0.2) * 0.08;
        const spoonDeltaY = (this.spoonGroup.position.y - 0.3) * 0.08;
        this.leftPupil.position.x = spoonDeltaX;
        this.leftPupil.position.y = spoonDeltaY;
        this.rightPupil.position.x = spoonDeltaX;
        this.rightPupil.position.y = spoonDeltaY;
      }
    } else {
      // 3. FAINTED / GAME OVER COMIC COLLAPSE ANIMATION
      if (this.faintProgress < 1.0) {
        this.faintProgress += delta * 1.4;
        const p = Math.min(this.faintProgress, 1.0);
        // Dramatic backward slump & head tilting onto back of chair/floor
        this.characterGroup.rotation.x = -p * (Math.PI / 3);
        this.characterGroup.position.z = -p * 0.4;
        this.characterGroup.position.y = -p * 0.35;
        this.headGroup.rotation.z = p * 0.35; // Head rolling to the side
        this.headGroup.rotation.x = -p * 0.4;
        // Mouth dangling open limp
        this.jawMesh.position.y = -0.32;
        // X-eyes / closed limp eyes
        this.leftEye.scale.y = 0.15;
        this.rightEye.scale.y = 0.15;
      }
      // Orbiting spinning cartoon stars
      this.spinningStarsGroup.rotation.y += delta * 4;
      this.spinningStarsGroup.rotation.x = Math.sin(elapsed * 2) * 0.2;
    }

    // 4. Spoon Movement & Physics
    this.updateSpoon(delta);

    // 5. Particles Update
    if (this.hitParticleActive) {
      this.hitParticleTimer += delta;
      const pos = this.hitParticleGeo.attributes.position.array as Float32Array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3] += this.hitParticleVelocities[i * 3] * delta;
        pos[i * 3 + 1] += this.hitParticleVelocities[i * 3 + 1] * delta;
        pos[i * 3 + 2] += this.hitParticleVelocities[i * 3 + 2] * delta;
        // Gravity
        this.hitParticleVelocities[i * 3 + 1] -= 5.0 * delta;
      }
      this.hitParticleGeo.attributes.position.needsUpdate = true;

      const mat = this.hitParticles.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1.0 - this.hitParticleTimer * 1.6);
      if (this.hitParticleTimer >= 0.7) {
        this.hitParticleActive = false;
        mat.opacity = 0;
      }
    }
  }

  private updateSpoon(delta: number) {
    if (this.spoonState === 'idle') {
      // Gentle idle hover near bowl ready to feed
      const hover = Math.sin(this.clock.getElapsedTime() * 3) * 0.03;
      this.spoonGroup.position.set(0.4, -0.15 + hover, 1.45);
      this.spoonGroup.rotation.set(-0.15, 0.2, 0);
    } else if (this.spoonState === 'feeding') {
      this.spoonProgress += delta * 3.5;
      const t = Math.min(this.spoonProgress, 1.0);

      // Arc trajectory from table/bowl towards mouth
      const start = this.spoonStartPos;
      const end = this.spoonMouthPos;
      // Parabolic arc peak
      const arcY = Math.sin(t * Math.PI) * 0.35;

      this.spoonGroup.position.x = THREE.MathUtils.lerp(start.x, end.x, t);
      this.spoonGroup.position.y = THREE.MathUtils.lerp(start.y, end.y, t) + arcY;
      this.spoonGroup.position.z = THREE.MathUtils.lerp(start.z, end.z, t);

      // Tilting into mouth
      this.spoonGroup.rotation.x = THREE.MathUtils.lerp(-0.1, 0.4, t);
      this.spoonGroup.rotation.z = THREE.MathUtils.lerp(0.2, 0.0, t);

      if (t >= 1.0) {
        // Spoon returns back
        this.spoonState = 'returning';
        this.spoonProgress = 0;
      }
    } else if (this.spoonState === 'returning') {
      this.spoonProgress += delta * 2.8;
      const t = Math.min(this.spoonProgress, 1.0);

      const start = this.spoonMouthPos;
      const end = this.spoonStartPos;

      this.spoonGroup.position.x = THREE.MathUtils.lerp(start.x, end.x, t);
      this.spoonGroup.position.y = THREE.MathUtils.lerp(start.y, end.y, t);
      this.spoonGroup.position.z = THREE.MathUtils.lerp(start.z, end.z, t);

      this.spoonGroup.rotation.x = THREE.MathUtils.lerp(0.4, -0.15, t);

      if (t >= 1.0) {
        this.spoonState = 'idle';
      }
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

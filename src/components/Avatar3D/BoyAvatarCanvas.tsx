import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BoyAvatarCanvasProps {
  className?: string;
}

export default function BoyAvatarCanvas({ className = '' }: BoyAvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const initialWidth = Math.max(container.clientWidth || 360, 100);
    const initialHeight = Math.max(container.clientHeight || 480, 100);

    const camera = new THREE.PerspectiveCamera(
      27,
      initialWidth / initialHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.36, 4.4);
    camera.lookAt(0, 0.36, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- Soft Studio Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Soft Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff8f2, 2.5);
    keyLight.position.set(2.2, 3.2, 3.2);
    scene.add(keyLight);

    // Cool Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xdde3eb, 1.5);
    fillLight.position.set(-2.6, 1.0, 2.6);
    scene.add(fillLight);

    // Rim Backlight (Hair & Shoulder Silhouette)
    const rimLight = new THREE.DirectionalLight(0xffffff, 3.8);
    rimLight.position.set(0, 3.0, -3.0);
    scene.add(rimLight);

    // Soft Under-Bounce
    const bounceLight = new THREE.PointLight(0xa8afbc, 0.7, 5);
    bounceLight.position.set(0, -1.2, 1.4);
    scene.add(bounceLight);

    // --- Avatar Root ---
    const avatarRoot = new THREE.Group();
    avatarRoot.position.set(0, 0, 0);
    scene.add(avatarRoot);

    // --- Curated Materials Palette ---
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebe1,
      roughness: 0.52,
      metalness: 0.01,
    });

    const skinCheekMat = new THREE.MeshStandardMaterial({
      color: 0xeddacf,
      roughness: 0.6,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x161619,
      roughness: 0.38,
      metalness: 0.15,
    });

    const hairLockMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e22,
      roughness: 0.32,
      metalness: 0.2,
    });

    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.9,
      roughness: 0.15,
    });

    const glassesMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.08,
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 0.85,
      transparent: true,
      roughness: 0.02,
      ior: 1.52,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.7,
      metalness: 0.06,
    });

    const hoodieRibMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.65,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x1c1916,
      roughness: 0.15,
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020202 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x5a4642 });

    // ═════════════════════════════════════════════════════════
    // 1. NATURAL STUDENT HOODIE & SHOULDERS
    // ═════════════════════════════════════════════════════════
    const torsoGroup = new THREE.Group();
    avatarRoot.add(torsoGroup);

    // Smooth Curved Torso / Chest
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.65, 32);
    torsoGeo.scale(1.2, 1.0, 0.75);
    const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
    torsoMesh.position.set(0, -0.06, 0);
    torsoGroup.add(torsoMesh);

    // Anatomical Sloping Shoulders (Smooth rounded caps)
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), hoodieMat);
    shoulderL.position.set(-0.42, 0.1, 0);
    shoulderL.scale.set(1.15, 0.95, 0.85);
    torsoGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), hoodieMat);
    shoulderR.position.set(0.42, 0.1, 0);
    shoulderR.scale.set(1.15, 0.95, 0.85);
    torsoGroup.add(shoulderR);

    // Upper Arms (Sloping naturally downward)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.55, 20), hoodieMat);
    armL.position.set(-0.52, -0.16, 0);
    armL.rotation.z = 0.22;
    torsoGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.55, 20), hoodieMat);
    armR.position.set(0.52, -0.16, 0);
    armR.rotation.z = -0.22;
    torsoGroup.add(armR);

    // Hoodie Ribbed Collar
    const collarMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.045, 16, 32),
      hoodieRibMat
    );
    collarMesh.rotation.x = Math.PI / 2 + 0.12;
    collarMesh.position.set(0, 0.22, 0.02);
    collarMesh.scale.set(1.05, 0.9, 1.0);
    torsoGroup.add(collarMesh);

    // Hoodie Drawstrings
    const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 10);
    const stringL = new THREE.Mesh(stringGeo, glassesMetalMat);
    stringL.position.set(-0.07, 0.1, 0.18);
    stringL.rotation.z = 0.06;
    torsoGroup.add(stringL);

    const stringR = new THREE.Mesh(stringGeo, glassesMetalMat);
    stringR.position.set(0.07, 0.1, 0.18);
    stringR.rotation.z = -0.06;
    torsoGroup.add(stringR);

    // Neck (Connects seamlessly into head)
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.32, 24),
      skinMat
    );
    neckMesh.position.set(0, 0.32, 0.01);
    torsoGroup.add(neckMesh);

    // ═════════════════════════════════════════════════════════
    // 2. HEAD PIVOT (Spring Rotation Target)
    // ═════════════════════════════════════════════════════════
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.52, 0.02);
    avatarRoot.add(headPivot);

    // Sculpted Head Cranium (Egg shape with cute chin taper)
    const headGeo = new THREE.SphereGeometry(0.34, 48, 48);
    headGeo.scale(1.0, 1.08, 1.02);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0, 0);
    headPivot.add(headMesh);

    // Cute Soft Cheeks
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), skinCheekMat);
    cheekL.position.set(-0.19, -0.04, 0.26);
    cheekL.scale.set(0.6, 0.8, 0.5);
    headPivot.add(cheekL);

    const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), skinCheekMat);
    cheekR.position.set(0.19, -0.04, 0.26);
    cheekR.scale.set(0.6, 0.8, 0.5);
    headPivot.add(cheekR);

    // Delicate Button Nose
    const noseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 16),
      skinMat
    );
    noseMesh.scale.set(1.0, 0.8, 1.2);
    noseMesh.position.set(0, -0.03, 0.355);
    headPivot.add(noseMesh);

    // Friendly Confident Smile
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, -0.11, 0.33),
      new THREE.Vector3(0, -0.124, 0.345),
      new THREE.Vector3(0.05, -0.11, 0.33)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.005, 8, false);
    const smileMesh = new THREE.Mesh(smileGeo, mouthMat);
    headPivot.add(smileMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.075, 16, 16);
    earGeo.scale(0.26, 1.0, 0.7);

    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.34, 0.01, -0.04);
    earL.rotation.set(0, 0.15, -0.08);
    headPivot.add(earL);

    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.34, 0.01, -0.04);
    earR.rotation.set(0, -0.15, 0.08);
    headPivot.add(earR);

    // ═════════════════════════════════════════════════════════
    // 3. EXPRESSIVE ALMOND EYES
    // ═════════════════════════════════════════════════════════
    const eyesGroup = new THREE.Group();
    headPivot.add(eyesGroup);

    const createEye = (isLeft: boolean) => {
      const eyeRoot = new THREE.Group();
      const x = isLeft ? -0.125 : 0.125;
      eyeRoot.position.set(x, 0.05, 0.32);

      // Sclera
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 24, 24),
        eyeWhiteMat
      );
      sclera.scale.set(1.0, 1.04, 0.55);
      eyeRoot.add(sclera);

      // Iris
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.033, 24), irisMat);
      iris.position.set(0, 0, 0.033);
      eyeRoot.add(iris);

      // Pupil
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.016, 18), pupilMat);
      pupil.position.set(0, 0, 0.034);
      eyeRoot.add(pupil);

      // Specular Glints
      const glint1 = new THREE.Mesh(new THREE.CircleGeometry(0.0085, 12), glintMat);
      glint1.position.set(0.01, 0.01, 0.035);
      eyeRoot.add(glint1);

      const glint2 = new THREE.Mesh(new THREE.CircleGeometry(0.004, 8), glintMat);
      glint2.position.set(-0.008, -0.008, 0.035);
      eyeRoot.add(glint2);

      // Eyelash Line
      const lashCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.042 : -0.026, 0.036, 0.035),
        new THREE.Vector3(0, 0.046, 0.037),
        new THREE.Vector3(isLeft ? 0.026 : 0.042, 0.036, 0.035)
      );
      const lashGeo = new THREE.TubeGeometry(lashCurve, 14, 0.004, 8, false);
      const lashMesh = new THREE.Mesh(lashGeo, mouthMat);
      eyeRoot.add(lashMesh);

      // Blinking Eyelid
      const eyelid = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
        skinMat
      );
      eyelid.rotateX(-Math.PI / 2);
      eyelid.scale.set(1.02, 0.01, 0.6);
      eyeRoot.add(eyelid);

      return { root: eyeRoot, iris, pupil, glint1, glint2, eyelid };
    };

    const eyeL = createEye(true);
    const eyeR = createEye(false);
    eyesGroup.add(eyeL.root);
    eyesGroup.add(eyeR.root);

    // Eyebrows
    const createEyebrow = (isLeft: boolean) => {
      const browCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.052 : -0.012, 0, 0),
        new THREE.Vector3(0, 0.014, 0),
        new THREE.Vector3(isLeft ? 0.012 : 0.052, -0.005, 0)
      );
      const browGeo = new THREE.TubeGeometry(browCurve, 14, 0.0055, 8, false);
      const browMesh = new THREE.Mesh(browGeo, hairMat);
      browMesh.position.set(isLeft ? -0.125 : 0.125, 0.145, 0.33);
      return browMesh;
    };

    const browL = createEyebrow(true);
    const browR = createEyebrow(false);
    headPivot.add(browL);
    headPivot.add(browR);

    // ═════════════════════════════════════════════════════════
    // 4. TRENDY ROUND-HEX STUDENT GLASSES
    // ═════════════════════════════════════════════════════════
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.05, 0.38);
    headPivot.add(glassesGroup);

    const createLensFrame = (isLeft: boolean) => {
      const group = new THREE.Group();
      const x = isLeft ? -0.125 : 0.125;
      group.position.set(x, 0, 0);

      // Round Titanium Ring
      const frameRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.074, 0.006, 16, 36),
        glassesFrameMat
      );
      frameRing.scale.set(1.06, 0.95, 1.0);
      group.add(frameRing);

      // Translucent Glass Lens
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.071, 0.071, 0.003, 24),
        lensMat
      );
      glass.rotation.x = Math.PI / 2;
      glass.scale.set(1.06, 1.0, 0.95);
      group.add(glass);

      return group;
    };

    glassesGroup.add(createLensFrame(true));
    glassesGroup.add(createLensFrame(false));

    // Glasses Bridge
    const bridgeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.042, 0.012, 0.003),
      new THREE.Vector3(0, 0.028, 0.008),
      new THREE.Vector3(0.042, 0.012, 0.003)
    );
    const bridgeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(bridgeCurve, 10, 0.004, 8, false),
      glassesMetalMat
    );
    glassesGroup.add(bridgeMesh);

    // Temples (Arms extending back)
    const templeL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.4), glassesFrameMat);
    templeL.position.set(-0.21, 0.01, -0.2);
    templeL.rotation.y = 0.14;
    glassesGroup.add(templeL);

    const templeR = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.4), glassesFrameMat);
    templeR.position.set(0.21, 0.01, -0.2);
    templeR.rotation.y = -0.14;
    glassesGroup.add(templeR);

    // ═════════════════════════════════════════════════════════
    // 5. RICHLY DETAILED STUDENT HAIRSTYLE (Stylized Volumetric Curtains)
    // ═════════════════════════════════════════════════════════
    const hairGroup = new THREE.Group();
    headPivot.add(hairGroup);

    // Base Hair Volume Cap (Crown and back of skull)
    const hairCapGeo = new THREE.SphereGeometry(0.355, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.08, -0.03);
    hairCap.rotation.x = -0.2;
    hairCap.scale.set(1.02, 1.08, 1.05);
    hairGroup.add(hairCap);

    // Helper to create beautiful stylized hair clumps
    const addHairLock = (
      points: [number, number, number][],
      radii: number[],
      useHighlight = false
    ) => {
      const curvePoints = points.map((p) => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const geo = new THREE.TubeGeometry(curve, 20, radii[0], 10, false);
      const mesh = new THREE.Mesh(geo, useHighlight ? hairLockMat : hairMat);
      hairGroup.add(mesh);
    };

    // --- FRONT SWEPT TEXTURED BANGS (Parted collegiate hairstyle) ---
    // Left-Parted Swept Fringe
    addHairLock([[-0.02, 0.32, 0.22], [-0.08, 0.26, 0.32], [-0.15, 0.18, 0.33]], [0.028], true);
    addHairLock([[-0.04, 0.34, 0.20], [-0.14, 0.28, 0.30], [-0.22, 0.16, 0.31]], [0.026], false);
    addHairLock([[-0.08, 0.35, 0.16], [-0.20, 0.26, 0.26], [-0.28, 0.12, 0.26]], [0.024], true);

    // Right Fringe
    addHairLock([[0.02, 0.33, 0.22], [0.09, 0.27, 0.31], [0.16, 0.18, 0.32]], [0.028], true);
    addHairLock([[0.04, 0.35, 0.20], [0.15, 0.28, 0.29], [0.22, 0.16, 0.30]], [0.026], false);
    addHairLock([[0.08, 0.36, 0.16], [0.20, 0.26, 0.26], [0.28, 0.12, 0.26]], [0.024], true);

    // Center Parting Strands
    addHairLock([[0.0, 0.32, 0.24], [-0.02, 0.36, 0.30], [-0.04, 0.28, 0.34]], [0.022], true);
    addHairLock([[0.01, 0.32, 0.24], [0.04, 0.36, 0.29], [0.06, 0.27, 0.33]], [0.02], false);

    // --- TOP CROWN VOLUMETRIC FLOW (Natural movement) ---
    addHairLock([[0.0, 0.42, 0.12], [-0.08, 0.48, 0.16], [-0.16, 0.40, 0.22]], [0.03], true);
    addHairLock([[0.0, 0.42, 0.12], [0.08, 0.48, 0.16], [0.16, 0.40, 0.22]], [0.03], false);
    addHairLock([[0.0, 0.44, 0.02], [-0.12, 0.50, 0.06], [-0.24, 0.38, 0.12]], [0.028], true);
    addHairLock([[0.0, 0.44, 0.02], [0.12, 0.50, 0.06], [0.24, 0.38, 0.12]], [0.028], false);
    addHairLock([[0.0, 0.45, -0.08], [0.0, 0.51, -0.04], [0.0, 0.44, 0.06]], [0.032], true);

    // --- SIDEBURNS & TEMPLE HAIR (Framing ears & glasses) ---
    addHairLock([[-0.24, 0.28, 0.16], [-0.32, 0.18, 0.12], [-0.32, 0.04, 0.08]], [0.022], false);
    addHairLock([[-0.26, 0.24, 0.10], [-0.34, 0.14, 0.05], [-0.33, 0.0, 0.03]], [0.02], true);
    addHairLock([[0.24, 0.28, 0.16], [0.32, 0.18, 0.12], [0.32, 0.04, 0.08]], [0.022], false);
    addHairLock([[0.26, 0.24, 0.10], [0.34, 0.14, 0.05], [0.33, 0.0, 0.03]], [0.02], true);

    // --- NAPE & BACK OF HEAD ---
    addHairLock([[-0.16, 0.30, -0.16], [-0.22, 0.14, -0.20], [-0.16, 0.0, -0.22]], [0.026], false);
    addHairLock([[0.16, 0.30, -0.16], [0.22, 0.14, -0.20], [0.16, 0.0, -0.22]], [0.026], false);
    addHairLock([[0.0, 0.32, -0.18], [0.0, 0.14, -0.22], [0.0, 0.0, -0.24]], [0.028], true);

    // ═════════════════════════════════════════════════════════
    // 6. AMBIENT BACKGROUND PARTICLES
    // ═════════════════════════════════════════════════════════
    const particleCount = 26;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const radius = 1.3 + Math.random() * 1.1;
      particlePos[i * 3] = Math.cos(theta) * radius;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 2.0 + 0.4;
      particlePos[i * 3 + 2] = Math.sin(theta) * radius - 0.3;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.016,
      transparent: true,
      opacity: 0.35,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ═════════════════════════════════════════════════════════
    // 7. SPRING PHYSICS & INTERACTION ENGINE
    // ═════════════════════════════════════════════════════════
    const pointer = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      velocityX: 0,
      velocityY: 0,
      rollTarget: 0,
      rollCurrent: 0,
      rollVelocity: 0,
    };

    const springK = 0.042;
    const damping = 0.86;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = ((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2));
      const ny = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2));

      pointer.targetX = Math.max(-0.45, Math.min(0.45, nx * 0.45));
      pointer.targetY = Math.max(-0.28, Math.min(0.28, -ny * 0.28));
      pointer.rollTarget = -nx * 0.06;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      pointer.rollTarget = 0;
    };

    window.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseleave', handlePointerLeave);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let nextBlinkTime = 2.2;
    const blinkDuration = 0.12;
    let isBlinking = false;
    let blinkProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Spring Tracking
      const forceX = (pointer.targetX - pointer.currentX) * springK;
      pointer.velocityX = (pointer.velocityX + forceX) * damping;
      pointer.currentX += pointer.velocityX;

      const forceY = (pointer.targetY - pointer.currentY) * springK;
      pointer.velocityY = (pointer.velocityY + forceY) * damping;
      pointer.currentY += pointer.velocityY;

      const forceRoll = (pointer.rollTarget - pointer.rollCurrent) * springK;
      pointer.rollVelocity = (pointer.rollVelocity + forceRoll) * damping;
      pointer.rollCurrent += pointer.rollVelocity;

      // Micro-Breathing & Ambient Sway
      const breathing = Math.sin(elapsedTime * 1.4) * 0.008;
      const idleSwayX = Math.sin(elapsedTime * 0.5) * 0.012;
      const idleSwayY = Math.cos(elapsedTime * 0.35) * 0.008;

      headPivot.rotation.y = pointer.currentX + idleSwayX;
      headPivot.rotation.x = -pointer.currentY + idleSwayY + breathing * 0.15;
      headPivot.rotation.z = pointer.rollCurrent;

      torsoGroup.rotation.y = pointer.currentX * 0.18;
      torsoGroup.position.y = -0.06 + breathing * 0.5;
      avatarRoot.position.y = breathing * 0.6;

      // Eye Saccades (Agile iris tracking)
      const eyeLeadX = Math.max(-0.018, Math.min(0.018, pointer.currentX * 0.04));
      const eyeLeadY = Math.max(-0.014, Math.min(0.014, pointer.currentY * 0.03));

      [eyeL, eyeR].forEach((eye) => {
        eye.iris.position.x = eyeLeadX;
        eye.iris.position.y = eyeLeadY;
        eye.pupil.position.x = eyeLeadX;
        eye.pupil.position.y = eyeLeadY;
        eye.glint1.position.x = 0.01 + eyeLeadX * 0.4;
        eye.glint1.position.y = 0.01 + eyeLeadY * 0.4;
        eye.glint2.position.x = -0.008 + eyeLeadX * 0.4;
        eye.glint2.position.y = -0.008 + eyeLeadY * 0.4;
      });

      // Natural Blinking Cycle
      if (elapsedTime > nextBlinkTime) {
        isBlinking = true;
        blinkProgress = 0;
        nextBlinkTime = elapsedTime + 2.5 + Math.random() * 3.2;
      }

      if (isBlinking) {
        blinkProgress += delta / blinkDuration;
        if (blinkProgress <= 1.0) {
          const scaleY = Math.sin(blinkProgress * Math.PI) * 0.98 + 0.02;
          eyeL.eyelid.scale.y = scaleY;
          eyeR.eyelid.scale.y = scaleY;
        } else {
          isBlinking = false;
          eyeL.eyelid.scale.y = 0.01;
          eyeR.eyelid.scale.y = 0.01;
        }
      }

      // Eyebrow Micro-Expressions
      const browLift = Math.abs(pointer.currentX) * 0.03;
      browL.position.y = 0.145 + browLift;
      browR.position.y = 0.145 + browLift;

      // Particles Drift
      particles.rotation.y = elapsedTime * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      resizeObserver.disconnect();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

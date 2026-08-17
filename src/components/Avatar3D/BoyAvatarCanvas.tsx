import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getExperienceSettings, type ExperienceSettings } from '../../utils/experienceSettings';

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
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- Studio Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Soft Key Light
    const keyLight = new THREE.DirectionalLight(0xfff8f2, 2.6);
    keyLight.position.set(2.2, 3.2, 3.2);
    scene.add(keyLight);

    // Cool Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xdde3eb, 1.6);
    fillLight.position.set(-2.6, 1.0, 2.6);
    scene.add(fillLight);

    // Rim Backlight (Hair & Shoulder Silhouette)
    const rimLight = new THREE.DirectionalLight(0xffffff, 4.2);
    rimLight.position.set(0, 3.0, -3.0);
    scene.add(rimLight);

    // Soft Under-Bounce
    const bounceLight = new THREE.PointLight(0xa8afbc, 0.8, 5);
    bounceLight.position.set(0, -1.2, 1.4);
    scene.add(bounceLight);

    // --- Avatar Root ---
    const avatarRoot = new THREE.Group();
    avatarRoot.position.set(0, 0, 0);
    scene.add(avatarRoot);

    // --- Curated Materials Palette ---
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebe1,
      roughness: 0.5,
      metalness: 0.01,
    });

    const skinCheekMat = new THREE.MeshStandardMaterial({
      color: 0xeddacf,
      roughness: 0.58,
    });

    // Deep sleek obsidian base hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x121215,
      roughness: 0.36,
      metalness: 0.14,
    });

    // Satin textured highlight locks
    const hairHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x1d1d23,
      roughness: 0.32,
      metalness: 0.18,
    });

    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.92,
      roughness: 0.12,
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
      roughness: 0.72,
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

    // Sculpted Head Cranium (Egg shape with refined jaw taper)
    const headGeo = new THREE.SphereGeometry(0.34, 48, 48);
    headGeo.scale(1.0, 1.08, 1.02);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0, 0);
    headPivot.add(headMesh);

    // Soft Cheeks
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
    noseMesh.position.set(0, 0.01, 0.35);
    headPivot.add(noseMesh);

    // Subtle Confident Smile
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.045, -0.1, 0.32),
      new THREE.Vector3(0, -0.118, 0.33),
      new THREE.Vector3(0.045, -0.1, 0.32)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 16, 0.006, 8, false);
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    headPivot.add(mouthMesh);

    // Natural Ears
    const earGeo = new THREE.SphereGeometry(0.065, 16, 16);
    earGeo.scale(0.4, 0.9, 0.6);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.33, 0.03, -0.01);
    earL.rotation.y = -0.18;
    headPivot.add(earL);

    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.33, 0.03, -0.01);
    earR.rotation.y = 0.18;
    headPivot.add(earR);

    // ═════════════════════════════════════════════════════════
    // 3. EXPRESSIVE ANATOMIC EYES
    // ═════════════════════════════════════════════════════════
    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const x = isLeft ? -0.125 : 0.125;
      eyeGroup.position.set(x, 0.05, 0.31);

      // Eye White Sclera
      const scleraGeo = new THREE.SphereGeometry(0.046, 24, 24);
      scleraGeo.scale(1.0, 0.88, 0.65);
      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
      eyeGroup.add(sclera);

      // Deep Brown Iris
      const irisGeo = new THREE.SphereGeometry(0.024, 24, 24);
      irisGeo.scale(1.0, 1.0, 0.3);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, 0, 0.022);
      eyeGroup.add(iris);

      // Obsidian Pupil
      const pupilGeo = new THREE.SphereGeometry(0.012, 16, 16);
      pupilGeo.scale(1.0, 1.0, 0.2);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.026);
      eyeGroup.add(pupil);

      // Catchlight Glints (Dual Anime Glint for life)
      const glint1 = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 12), glintMat);
      glint1.position.set(0.006, 0.007, 0.028);
      eyeGroup.add(glint1);

      const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 10, 10), glintMat);
      glint2.position.set(-0.005, -0.005, 0.028);
      eyeGroup.add(glint2);

      // Delicate Upper Eyelash line
      const lashCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.04, 0.028, 0.02),
        new THREE.Vector3(0, 0.046, 0.028),
        new THREE.Vector3(0.04, 0.028, 0.02)
      );
      const lashGeo = new THREE.TubeGeometry(lashCurve, 12, 0.0035, 6, false);
      const lash = new THREE.Mesh(lashGeo, hairMat);
      eyeGroup.add(lash);

      return eyeGroup;
    };

    const eyeL = createEye(true);
    const eyeR = createEye(false);
    headPivot.add(eyeL);
    headPivot.add(eyeR);

    // Natural Eyebrows
    const createEyebrow = (isLeft: boolean) => {
      const browCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.038 : -0.048, 0, 0),
        new THREE.Vector3(0, 0.016, 0.006),
        new THREE.Vector3(isLeft ? 0.048 : 0.038, 0.004, 0)
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
    // 5. PROPER MODERN STYLED HAIRCUT (Korean Two-Block / Layered Messy Quiff)
    // ═════════════════════════════════════════════════════════
    const hairGroup = new THREE.Group();
    headPivot.add(hairGroup);

    // 1. Sleek Undercut / Taper Fade Base Cap (Snug, smooth curvature)
    const hairCapGeo = new THREE.SphereGeometry(0.35, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.52);
    hairCapGeo.scale(1.02, 1.06, 1.04);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.06, -0.02);
    hairCap.rotation.x = -0.15;
    hairGroup.add(hairCap);

    // 2. Sculpted Volumetric Hair Clump Builder with Natural Thickness & Taper
    const addSculptedHairStrand = (
      curvePoints: [number, number, number][],
      radius: number,
      isHighlight = false,
      scaleX = 1.0,
      scaleY = 1.0
    ) => {
      const pts = curvePoints.map((p) => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 24, radius, 12, false);
      geo.scale(scaleX, scaleY, 1.0);
      const mesh = new THREE.Mesh(geo, isHighlight ? hairHighlightMat : hairMat);
      hairGroup.add(mesh);
    };

    // --- A. TEXTURED FRONT CURTAIN BANGS (60/40 Parted Modern Fringe) ---
    // Left-Parted Swept Fringe (Curving elegantly across the forehead)
    addSculptedHairStrand([[-0.03, 0.31, 0.25], [-0.09, 0.24, 0.33], [-0.15, 0.16, 0.35]], 0.032, true, 1.3, 0.9);
    addSculptedHairStrand([[-0.05, 0.32, 0.23], [-0.13, 0.26, 0.31], [-0.22, 0.15, 0.32]], 0.028, false, 1.2, 0.85);
    addSculptedHairStrand([[-0.08, 0.33, 0.19], [-0.18, 0.25, 0.27], [-0.27, 0.12, 0.27]], 0.026, true, 1.1, 0.9);
    addSculptedHairStrand([[-0.12, 0.31, 0.17], [-0.23, 0.22, 0.22], [-0.29, 0.08, 0.22]], 0.024, false);

    // Right-Parted Fringe (Framing temple and glasses)
    addSculptedHairStrand([[0.03, 0.32, 0.25], [0.09, 0.25, 0.33], [0.16, 0.17, 0.34]], 0.032, true, 1.3, 0.9);
    addSculptedHairStrand([[0.06, 0.33, 0.23], [0.15, 0.26, 0.30], [0.22, 0.15, 0.31]], 0.028, false, 1.2, 0.85);
    addSculptedHairStrand([[0.09, 0.34, 0.19], [0.19, 0.25, 0.26], [0.28, 0.12, 0.26]], 0.026, true, 1.1, 0.9);
    addSculptedHairStrand([[0.13, 0.32, 0.17], [0.24, 0.22, 0.21], [0.30, 0.08, 0.21]], 0.024, false);

    // Parting Accent Center Tuft (Natural organic depth at hairline)
    addSculptedHairStrand([[0.0, 0.32, 0.27], [-0.02, 0.37, 0.31], [-0.03, 0.27, 0.35]], 0.022, true, 1.1, 0.9);
    addSculptedHairStrand([[0.02, 0.32, 0.27], [0.04, 0.37, 0.30], [0.05, 0.26, 0.34]], 0.02, false, 1.1, 0.9);

    // --- B. TOP CROWN & TEXTURED QUIFF VOLUME (Fluffy modern textured look) ---
    addSculptedHairStrand([[0.0, 0.43, 0.14], [-0.07, 0.49, 0.16], [-0.15, 0.41, 0.22]], 0.034, true, 1.2, 0.9);
    addSculptedHairStrand([[0.0, 0.43, 0.14], [0.07, 0.49, 0.16], [0.15, 0.41, 0.22]], 0.034, false, 1.2, 0.9);

    addSculptedHairStrand([[0.0, 0.45, 0.03], [-0.11, 0.51, 0.06], [-0.22, 0.40, 0.12]], 0.032, true, 1.2, 0.9);
    addSculptedHairStrand([[0.0, 0.45, 0.03], [0.11, 0.51, 0.06], [0.22, 0.40, 0.12]], 0.032, false, 1.2, 0.9);

    addSculptedHairStrand([[0.0, 0.46, -0.07], [0.0, 0.52, -0.03], [0.0, 0.45, 0.07]], 0.035, true, 1.3, 0.85);
    addSculptedHairStrand([[-0.08, 0.45, -0.06], [-0.14, 0.48, -0.02], [-0.15, 0.42, 0.07]], 0.03, false);
    addSculptedHairStrand([[0.08, 0.45, -0.06], [0.14, 0.48, -0.02], [0.15, 0.42, 0.07]], 0.03, false);

    // --- C. SLEEK SIDE LOCKS & TEMPLE INTEGRATION (Framing ears smoothly) ---
    addSculptedHairStrand([[-0.25, 0.26, 0.16], [-0.33, 0.16, 0.11], [-0.33, 0.02, 0.07]], 0.024, false, 1.1, 0.8);
    addSculptedHairStrand([[-0.27, 0.22, 0.08], [-0.35, 0.12, 0.04], [-0.34, -0.02, 0.02]], 0.022, true, 1.1, 0.8);

    addSculptedHairStrand([[0.25, 0.26, 0.16], [0.33, 0.16, 0.11], [0.33, 0.02, 0.07]], 0.024, false, 1.1, 0.8);
    addSculptedHairStrand([[0.27, 0.22, 0.08], [0.35, 0.12, 0.04], [0.34, -0.02, 0.02]], 0.022, true, 1.1, 0.8);

    // --- D. CLEAN NAPE TAPER (Seamless neck blend) ---
    addSculptedHairStrand([[-0.14, 0.29, -0.16], [-0.20, 0.13, -0.20], [-0.14, -0.02, -0.22]], 0.028, false);
    addSculptedHairStrand([[0.14, 0.29, -0.16], [0.20, 0.13, -0.20], [0.14, -0.02, -0.22]], 0.028, false);
    addSculptedHairStrand([[0.0, 0.31, -0.19], [0.0, 0.13, -0.23], [0.0, -0.02, -0.24]], 0.03, true);

    // ═════════════════════════════════════════════════════════
    // 6. AMBIENT BACKGROUND PARTICLES
    // ═════════════════════════════════════════════════════════
    const particleCount = 28;
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
    // 7. LIVE EXPERIENCE SETTINGS SYNCHRONIZER
    // ═════════════════════════════════════════════════════════
    const applyExperience = (s: ExperienceSettings) => {
      // Glasses visibility
      glassesGroup.visible = s.avatarGlasses;

      // Hoodie color styling
      if (s.avatarHoodie === 'noir') {
        hoodieMat.color.setHex(0x141417);
        hoodieRibMat.color.setHex(0x222226);
      } else if (s.avatarHoodie === 'graphite') {
        hoodieMat.color.setHex(0x27272a);
        hoodieRibMat.color.setHex(0x3f3f46);
      } else if (s.avatarHoodie === 'arctic') {
        hoodieMat.color.setHex(0xe4e4e7);
        hoodieRibMat.color.setHex(0xd4d4d8);
      } else if (s.avatarHoodie === 'emerald') {
        hoodieMat.color.setHex(0x064e3b);
        hoodieRibMat.color.setHex(0x047857);
      }

      // Studio lighting style
      if (s.avatarLighting === 'cyber') {
        keyLight.color.setHex(0x70d6ff);
        fillLight.color.setHex(0xff70a6);
        rimLight.color.setHex(0x38bdf8);
      } else if (s.avatarLighting === 'noir_rim') {
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 1.4;
        fillLight.color.setHex(0x71717a);
        rimLight.intensity = 5.5;
      } else {
        keyLight.color.setHex(0xfff8f2);
        keyLight.intensity = 2.6;
        fillLight.color.setHex(0xdde3eb);
        rimLight.intensity = 4.2;
      }
    };

    applyExperience(getExperienceSettings());

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ExperienceSettings>;
      if (customEvent.detail) {
        applyExperience(customEvent.detail);
      }
    };
    window.addEventListener('hireme_experience_update', handleSettingsUpdate);

    // ═════════════════════════════════════════════════════════
    // 8. SPRING PHYSICS & INTERACTION ENGINE
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
    const springDamping = 0.84;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1.0, Math.min(1.0, normX));
      const clampedY = Math.max(-1.0, Math.min(1.0, normY));

      pointer.targetX = clampedX * 0.42;
      pointer.targetY = -clampedY * 0.28;
      pointer.rollTarget = -clampedX * 0.08;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (touch.clientX - centerX) / (window.innerWidth / 2);
      const normY = (touch.clientY - centerY) / (window.innerHeight / 2);

      pointer.targetX = Math.max(-0.9, Math.min(0.9, normX)) * 0.38;
      pointer.targetY = -Math.max(-0.9, Math.min(0.9, normY)) * 0.24;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Blink & Micro-animation Loop
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;
    let nextBlinkInterval = 2.8 + Math.random() * 2.5;

    // Resizing with aspect-ratio guard
    const handleResize = () => {
      if (!container) return;
      const width = Math.max(container.clientWidth || 360, 100);
      const height = Math.max(container.clientHeight || 480, 100);
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // ═════════════════════════════════════════════════════════
    // 9. ANIMATION LOOP
    // ═════════════════════════════════════════════════════════
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Spring Physics for Head Rotation
      const forceX = (pointer.targetX - pointer.currentX) * springK;
      pointer.velocityX = (pointer.velocityX + forceX) * springDamping;
      pointer.currentX += pointer.velocityX;

      const forceY = (pointer.targetY - pointer.currentY) * springK;
      pointer.velocityY = (pointer.velocityY + forceY) * springDamping;
      pointer.currentY += pointer.velocityY;

      const forceRoll = (pointer.rollTarget - pointer.rollCurrent) * (springK * 0.8);
      pointer.rollVelocity = (pointer.rollVelocity + forceRoll) * springDamping;
      pointer.rollCurrent += pointer.rollVelocity;

      // Subtle student breathing & micro idle
      const breathY = Math.sin(elapsed * 1.5) * 0.008;
      const breathPitch = Math.sin(elapsed * 1.5) * 0.012;
      const idleYaw = Math.sin(elapsed * 0.7) * 0.02;

      // Apply Head Rotations
      headPivot.rotation.y = pointer.currentX + idleYaw;
      headPivot.rotation.x = pointer.currentY + breathPitch;
      headPivot.rotation.z = pointer.rollCurrent;
      headPivot.position.y = 0.52 + breathY;

      // Gentle Torso Sway
      torsoGroup.rotation.y = pointer.currentX * 0.28 + idleYaw * 0.4;
      torsoGroup.rotation.x = pointer.currentY * 0.18 + breathPitch * 0.4;
      torsoGroup.rotation.z = pointer.rollCurrent * 0.2;
      torsoGroup.position.y = breathY * 0.6;

      // Organic Eye Gaze Follow
      const eyeLookX = pointer.currentX * 0.32;
      const eyeLookY = pointer.currentY * 0.28;
      eyeL.position.x = -0.125 + eyeLookX * 0.018;
      eyeL.position.y = 0.05 + eyeLookY * 0.015;
      eyeR.position.x = 0.125 + eyeLookX * 0.018;
      eyeR.position.y = 0.05 + eyeLookY * 0.015;

      // Natural Blinking
      blinkTimer += delta;
      if (!isBlinking && blinkTimer > nextBlinkInterval) {
        isBlinking = true;
        blinkTimer = 0;
        blinkProgress = 0;
        nextBlinkInterval = 2.4 + Math.random() * 3.2;
      }

      if (isBlinking) {
        blinkProgress += delta * 14;
        const blinkScale = Math.max(0.08, Math.sin(blinkProgress * Math.PI));
        eyeL.scale.y = 1.0 - (1.0 - 0.08) * blinkScale;
        eyeR.scale.y = 1.0 - (1.0 - 0.08) * blinkScale;

        if (blinkProgress >= 1.0) {
          isBlinking = false;
          eyeL.scale.y = 1.0;
          eyeR.scale.y = 1.0;
        }
      }

      // Ambient Particle Orbit
      particles.rotation.y = elapsed * 0.035;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hireme_experience_update', handleSettingsUpdate);

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div
        className={`relative flex items-center justify-center p-8 rounded-3xl bg-zinc-900/60 border border-white/10 text-center ${className}`}
      >
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center text-white font-extrabold text-xs">
            3D
          </div>
          <p className="text-xs font-bold text-white">Spatial Avatar Ready</p>
          <p className="text-[11px] text-zinc-400">WebGL accelerated student model</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[420px] sm:h-[480px] lg:h-[540px] flex items-center justify-center select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

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

    // ═════════════════════════════════════════════════════════
    // 1. SCENE & CAMERA (Cinematic Close-Up Portrait, Big Avatar)
    // ═════════════════════════════════════════════════════════
    const scene = new THREE.Scene();

    const initialWidth = Math.max(container.clientWidth || 420, 100);
    const initialHeight = Math.max(container.clientHeight || 560, 100);

    const camera = new THREE.PerspectiveCamera(
      28,
      initialWidth / initialHeight,
      0.1,
      100
    );
    // Positioned closer and centered on upper chest & head for a large, prominent look
    camera.position.set(0, 0.18, 3.2);
    camera.lookAt(0, 0.18, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ═════════════════════════════════════════════════════════
    // 2. STUDIO LIGHTING RIG
    // ═════════════════════════════════════════════════════════
    const ambientLight = new THREE.AmbientLight(0xfff8f2, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaee, 2.5);
    keyLight.position.set(2.4, 3.2, 3.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    fillLight.position.set(-2.6, 1.4, 2.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 3.2);
    rimLight.position.set(0, 2.8, -2.8);
    scene.add(rimLight);

    const bounceLight = new THREE.PointLight(0xffedd5, 0.8, 5);
    bounceLight.position.set(0, -0.8, 1.6);
    scene.add(bounceLight);

    // ═════════════════════════════════════════════════════════
    // 3. CURATED STYLIZED MATERIALS PALETTE
    // ═════════════════════════════════════════════════════════
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfceee3,
      roughness: 0.58,
      metalness: 0.02,
    });

    const skinWarmMat = new THREE.MeshStandardMaterial({
      color: 0xf7dacb,
      roughness: 0.62,
    });

    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xe0847d,
      roughness: 0.42,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18171f,
      roughness: 0.38,
      metalness: 0.10,
    });

    const hairHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x2e2b3a,
      roughness: 0.32,
      metalness: 0.14,
    });

    // Eye materials
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisOuterMat = new THREE.MeshBasicMaterial({ color: 0x1a1512 });
    const irisInnerMat = new THREE.MeshBasicMaterial({ color: 0x7c451e });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lashMat = new THREE.MeshBasicMaterial({ color: 0x141217 });

    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.92,
      roughness: 0.12,
    });

    const glassesMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      metalness: 0.95,
      roughness: 0.08,
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.84,
      metalness: 0.02,
    });

    const hoodieRibMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.74,
    });

    const agletMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.1,
    });

    // ═════════════════════════════════════════════════════════
    // 4. BOY AVATAR RIG & MODEL ARCHITECTURE (PROPORTIONAL & BIG)
    // ═════════════════════════════════════════════════════════
    const avatarRoot = new THREE.Group();
    avatarRoot.position.set(0, 0, 0);
    // Scaled up slightly for a prominent, impressive hero presence
    avatarRoot.scale.set(1.22, 1.22, 1.22);
    scene.add(avatarRoot);

    // ─────────────────────────────────────────────────────────
    // A. TORSO & STREETWEAR HOODIE (Athletic Natural Fit)
    // ─────────────────────────────────────────────────────────
    const torsoGroup = new THREE.Group();
    avatarRoot.add(torsoGroup);

    // Main Chest / Torso Volume
    const torsoGeo = new THREE.CylinderGeometry(0.26, 0.38, 0.62, 32);
    torsoGeo.scale(1.26, 1.0, 0.76);
    const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
    torsoMesh.position.set(0, -0.18, 0);
    torsoGroup.add(torsoMesh);

    // Natural Sloping Shoulders (Seamless transition)
    const shoulderGeo = new THREE.SphereGeometry(0.15, 24, 24);
    shoulderGeo.scale(1.18, 0.88, 0.85);

    const shoulderL = new THREE.Mesh(shoulderGeo, hoodieMat);
    shoulderL.position.set(-0.35, -0.02, 0);
    torsoGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(shoulderGeo, hoodieMat);
    shoulderR.position.set(0.35, -0.02, 0);
    torsoGroup.add(shoulderR);

    // Upper Arms (Relaxed downward slope)
    const armGeo = new THREE.CylinderGeometry(0.105, 0.13, 0.48, 20);
    const armL = new THREE.Mesh(armGeo, hoodieMat);
    armL.position.set(-0.43, -0.24, 0);
    armL.rotation.z = 0.22;
    torsoGroup.add(armL);

    const armR = new THREE.Mesh(armGeo, hoodieMat);
    armR.position.set(0.43, -0.24, 0);
    armR.rotation.z = -0.22;
    torsoGroup.add(armR);

    // Snug Hoodie Collar Ring (Snug around neck, no floating lip)
    const collarGeo = new THREE.TorusGeometry(0.14, 0.035, 16, 36);
    const collar = new THREE.Mesh(collarGeo, hoodieRibMat);
    collar.rotation.x = Math.PI / 2 + 0.14;
    collar.position.set(0, 0.08, 0.01);
    collar.scale.set(1.08, 0.92, 1.0);
    torsoGroup.add(collar);

    // Hood resting naturally on upper back
    const hoodDrapeGeo = new THREE.TorusGeometry(0.19, 0.065, 16, 32, Math.PI * 1.2);
    const hoodDrape = new THREE.Mesh(hoodDrapeGeo, hoodieMat);
    hoodDrape.position.set(0, 0.05, -0.07);
    hoodDrape.rotation.x = Math.PI / 2 + 0.35;
    hoodDrape.rotation.z = Math.PI * 0.9;
    hoodDrape.scale.set(1.08, 0.95, 1.1);
    torsoGroup.add(hoodDrape);

    // Drawstrings with Metal Aglets
    const createDrawstring = (isLeft: boolean) => {
      const group = new THREE.Group();
      const x = isLeft ? -0.06 : 0.06;
      group.position.set(x, 0.04, 0.13);

      const cordCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(isLeft ? -0.008 : 0.008, -0.09, 0.01),
        new THREE.Vector3(isLeft ? -0.004 : 0.004, -0.17, 0.008),
      ]);
      const cordGeo = new THREE.TubeGeometry(cordCurve, 12, 0.0045, 8, false);
      const cordMesh = new THREE.Mesh(cordGeo, hoodieRibMat);
      group.add(cordMesh);

      const agletGeo = new THREE.CylinderGeometry(0.005, 0.0045, 0.024, 10);
      const aglet = new THREE.Mesh(agletGeo, agletMat);
      aglet.position.set(isLeft ? -0.004 : 0.004, -0.18, 0.008);
      group.add(aglet);

      return group;
    };

    torsoGroup.add(createDrawstring(true));
    torsoGroup.add(createDrawstring(false));

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.22, 24);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.15, 0.01);
    torsoGroup.add(neck);

    // ─────────────────────────────────────────────────────────
    // B. HEAD PIVOT & SCULPTED ANIME/PIXAR FACE (Clean, No Black Bar)
    // ─────────────────────────────────────────────────────────
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.32, 0.02);
    avatarRoot.add(headPivot);

    const headGroup = new THREE.Group();
    headPivot.add(headGroup);

    // 1. Sculpted Head Cranium (Smooth stylized oval)
    const craniumGeo = new THREE.SphereGeometry(0.24, 48, 48);
    craniumGeo.scale(1.0, 1.12, 0.98);
    const craniumMesh = new THREE.Mesh(craniumGeo, skinMat);
    craniumMesh.position.set(0, 0.04, 0);
    headGroup.add(craniumMesh);

    // 2. Sculpted Jaw & Chin (V-line jaw contour)
    const jawGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.20, 32);
    jawGeo.scale(0.95, 1.0, 0.88);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.09, 0.015);
    headGroup.add(jawMesh);

    // Delicate Chin Cap
    const chinGeo = new THREE.SphereGeometry(0.065, 24, 24);
    chinGeo.scale(1.05, 0.75, 0.88);
    const chinMesh = new THREE.Mesh(chinGeo, skinMat);
    chinMesh.position.set(0, -0.17, 0.09);
    headGroup.add(chinMesh);

    // 3. Cute Stylized Button Nose
    const noseTipGeo = new THREE.SphereGeometry(0.015, 16, 16);
    noseTipGeo.scale(1.0, 0.85, 1.0);
    const noseTip = new THREE.Mesh(noseTipGeo, skinWarmMat);
    noseTip.position.set(0, 0.015, 0.245);
    headGroup.add(noseTip);

    // 4. Expressive Lips & Confident Smile
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.034, 0.002, 0.0),
      new THREE.Vector3(0, -0.008, 0.006),
      new THREE.Vector3(0.034, 0.002, 0.0)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 14, 0.0032, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, lipMat);
    mouth.position.set(0, -0.075, 0.22);
    headGroup.add(mouth);

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), lipMat);
    lowerLip.position.set(0, -0.084, 0.223);
    lowerLip.scale.set(1.3, 0.4, 0.5);
    headGroup.add(lowerLip);

    // 5. Stylized Ears
    const createEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const x = isLeft ? -0.24 : 0.24;
      earGroup.position.set(x, 0.03, -0.01);
      earGroup.rotation.y = isLeft ? -0.18 : 0.18;

      const earGeo = new THREE.SphereGeometry(0.055, 16, 16);
      earGeo.scale(0.32, 0.88, 0.58);
      const ear = new THREE.Mesh(earGeo, skinWarmMat);
      earGroup.add(ear);

      return earGroup;
    };

    headGroup.add(createEar(true));
    headGroup.add(createEar(false));

    // ─────────────────────────────────────────────────────────
    // C. GORGEOUS EXPRESSIVE ANIME/PIXAR EYES (Crystal Clear & Sparkling)
    // ─────────────────────────────────────────────────────────
    interface EyeRig {
      root: THREE.Group;
      gazeGroup: THREE.Group;
      scaleGroup: THREE.Group;
    }

    const createAnimeEye = (isLeft: boolean): EyeRig => {
      const root = new THREE.Group();
      const x = isLeft ? -0.088 : 0.088;
      root.position.set(x, 0.052, 0.218);

      const scaleGroup = new THREE.Group();
      root.add(scaleGroup);

      // Sclera
      const scleraGeo = new THREE.SphereGeometry(0.038, 28, 28);
      scleraGeo.scale(1.08, 0.96, 0.45);
      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
      scaleGroup.add(sclera);

      // Gaze Tracking Group
      const gazeGroup = new THREE.Group();
      gazeGroup.position.set(0, 0, 0.016);
      scaleGroup.add(gazeGroup);

      // Outer Iris Ring
      const irisOuterGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.003, 24);
      irisOuterGeo.scale(1.0, 1.0, 0.9);
      const irisOuter = new THREE.Mesh(irisOuterGeo, irisOuterMat);
      irisOuter.rotation.x = Math.PI / 2;
      gazeGroup.add(irisOuter);

      // Inner Amber Highlight
      const irisInnerGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.004, 20);
      const irisInner = new THREE.Mesh(irisInnerGeo, irisInnerMat);
      irisInner.rotation.x = Math.PI / 2;
      irisInner.position.set(0, -0.002, 0.001);
      gazeGroup.add(irisInner);

      // Deep Black Pupil
      const pupilGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.005, 20);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.rotation.x = Math.PI / 2;
      gazeGroup.add(pupil);

      // Catchlight Glints
      const glint1 = new THREE.Mesh(new THREE.SphereGeometry(0.0048, 12, 12), glintMat);
      glint1.position.set(0.006, 0.007, 0.005);
      gazeGroup.add(glint1);

      const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.0024, 10, 10), glintMat);
      glint2.position.set(-0.005, -0.005, 0.005);
      gazeGroup.add(glint2);

      // Upper Eyelash Wing
      const lashCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.034 : -0.028, 0.022, 0.014),
        new THREE.Vector3(0, 0.038, 0.018),
        new THREE.Vector3(isLeft ? 0.028 : 0.034, 0.020, 0.014)
      );
      const lashGeo = new THREE.TubeGeometry(lashCurve, 16, 0.0036, 6, false);
      const lash = new THREE.Mesh(lashGeo, lashMat);
      scaleGroup.add(lash);

      return { root, gazeGroup, scaleGroup };
    };

    const eyeL = createAnimeEye(true);
    const eyeR = createAnimeEye(false);
    headGroup.add(eyeL.root);
    headGroup.add(eyeR.root);

    // Natural Arched Eyebrows (Clearly visible on the forehead)
    const createEyebrow = (isLeft: boolean) => {
      const browCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.032 : -0.040, 0, 0),
        new THREE.Vector3(0, 0.012, 0.006),
        new THREE.Vector3(isLeft ? 0.040 : 0.032, 0.003, 0)
      );
      const browGeo = new THREE.TubeGeometry(browCurve, 14, 0.0038, 6, false);
      const browMesh = new THREE.Mesh(browGeo, hairMat);
      browMesh.position.set(isLeft ? -0.088 : 0.088, 0.118, 0.228);
      return browMesh;
    };

    headGroup.add(createEyebrow(true));
    headGroup.add(createEyebrow(false));

    // ─────────────────────────────────────────────────────────
    // D. ULTRA-SLIM TITANIUM GLASSES (Thin, Delicate, Framing Eyes)
    // ─────────────────────────────────────────────────────────
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.052, 0.265);
    headGroup.add(glassesGroup);

    const createHexFrame = (isLeft: boolean) => {
      const group = new THREE.Group();
      const x = isLeft ? -0.088 : 0.088;
      group.position.set(x, 0, 0);

      // Ultra-thin Titanium Rim
      const rimGeo = new THREE.TorusGeometry(0.054, 0.0028, 12, 6);
      const rimMesh = new THREE.Mesh(rimGeo, glassesFrameMat);
      rimMesh.scale.set(1.08, 0.94, 1.0);
      group.add(rimMesh);

      return group;
    };

    glassesGroup.add(createHexFrame(true));
    glassesGroup.add(createHexFrame(false));

    // Delicate Bridge
    const bridgeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.032, 0.01, 0.002),
      new THREE.Vector3(0, 0.02, 0.005),
      new THREE.Vector3(0.032, 0.01, 0.002)
    );
    const bridgeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(bridgeCurve, 10, 0.0022, 6, false),
      glassesMetalMat
    );
    glassesGroup.add(bridgeMesh);

    // Temple Arms
    const templeCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.145, 0.008, 0),
      new THREE.Vector3(-0.22, 0.012, -0.12),
      new THREE.Vector3(-0.24, -0.008, -0.25),
    ]);
    const templeL = new THREE.Mesh(
      new THREE.TubeGeometry(templeCurveL, 12, 0.0020, 6, false),
      glassesFrameMat
    );
    glassesGroup.add(templeL);

    const templeCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.145, 0.008, 0),
      new THREE.Vector3(0.22, 0.012, -0.12),
      new THREE.Vector3(0.24, -0.008, -0.25),
    ]);
    const templeR = new THREE.Mesh(
      new THREE.TubeGeometry(templeCurveR, 12, 0.0020, 6, false),
      glassesFrameMat
    );
    glassesGroup.add(templeR);

    // ─────────────────────────────────────────────────────────
    // E. STYLISH K-POP / ANIME TWO-BLOCK LAYERED HAIRCUT
    // ─────────────────────────────────────────────────────────
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    // 1. Fitted Base Undercut Mass (High hairline, completely clear of eyes/forehead)
    const baseHairGeo = new THREE.SphereGeometry(0.250, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.44);
    baseHairGeo.scale(1.02, 1.06, 1.04);
    const baseHair = new THREE.Mesh(baseHairGeo, hairMat);
    baseHair.position.set(0, 0.10, -0.02);
    baseHair.rotation.x = -0.05;
    hairGroup.add(baseHair);

    // 2. Sculpted Hair Clump Builder (Flat, tapered ribbons framing forehead cleanly)
    const addHairLock = (
      points: [number, number, number][],
      thickness: number,
      isHighlight = false,
      scaleX = 1.0,
      scaleY = 1.0
    ) => {
      const curve = new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p))
      );
      const geo = new THREE.TubeGeometry(curve, 16, thickness, 8, false);
      geo.scale(scaleX, scaleY, 1.0);
      const mesh = new THREE.Mesh(geo, isHighlight ? hairHighlightMat : hairMat);
      hairGroup.add(mesh);
    };

    // --- 60/40 Parted Curtain Bangs (Resting high on forehead, well above eyes) ---
    // Left side fringe
    addHairLock([[-0.01, 0.28, 0.18], [-0.07, 0.23, 0.22], [-0.14, 0.16, 0.22]], 0.022, true, 1.2, 0.8);
    addHairLock([[-0.04, 0.29, 0.16], [-0.11, 0.24, 0.20], [-0.18, 0.15, 0.20]], 0.020, false, 1.2, 0.8);
    addHairLock([[-0.08, 0.30, 0.14], [-0.15, 0.23, 0.17], [-0.22, 0.13, 0.16]], 0.018, true, 1.1, 0.8);
    addHairLock([[-0.12, 0.28, 0.11], [-0.19, 0.20, 0.13], [-0.24, 0.08, 0.12]], 0.016, false);

    // Right side fringe
    addHairLock([[0.01, 0.28, 0.18], [0.07, 0.23, 0.22], [0.14, 0.16, 0.22]], 0.022, true, 1.2, 0.8);
    addHairLock([[0.04, 0.29, 0.16], [0.11, 0.24, 0.20], [0.18, 0.15, 0.20]], 0.020, false, 1.2, 0.8);
    addHairLock([[0.08, 0.30, 0.14], [0.15, 0.23, 0.17], [0.22, 0.13, 0.16]], 0.018, true, 1.1, 0.8);
    addHairLock([[0.12, 0.28, 0.11], [0.19, 0.20, 0.13], [0.24, 0.08, 0.12]], 0.016, false);

    // Center Parting Accent
    addHairLock([[0.0, 0.29, 0.19], [-0.01, 0.26, 0.22], [-0.02, 0.21, 0.23]], 0.015, true);
    addHairLock([[0.01, 0.29, 0.19], [0.02, 0.26, 0.22], [0.03, 0.21, 0.23]], 0.014, false);

    // --- Top Crown Texture (Flowing naturally) ---
    addHairLock([[0.0, 0.33, 0.12], [-0.06, 0.34, 0.10], [-0.13, 0.28, 0.12]], 0.026, true);
    addHairLock([[0.0, 0.33, 0.12], [0.06, 0.34, 0.10], [0.13, 0.28, 0.12]], 0.026, false);

    addHairLock([[0.0, 0.34, 0.02], [-0.09, 0.35, 0.01], [-0.17, 0.28, 0.04]], 0.024, true);
    addHairLock([[0.0, 0.34, 0.02], [0.09, 0.35, 0.01], [0.17, 0.28, 0.04]], 0.024, false);

    // --- Side Burns & Nape Locks ---
    addHairLock([[-0.18, 0.20, 0.10], [-0.24, 0.12, 0.06], [-0.25, 0.01, 0.04]], 0.018, false);
    addHairLock([[0.18, 0.20, 0.10], [0.24, 0.12, 0.06], [0.25, 0.01, 0.04]], 0.018, false);

    addHairLock([[-0.09, 0.21, -0.13], [-0.13, 0.10, -0.15], [-0.09, -0.01, -0.17]], 0.020, false);
    addHairLock([[0.09, 0.21, -0.13], [0.13, 0.10, -0.15], [0.09, -0.01, -0.17]], 0.020, false);
    addHairLock([[0.0, 0.22, -0.14], [0.0, 0.10, -0.16], [0.0, -0.01, -0.17]], 0.022, true);

    // --- Ambient Particles ---
    const particleCount = 16;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const radius = 1.0 + Math.random() * 0.8;
      particlePos[i * 3] = Math.cos(theta) * radius;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 1.5 + 0.3;
      particlePos[i * 3 + 2] = Math.sin(theta) * radius - 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.012,
      transparent: true,
      opacity: 0.25,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ═════════════════════════════════════════════════════════
    // 5. LIVE EXPERIENCE SETTINGS SYNCHRONIZER
    // ═════════════════════════════════════════════════════════
    const applyExperience = (s: ExperienceSettings) => {
      glassesGroup.visible = s.avatarGlasses;

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

      if (s.avatarLighting === 'cyber') {
        keyLight.color.setHex(0x67e8f9);
        keyLight.intensity = 2.0;
        fillLight.color.setHex(0xf472b6);
        fillLight.intensity = 1.4;
        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 3.6;
      } else if (s.avatarLighting === 'noir_rim') {
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 1.4;
        fillLight.color.setHex(0x71717a);
        fillLight.intensity = 0.8;
        rimLight.color.setHex(0xffffff);
        rimLight.intensity = 4.2;
      } else {
        keyLight.color.setHex(0xfffaee);
        keyLight.intensity = 2.5;
        fillLight.color.setHex(0xdbeafe);
        fillLight.intensity = 1.4;
        rimLight.color.setHex(0xffffff);
        rimLight.intensity = 3.2;
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
    // 6. SPRING PHYSICS & INTERACTIVE CURSOR TRACKING
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

    const springK = 0.082;
    const springDamping = 0.78;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.42;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const normX = dx / (window.innerWidth * 0.5);
      const normY = dy / (window.innerHeight * 0.5);

      const clampedX = Math.max(-1.1, Math.min(1.1, normX));
      const clampedY = Math.max(-1.1, Math.min(1.1, normY));

      pointer.targetX = clampedX * 0.50;
      pointer.targetY = clampedY * 0.36;
      pointer.rollTarget = clampedX * 0.06;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.42;

      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;

      const normX = dx / (window.innerWidth * 0.5);
      const normY = dy / (window.innerHeight * 0.5);

      pointer.targetX = Math.max(-1.0, Math.min(1.0, normX)) * 0.45;
      pointer.targetY = Math.max(-1.0, Math.min(1.0, normY)) * 0.32;
      pointer.rollTarget = Math.max(-1.0, Math.min(1.0, normX)) * 0.05;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;
    let nextBlinkInterval = 3.2 + Math.random() * 2.5;

    const handleResize = () => {
      if (!container) return;
      const width = Math.max(container.clientWidth || 420, 100);
      const height = Math.max(container.clientHeight || 560, 100);
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Head spring physics
      const forceX = (pointer.targetX - pointer.currentX) * springK;
      pointer.velocityX = (pointer.velocityX + forceX) * springDamping;
      pointer.currentX += pointer.velocityX;

      const forceY = (pointer.targetY - pointer.currentY) * springK;
      pointer.velocityY = (pointer.velocityY + forceY) * springDamping;
      pointer.currentY += pointer.velocityY;

      const forceRoll = (pointer.rollTarget - pointer.rollCurrent) * (springK * 0.8);
      pointer.rollVelocity = (pointer.rollVelocity + forceRoll) * springDamping;
      pointer.rollCurrent += pointer.rollVelocity;

      // Natural breathing
      const breathY = Math.sin(elapsed * 1.4) * 0.006;
      const breathPitch = Math.sin(elapsed * 1.4) * 0.008;
      const idleYaw = Math.sin(elapsed * 0.6) * 0.010;

      headPivot.rotation.y = pointer.currentX + idleYaw;
      headPivot.rotation.x = pointer.currentY + breathPitch;
      headPivot.rotation.z = pointer.rollCurrent;
      headPivot.position.y = 0.32 + breathY;

      torsoGroup.rotation.y = pointer.currentX * 0.22 + idleYaw * 0.2;
      torsoGroup.rotation.x = pointer.currentY * 0.14 + breathPitch * 0.2;
      torsoGroup.rotation.z = pointer.rollCurrent * 0.15;
      torsoGroup.position.y = breathY * 0.5;

      // Gaze Tracking
      const eyeLookX = pointer.currentX * 0.007;
      const eyeLookY = -pointer.currentY * 0.005;
      eyeL.gazeGroup.position.x = eyeLookX;
      eyeL.gazeGroup.position.y = eyeLookY;
      eyeR.gazeGroup.position.x = eyeLookX;
      eyeR.gazeGroup.position.y = eyeLookY;

      // Crisp Eye Blinking
      blinkTimer += delta;
      if (!isBlinking && blinkTimer > nextBlinkInterval) {
        isBlinking = true;
        blinkTimer = 0;
        blinkProgress = 0;
        nextBlinkInterval = 2.8 + Math.random() * 3.2;
      }

      if (isBlinking) {
        blinkProgress += delta * 14;
        const blinkScale = Math.max(0.08, Math.sin(blinkProgress * Math.PI));
        eyeL.scaleGroup.scale.y = 1.0 - (1.0 - 0.08) * blinkScale;
        eyeR.scaleGroup.scale.y = 1.0 - (1.0 - 0.08) * blinkScale;

        if (blinkProgress >= 1.0) {
          isBlinking = false;
          eyeL.scaleGroup.scale.y = 1.0;
          eyeR.scaleGroup.scale.y = 1.0;
        }
      }

      particles.rotation.y = elapsed * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointermove', handlePointerMove);
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
      className={`relative w-full h-[480px] sm:h-[560px] lg:h-[620px] flex items-center justify-center select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

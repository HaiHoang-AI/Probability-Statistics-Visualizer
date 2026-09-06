import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { fmt } from '../../utils/math';

interface Surface3DProps {
  rho: number; // Correlation coefficient in [-0.95, 0.95]
}

export const Surface3D: React.FC<Surface3DProps> = ({ rho }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);

  // Spherical camera state
  const cameraStateRef = useRef({
    radius: 22,
    theta: Math.PI / 4, // Horizontal angle (45 deg)
    phi: Math.PI / 3.2, // Vertical elevation angle
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
  });

  // Calculate bivariate normal density
  const calcDensity = (x: number, y: number, r: number) => {
    const clampedR = Math.max(-0.95, Math.min(0.95, r));
    const denom = 2 * Math.PI * Math.sqrt(1 - clampedR * clampedR);
    const exponent = -(x * x - 2 * clampedR * x * y + y * y) / (2 * (1 - clampedR * clampedR));
    return (1 / denom) * Math.exp(exponent);
  };

  // Color mapping function (returns RGB [0..1])
  const getVertexColor = (norm: number): [number, number, number] => {
    if (norm < 0.2) {
      const t = norm / 0.2;
      return [0.05 + 0.1 * t, 0.2 + 0.5 * t, 0.8]; // Navy to Sky
    } else if (norm < 0.5) {
      const t = (norm - 0.2) / 0.3;
      return [0.15 + 0.2 * t, 0.7 + 0.25 * t, 0.8 - 0.5 * t]; // Sky to Green
    } else if (norm < 0.75) {
      const t = (norm - 0.5) / 0.25;
      return [0.35 + 0.6 * t, 0.95 - 0.35 * t, 0.3 - 0.25 * t]; // Green to Amber
    } else {
      const t = (norm - 0.75) / 0.25;
      return [0.95, 0.6 - 0.45 * t, 0.05 + 0.2 * t]; // Amber to Crimson Red
    }
  };

  // Update heights & vertex colors on mesh
  const updateSurface = (r: number) => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const posAttr = geometry.attributes.position;
    const colAttr = geometry.attributes.color;
    const count = posAttr.count;

    const range = 3.2;
    const heightScale = 14.0;
    const maxDensity = calcDensity(0, 0, r);

    for (let i = 0; i < count; i++) {
      // In PlaneGeometry, original plane coordinates are x and y
      const u = posAttr.getX(i);
      const v = posAttr.getY(i);

      // Map plane size (-7 to +7) to domain (-range to +range)
      const domainX = (u / 7) * range;
      const domainY = (v / 7) * range;

      const density = calcDensity(domainX, domainY, r);
      const elevation = density * heightScale;

      // In Three.js with plane rotated -PI/2 on X, elevation is Z in local coordinates
      posAttr.setZ(i, elevation);

      const norm = Math.min(1.0, Math.max(0, density / maxDensity));
      const [cr, cg, cb] = getVertexColor(norm);
      colAttr.setXYZ(i, cr, cg, cb);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.max(420, Math.floor(rect.height));

    // 1. Scene
    const scene = new THREE.Scene();
    const isDark = document.documentElement.classList.contains('dark');
    scene.background = new THREE.Color(isDark ? 0x090d16 : 0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const updateCameraPos = () => {
      const s = cameraStateRef.current;
      camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.radius * Math.cos(s.phi);
      camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(0, 2.0, 0);
    };
    updateCameraPos();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(15, 25, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-15, 10, -15);
    scene.add(dirLight2);

    // 5. Grid Helper Base
    const gridHelper = new THREE.GridHelper(14, 14, isDark ? 0x38bdf8 : 0x0284c7, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Coordinate Axes (X: Red, Y (Up): Green, Z: Blue)
    const axesHelper = new THREE.AxesHelper(8);
    scene.add(axesHelper);

    // 6. Surface Geometry & Mesh
    const segments = 64;
    const geometry = new THREE.PlaneGeometry(14, 14, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    // Initialize vertex color buffer
    const vertexCount = geometry.attributes.position.count;
    const colors = new Float32Array(vertexCount * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometryRef.current = geometry;

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Wireframe overlay for subtle contour grid lines
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(wireMesh);

    // Initial surface computation
    updateSurface(rho);

    // 7. Mouse / Touch Drag Orbit Controls
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      cameraStateRef.current.isDragging = true;
      cameraStateRef.current.prevMouseX = e.clientX;
      cameraStateRef.current.prevMouseY = e.clientY;
      dom.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = cameraStateRef.current;
      if (!s.isDragging) return;

      const deltaX = e.clientX - s.prevMouseX;
      const deltaY = e.clientY - s.prevMouseY;
      s.prevMouseX = e.clientX;
      s.prevMouseY = e.clientY;

      s.theta -= deltaX * 0.008;
      s.phi = Math.max(0.2, Math.min(Math.PI / 2.05, s.phi - deltaY * 0.008));

      updateCameraPos();
    };

    const onPointerUp = (e: PointerEvent) => {
      cameraStateRef.current.isDragging = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = cameraStateRef.current;
      s.radius = Math.max(12, Math.min(40, s.radius + e.deltaY * 0.02));
      updateCameraPos();
    };

    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      const rectNow = container.getBoundingClientRect();
      const w = Math.floor(rectNow.width);
      const h = Math.max(420, Math.floor(rectNow.height));
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      geometry.dispose();
      material.dispose();
      wireMaterial.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update surface when rho changes
  useEffect(() => {
    updateSurface(rho);
  }, [rho]);

  return (
    <div className="space-y-3">
      <div
        ref={mountRef}
        className="w-full h-[460px] rounded-2xl overflow-hidden border-2 border-slate-900 dark:border-slate-700 relative cursor-grab active:cursor-grabbing select-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Kéo chuột để xoay 360° • Cuộn chuột để phóng to/thu nhỏ</span>
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          Đỉnh cực đại: f(0, 0) = {fmt(calcDensity(0, 0, rho), 4)}
        </span>
      </div>
    </div>
  );
};

export default Surface3D;

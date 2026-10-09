"use client";

import { useEffect, useRef } from "react";
import type { Shape3D } from "@/lib/kan/show3dTool";

const AUTO_ROTATE_SPEED = 2.2;

function resolveAccentColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#00ff9d";
}

/**
 * Contenido de la ventana `kind: "3d"` — recibe una lista DECLARATIVA de
 * formas (`Shape3D`, ver `show3dTool.ts`), nunca código: `kan_show_3d`
 * nunca genera JS ejecutable (riesgo de ejecución de código arbitrario si
 * el LLM es manipulado vía prompt injection), así que acá solo hay un
 * mapeo `type` → geometría de three.js.
 *
 * Patrón imperativo (mismo espíritu que `MermaidDiagram.tsx` con
 * `import("mermaid")` dinámico, pero con canvas WebGL en vez de SVG):
 * three.js se carga con `import()` dentro de un `useEffect`, nunca en el
 * bundle inicial de /inicio — solo pesa si el usuario realmente abre esta
 * ventana. Tamaño fijo (`DEFAULT_SIZE["3d"]` en `useFloatingWindows.ts`,
 * `FloatingWindow` no soporta resize por el usuario) — no hace falta
 * `ResizeObserver`, se mide el contenedor una sola vez al montar.
 */
export function Model3DWindowContent({ shapes }: { shapes: Shape3D[] | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shapes || shapes.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let frameId = 0;
    let disposeScene: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (cancelled) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(3, 2.5, 4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const directional = new THREE.DirectionalLight(0xffffff, 1.2);
      directional.position.set(4, 6, 5);
      scene.add(directional);

      const accentColor = new THREE.Color(resolveAccentColor());
      const group = new THREE.Group();

      for (const shape of shapes) {
        const geometry = buildGeometry(THREE, shape);
        if (!geometry) continue;
        const material = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.45, metalness: 0.15 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...shape.position);
        mesh.rotation.set(...shape.rotation);
        group.add(mesh);
      }
      scene.add(group);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
      controls.enablePan = false;

      function animate() {
        frameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      disposeScene = () => {
        cancelAnimationFrame(frameId);
        controls.dispose();
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => m.dispose());
          }
        });
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, [shapes]);

  if (!shapes || shapes.length === 0) {
    return <p className="text-xs text-ink-faint">Sin modelo 3D para mostrar.</p>;
  }

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-lg bg-black/40" />;
}

function buildGeometry(THREE: typeof import("three"), shape: Shape3D): import("three").BufferGeometry | undefined {
  const [sx, sy, sz] = shape.size;
  switch (shape.type) {
    case "box":
      return new THREE.BoxGeometry(sx, sy, sz);
    case "sphere":
      return new THREE.SphereGeometry(sx, 24, 16);
    case "cylinder":
      return new THREE.CylinderGeometry(sx, sx, sy, 24);
    case "cone":
      return new THREE.ConeGeometry(sx, sy, 24);
    default:
      return undefined;
  }
}

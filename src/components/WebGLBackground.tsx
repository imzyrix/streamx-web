import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

const VERT = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uPointer;
uniform float uScroll;
uniform vec2 uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);

  vec2 drift = vec2(uTime * 0.016, -uScroll * 0.4);
  vec2 q = p * 1.5 + drift;

  float f = fbm(q + fbm(q * 1.6 + uTime * 0.01));
  float g = fbm(q * 2.4 - drift * 1.6);

  float contour = abs(fract(f * 5.5) - 0.5);
  float line = smoothstep(0.5, 0.41, contour);
  float soft = smoothstep(0.35, 0.95, g) * 0.05;

  vec2 mouse = (uPointer - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  float halo = smoothstep(0.9, 0.0, distance(p, mouse));

  float value = line * 0.08 + soft + halo * 0.1;
  value *= smoothstep(1.3, 0.12, length(p));

  vec3 col = vec3(value) * (smoothstep(-0.6, 0.4, vUv.y) * 0.8 + 0.2);
  fragColor = vec4(col, 1.0);
}
`;

export function WebGLBackground() {
  const host = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
    } catch {
      return;
    }

    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    scene.add(quad);

    const resize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    };
    resize();

    const renderFrame = () => renderer.render(scene, camera);
    renderFrame();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    if (reduce) {
      return () => {
        resizeObserver.disconnect();
        quad.geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    }

    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };

    const onPointerMove = (event: PointerEvent) => {
      target.x = event.clientX / window.innerWidth;
      target.y = 1 - event.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let visible = !document.hidden;
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // THREE.Clock is deprecated in recent three releases; a monotonic timestamp
    // is all the shader needs.
    const startedAt = performance.now();
    let frame = 0;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      uniforms.uTime.value = (performance.now() - startedAt) / 1000;
      uniforms.uPointer.value.set(current.x, current.y);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      uniforms.uScroll.value = Math.min(1, Math.max(0, window.scrollY / max));
      renderFrame();
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [reduce]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}

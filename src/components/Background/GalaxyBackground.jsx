import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../../hooks/useTheme";
import "./Background.css";

export default function GalaxyBackground() {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Galaxy parameters
    const parameters = {
      count: 45000,
      size: 0.03,
      radius: 5,
      branches: 5,
      spin: 1,
      randomness: 0.3,
      randomnessPower: 3,
      insideColor: isDarkMode ? "#c4b5fd" : "#60a5fa",
      outsideColor: isDarkMode ? "#6366f1" : "#3b82f6",
    };

    // Generate galaxy
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const sizes = new Float32Array(parameters.count);
    const pulseData = []; // Store which stars pulse and their phase

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // 10% of stars will pulse
      sizes[i] = parameters.size;
      if (Math.random() < 0.8) {
        pulseData.push({
          index: i,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5,
        });
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);

          // Criar formato de estrela de 4 pontas
          float angle = atan(uv.y, uv.x);
          float dist = length(uv);

          // Padrão de estrela: raios + centro brilhante
          float rays = abs(cos(angle * 2.0)) * 0.4 + 0.1;
          float star = smoothstep(rays, 0.0, dist);

          // Centro brilhante
          float core = 1.0 - smoothstep(0.0, 0.15, dist);

          // Glow suave ao redor
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);

          float alpha = max(star * 0.8, core) + glow * 0.3;
          if (alpha < 0.01) discard;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = Math.PI * 0.15;
    scene.add(points);

    // Mouse drag rotation
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let rotationX = Math.PI * 0.15;
    let rotationY = 0;
    let targetRotationX = rotationX;
    let targetRotationY = rotationY;
    let autoRotate = true;

    // Zoom
    let targetZoom = camera.position.z;
    const minZoom = 1.5;
    const maxZoom = 10;

    const handleMouseDown = (e) => {
      isDragging = true;
      autoRotate = false;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      // Resume auto-rotation after 2 seconds of inactivity
      setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 2000);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.005;
      targetZoom = Math.max(minZoom, Math.min(maxZoom, targetZoom));
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    // Resize with debounce for performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      }, 100);
    };
    window.addEventListener("resize", handleResize);

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation when not dragging
      if (autoRotate) {
        targetRotationY = elapsedTime * 0.05;
      }

      // Smooth rotation interpolation
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      // Smooth zoom interpolation
      camera.position.z += (targetZoom - camera.position.z) * 0.08;

      points.rotation.x = rotationX;
      points.rotation.y = rotationY;

      // Pulse animation for 10% of stars
      const sizesAttr = geometry.attributes.size;
      for (const star of pulseData) {
        const pulse = Math.sin(elapsedTime * star.speed + star.phase);
        sizesAttr.array[star.index] = parameters.size * (1 + pulse * 0.4);
      }
      sizesAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimeout);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div className={`background-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: isDarkMode
            ? "linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)"
            : "linear-gradient(180deg, #f0f9ff 0%, #dbeafe 50%, #f0f9ff 100%)",
        }}
      />
    </div>
  );
}

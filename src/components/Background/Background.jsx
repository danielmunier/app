import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import "./Background.css";

export default function Background() {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [displayMode, setDisplayMode] = useState(isDarkMode);

  useEffect(() => setDisplayMode(isDarkMode), [isDarkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = false;

    let scale = 4;
    let width = Math.floor(window.innerWidth / scale);
    let height = Math.floor(window.innerHeight / scale);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    let stars = [];
    let shootingStars = [];

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    });

    function calculateStarCount() {
      const area = width * height;
      return Math.max(80, Math.floor(area / 1500));
    }

    function resize() {
      width = Math.floor(window.innerWidth / scale);
      height = Math.floor(window.innerHeight / scale);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      const newStarCount = calculateStarCount();

      if (stars.length < newStarCount) {
        for (let i = stars.length; i < newStarCount; i++) stars.push(new Star());
      } else if (stars.length > newStarCount) {
        stars = stars.slice(0, newStarCount);
      }

      stars.forEach((s) => s.reset());
      shootingStars.forEach((s) => s.reset());
    }

    window.addEventListener("resize", resize);

    // 🌟 Estrela com pulso + flare
    class Star {
      constructor() {
        this.reset();
        this.pulse = Math.random() < 0.35;
        this.pulseSpeed = 0.001 + Math.random() * 0.0015;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.parallaxDepth = Math.random() * 0.6 + 0.4;

        // flare (brilho forte temporário)
        this.flare = false;
        this.flareProgress = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 0.7 + 0.3;
        this.baseOpacity = Math.random() * 0.6 + 0.3;
        this.opacity = this.baseOpacity;
        this.time = Math.random() * 1000;
      }

      update(delta) {
        if (this.pulse) {
          this.time += delta * this.pulseSpeed;
          const pulse = Math.sin(this.time + this.pulsePhase);
          this.opacity = this.baseOpacity * (0.5 + 0.5 * (pulse + 1) / 2);
        }

        // chance de começar um flare
        if (!this.flare && Math.random() < 0.001) {
          this.flare = true;
          this.flareProgress = 1.5; // intensidade inicial
        }

        if (this.flare) {
          this.flareProgress -= delta * 0.002; // fade rápido
          if (this.flareProgress <= 0) {
            this.flare = false;
            this.flareProgress = 0;
          }
        }
      }

      draw() {
        const parallaxX = mouseX * 10 * this.parallaxDepth;
        const parallaxY = mouseY * 10 * this.parallaxDepth;

        // aplicar flare (brilho + tamanho)
        const flareFactor = this.flare ? 1 + this.flareProgress * 0.8 : 1;
        const brightnessBoost = this.flare ? 1 + this.flareProgress * 0.6 : 1;

        const color = displayMode
          ? `rgba(255,255,255,${this.opacity * brightnessBoost})`
          : `rgba(255,230,200,${this.opacity * brightnessBoost})`;

        ctx.fillStyle = color;
        ctx.fillRect(
          this.x + parallaxX,
          this.y + parallaxY,
          this.size * flareFactor,
          this.size * flareFactor
        );
      }
    }

    // 🌠 Estrela cadente
    class ShootingStar {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5;
        this.len = Math.random() * 30 + 10;
        this.speed = Math.random() * 2 + 0.5;
        this.angle = Math.PI / 4;
        this.alpha = 1;
      }
      update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        this.alpha -= 0.01;
        if (this.alpha <= 0 || this.x > width || this.y > height) this.reset();
      }
      draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        for (let i = 0; i < this.len; i++) {
          const x = this.x - i * Math.cos(this.angle);
          const y = this.y - i * Math.sin(this.angle);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Criar estrelas
    const initialStarCount = calculateStarCount();
    for (let i = 0; i < initialStarCount; i++) stars.push(new Star());
    shootingStars.push(new ShootingStar());

    let lastTime = performance.now();

    function animate(time) {
      const delta = time - lastTime;
      lastTime = time;

      ctx.fillStyle = displayMode ? "#0d0d1a" : "#b0a8ff";
      ctx.fillRect(0, 0, width, height);

      for (let s of stars) {
        s.update(delta);
        s.draw();
      }

      if (Math.random() < 0.004 && shootingStars.length < 2)
        shootingStars.push(new ShootingStar());

      for (let s of shootingStars) {
        s.update();
        s.draw();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return () => window.removeEventListener("resize", resize);
  }, [displayMode]);

  return (
    <div className={`background-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas ref={canvasRef} className="stars-canvas" />
    </div>
  );
}

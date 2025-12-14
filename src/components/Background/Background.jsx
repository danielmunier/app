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
    ctx.imageSmoothingEnabled = true;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

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
      return Math.max(100, Math.floor(area / 8000));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

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
        this.size = Math.random() * 2 + 1;
        this.baseOpacity = Math.random() * 0.7 + 0.3;
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
        const parallaxX = mouseX * 20 * this.parallaxDepth;
        const parallaxY = mouseY * 20 * this.parallaxDepth;

        // aplicar flare (brilho + tamanho)
        const flareFactor = this.flare ? 1 + this.flareProgress * 0.8 : 1;
        const brightnessBoost = this.flare ? 1 + this.flareProgress * 0.6 : 1;

        const color = displayMode
          ? `rgba(255,255,255,${this.opacity * brightnessBoost})`
          : `rgba(180,140,160,${this.opacity * brightnessBoost})`;

        ctx.beginPath();
        ctx.arc(
          this.x + parallaxX,
          this.y + parallaxY,
          this.size * flareFactor,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
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
        this.len = Math.random() * 80 + 40;
        this.speed = Math.random() * 4 + 2;
        this.angle = Math.PI / 4;
        this.alpha = 1;
      }
      update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        this.alpha -= 0.008;
        if (this.alpha <= 0 || this.x > width || this.y > height) this.reset();
      }
      draw() {
        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x - this.len * Math.cos(this.angle),
          this.y - this.len * Math.sin(this.angle)
        );
        gradient.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        gradient.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - this.len * Math.cos(this.angle),
          this.y - this.len * Math.sin(this.angle)
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
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

      ctx.fillStyle = displayMode ? "#0d0d1a" : "#e8b4c8";
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

import { useEffect, useRef } from "react";

export default function StarryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height;
    let stars = [], shootingStars = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);
    resize();

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.2;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      }
      draw() {
        // Piscar aleatório leve
        if (Math.random() < 0.05) this.opacity += (Math.random() - 0.5) * 0.1;
        this.opacity = Math.max(0.2, Math.min(this.opacity, 1));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5;
        this.len = Math.random() * 150 + 50; // comprimento menor
        this.speed = Math.random() * 4 + 1; // velocidade menor
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
        ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - this.len * Math.cos(this.angle),
          this.y - this.len * Math.sin(this.angle)
        );
        ctx.stroke();
      }
    }

    // Quantidade menor de estrelas e shooting stars
    for (let i = 0; i < 200; i++) stars.push(new Star());
    for (let i = 0; i < 1; i++) shootingStars.push(new ShootingStar());

    function animate() {
      // Fundo preto
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      for (let s of stars) s.draw();

      // Shooting stars aparecendo aleatoriamente com menos frequência
      if (Math.random() < 0.005 && shootingStars.length < 2) {
        shootingStars.push(new ShootingStar());
      }
      for (let s of shootingStars) {
        s.update();
        s.draw();
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    </div>
  );
}

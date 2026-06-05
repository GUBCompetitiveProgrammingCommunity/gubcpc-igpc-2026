import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

export default function Bubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let raf: number;

    const BUBBLE_COUNT = 40;
    const bubbles: Bubble[] = Array.from({ length: BUBBLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 18 + 4,
      opacity: Math.random() * 0.2 + 0.05,
      hue: Math.random() * 40 + 120,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;

      bubbles.forEach((b) => {
        const dx = mx - b.x, dy = my - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(80 / dist, 0.6);
        b.vx += (dx / dist) * force * 0.015;
        b.vy += (dy / dist) * force * 0.015;
        b.vx *= 0.985;
        b.vy *= 0.985;
        b.x += b.vx;
        b.y += b.vy;
        b.pulse += b.pulseSpeed;

        if (b.x < -b.r) b.x = W + b.r;
        if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        if (b.y > H + b.r) b.y = -b.r;

        const pulseFactor = 1 + Math.sin(b.pulse) * 0.15;
        const currentR = b.r * pulseFactor;
        const alpha = b.opacity * (0.7 + Math.sin(b.pulse) * 0.3);

        const grad = ctx.createRadialGradient(b.x - currentR * 0.3, b.y - currentR * 0.3, 0, b.x, b.y, currentR);
        grad.addColorStop(0, `hsla(${b.hue}, 90%, 70%, ${alpha * 0.8})`);
        grad.addColorStop(0.6, `hsla(${b.hue}, 70%, 40%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${b.hue}, 60%, 20%, 0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x, b.y, currentR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${b.hue}, 80%, 60%, ${alpha * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        const glowGrad = ctx.createRadialGradient(b.x, b.y, currentR * 0.5, b.x, b.y, currentR * 2.5);
        glowGrad.addColorStop(0, `hsla(${b.hue}, 80%, 50%, ${alpha * 0.15})`);
        glowGrad.addColorStop(1, "hsla(0,0%,0%,0)");
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
}

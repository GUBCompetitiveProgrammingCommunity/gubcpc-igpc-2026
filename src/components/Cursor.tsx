import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const TRAIL_COUNT = 6;
    const trailEls: HTMLDivElement[] = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:9998;
        border-radius:50%; background:rgba(34,197,94,${0.15 - i * 0.02});
        width:${10 - i}px; height:${10 - i}px;
        transform:translate(-50%,-50%);
        box-shadow:0 0 ${6 - i}px rgba(34,197,94,0.3);
        transition: opacity 0.2s;
      `;
      document.body.appendChild(el);
      trailEls.push(el);
    }
    trailsRef.current = trailEls;

    let mouseX = 0, mouseY = 0;
    const trailPositions = trailEls.map(() => ({ x: 0, y: 0 }));

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(dotRef.current, { x: mouseX, y: mouseY, duration: 0.05, ease: "none" });
      gsap.to(ringRef.current, { x: mouseX, y: mouseY, duration: 0.25, ease: "power2.out" });
    };

    let raf: number;
    const animateTrails = () => {
      let prevX = mouseX, prevY = mouseY;
      trailEls.forEach((el, i) => {
        trailPositions[i].x += (prevX - trailPositions[i].x) * (0.3 - i * 0.03);
        trailPositions[i].y += (prevY - trailPositions[i].y) * (0.3 - i * 0.03);
        el.style.left = trailPositions[i].x + "px";
        el.style.top = trailPositions[i].y + "px";
        prevX = trailPositions[i].x;
        prevY = trailPositions[i].y;
      });
      raf = requestAnimationFrame(animateTrails);
    };
    raf = requestAnimationFrame(animateTrails);

    const onEnter = () => {
      gsap.to(ringRef.current, { scale: 2, opacity: 0.8, duration: 0.3 });
    };
    const onLeave = () => {
      gsap.to(ringRef.current, { scale: 1, opacity: 1, duration: 0.3 });
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      trailEls.forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] w-2 h-2 rounded-full bg-green-400"
        style={{ transform: "translate(-50%,-50%)", boxShadow: "0 0 8px #4ade80, 0 0 20px #22c55e" }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9998] w-8 h-8 rounded-full border border-green-400/70"
        style={{ transform: "translate(-50%,-50%)", boxShadow: "0 0 12px rgba(34,197,94,0.3)" }}
      />
    </>
  );
}

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Loader() {
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(logoRef.current, { scale: 0, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: "back.out(1.7)" })
      .fromTo(textRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2")
      .to(progressRef.current, { width: "100%", duration: 1.5, ease: "power2.inOut" }, "-=0.1");
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #0a1f0d 0%, #050f07 70%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: "#22c55e",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              boxShadow: "0 0 6px #22c55e",
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-green-500/10 animate-spin"
            style={{
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
              left: "50%", top: "50%",
              transform: "translate(-50%,-50%)",
              animationDuration: `${(i + 1) * 4}s`,
              animationDirection: i % 2 ? "reverse" : "normal",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-3xl bg-green-500/20 scale-150" />
          <img
            ref={logoRef}
            src="/logo-dark.png"
            alt="GUBCPC"
            className="relative w-52 h-auto object-contain"
            style={{ filter: "drop-shadow(0 0 30px rgba(34,197,94,0.4))" }}
          />
        </div>

        <div ref={textRef} className="flex flex-col items-center gap-1">
          <p className="text-green-400/80 text-sm tracking-[0.4em] uppercase font-light">
            Loading Contest Platform
          </p>
          <div className="flex gap-1.5 mt-2">
            {[0, 0.2, 0.4].map((delay, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
        </div>

        <div className="w-64 h-0.5 bg-green-900/50 rounded-full overflow-hidden">
          <div ref={progressRef} className="h-full rounded-full"
            style={{ width: "0%", background: "linear-gradient(90deg, #16a34a, #4ade80, #16a34a)", boxShadow: "0 0 10px #22c55e" }}
          />
        </div>
      </div>
    </div>
  );
}

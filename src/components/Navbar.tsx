import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const links = [
  { to: "/", label: "Home", icon: "⬡" },
  { to: "/about", label: "About", icon: "◈" },
  { to: "/schedule", label: "Schedule", icon: "◆" },
  { to: "/contact", label: "Contact", icon: "◉" },
];

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const scrolled = scrollY > 60;
  const intensity = Math.min(scrollY / 300, 1);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!progressRef.current) return;
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrollY / total) * 100 : 0;
    gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.1, ease: "none" });
  }, [scrollY]);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      paddingTop: scrolled ? "10px" : "20px",
      paddingBottom: scrolled ? "10px" : "20px",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [scrolled]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 }
      );
      if (linksRef.current) {
        gsap.fromTo(linksRef.current.children,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: "back.out(1.5)", delay: 0.3 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-[200]"
      style={{
        paddingTop: "20px",
        paddingBottom: "20px",
        background: scrolled ? `rgba(4,12,6,${0.88 + intensity * 0.1})` : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        transition: "background 0.5s ease, box-shadow 0.5s ease",
        boxShadow: scrolled
          ? `0 2px 40px rgba(0,0,0,0.5), 0 0 ${20 + intensity * 40}px rgba(34,197,94,${intensity * 0.06})`
          : "none",
      }}
    >
      {/* bottom glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none transition-all duration-500"
        style={{
          background: scrolled
            ? `linear-gradient(90deg, transparent, rgba(34,197,94,${0.2 + intensity * 0.3}) 30%, rgba(74,222,128,${0.3 + intensity * 0.3}) 50%, rgba(34,197,94,${0.2 + intensity * 0.3}) 70%, transparent)`
            : "none",
          boxShadow: scrolled ? `0 0 ${intensity * 12}px rgba(34,197,94,0.4)` : "none",
        }}
      />

      {/* scroll progress bar */}
      <div ref={progressRef} className="absolute bottom-0 left-0 h-px"
        style={{
          width: "0%",
          background: "linear-gradient(90deg, #16a34a, #4ade80, #86efac)",
          boxShadow: "0 0 8px #22c55e",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.4s",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-hover>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl transition-all duration-500"
              style={{ background: "rgba(34,197,94,0.2)", transform: scrolled ? "scale(1.4)" : "scale(1)", opacity: scrolled ? 0.8 : 0.3 }}
            />
            {/**<img src="/logo-dark.png" alt="GUBCPC" className="relative h-10 w-auto transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 ${scrolled ? 16 + intensity * 12 : 6}px rgba(34,197,94,${0.3 + intensity * 0.4}))`,
                transform: `scale(${scrolled ? 0.9 : 1})`,
              }}
            />**/}
          </div>
          <div className="hidden lg:flex flex-col leading-tight transition-all duration-500"
            style={{ opacity: scrolled ? 0 : 1, transform: `translateX(${scrolled ? -10 : 0}px)` }}>
            <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: "#4ade80" }}>GUBCPC</span>
            <span className="text-[9px] tracking-[0.15em] uppercase text-green-600">IUPC 2026</span>
          </div>
        </Link>

        <div ref={linksRef} className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} data-hover
                className="relative px-4 py-2 text-sm font-medium tracking-wide group overflow-hidden rounded-xl"
                style={{ color: active ? "#4ade80" : "rgba(255,255,255,0.65)" }}>
                <span className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }} />
                <span className="relative z-10 flex items-center gap-1.5 group-hover:text-green-300 transition-colors duration-200">
                  <span className="text-green-600 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
                    {l.icon}
                  </span>
                  {l.label}
                </span>
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px rounded-full"
                    style={{ width: "60%", background: "linear-gradient(90deg, transparent, #4ade80, transparent)", boxShadow: "0 0 8px #22c55e" }}
                  />
                )}
              </Link>
            );
          })}

          <div className="ml-3 relative group">
            <div className="absolute -inset-0.5 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }} />
            <Link to="/contact" data-hover
              className="relative px-5 py-2.5 text-xs font-black rounded-full text-black flex items-center gap-2 transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: `0 0 ${scrolled ? 25 : 15}px rgba(34,197,94,${scrolled ? 0.4 : 0.25})`,
                letterSpacing: "0.08em",
              }}>
              <span>REGISTER</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}
          style={{ border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.05)" }} data-hover>
          <span className={`block w-5 h-0.5 bg-green-400 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-green-400 transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-green-400 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
          style={{ background: "rgba(4,12,6,0.98)", borderTop: "1px solid rgba(34,197,94,0.1)", backdropFilter: "blur(20px)" }}>
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color: location.pathname === l.to ? "#4ade80" : "rgba(255,255,255,0.7)",
                background: location.pathname === l.to ? "rgba(34,197,94,0.08)" : "transparent",
                border: location.pathname === l.to ? "1px solid rgba(34,197,94,0.2)" : "1px solid transparent",
              }}>
              <span className="text-green-500 text-xs">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <Link to="/contact"
            className="mt-2 px-4 py-3.5 rounded-xl text-sm font-black text-center text-black"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            Register Now →
          </Link>
        </div>
      )}
    </nav>
  );
}

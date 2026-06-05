import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

gsap.registerPlugin(ScrollTrigger);

function useTyping(words: string[], speed = 80, pause = 1800) {
  const stateRef = useRef({ wIdx: 0, charIdx: 0, deleting: false });
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const word = words[s.wIdx];
      if (!s.deleting) {
        if (s.charIdx < word.length) {
          s.charIdx++;
          setDisplay(word.slice(0, s.charIdx));
          timer = setTimeout(tick, speed);
        } else {
          s.deleting = true;
          timer = setTimeout(tick, pause);
        }
      } else {
        if (s.charIdx > 0) {
          s.charIdx--;
          setDisplay(word.slice(0, s.charIdx));
          timer = setTimeout(tick, speed / 2);
        } else {
          s.deleting = false;
          s.wIdx = (s.wIdx + 1) % words.length;
          timer = setTimeout(tick, speed);
        }
      }
    };
    timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [words, speed, pause]);

  return display;
}

function Countdown({ target }: { target: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Days", val: time.d },
    { label: "Hours", val: time.h },
    { label: "Minutes", val: time.m },
    { label: "Seconds", val: time.s },
  ];

  return (
    <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
      {units.map(({ label, val }) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="countdown-digit relative flex items-center justify-center rounded-2xl text-3xl sm:text-4xl font-bold font-mono"
            style={{
              width: "6rem",
              height: "6rem",
              background: "linear-gradient(145deg, rgba(0,25,10,0.9), rgba(0,15,6,0.95))",
              border: "1px solid rgba(34,197,94,0.2)",
              boxShadow: "0 0 30px rgba(34,197,94,0.06), inset 0 1px 0 rgba(34,197,94,0.1)",
              color: "#4ade80",
              textShadow: "0 0 20px rgba(74,222,128,0.5)",
            }}
          >
            <span className="relative z-10 tabular-nums">{String(val).padStart(2, "0")}</span>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }} />
            <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)" }} />
            <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.08), transparent 60%)" }} />
          </div>
          <span className="mt-2.5 text-[10px] tracking-[0.25em] text-green-600 uppercase font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home({ data }: { data: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const countdownSectionRef = useRef<HTMLDivElement>(null);
  const countdownTitleRef = useRef<HTMLDivElement>(null);
  const countdownDigitsRef = useRef<HTMLDivElement>(null);
  const sliderSectionRef = useRef<HTMLDivElement>(null);
  const sliderTitleRef = useRef<HTMLDivElement>(null);
  const sliderBoxRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  const typed = useTyping([
    "Competitive Programming",
    "Algorithm Mastery",
    "Code. Think. Solve.",
    "GUB IUPC 2026",
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl
        .fromTo(badgeRef.current, { y: 30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" })
        .fromTo(logoRef.current, { y: 40, opacity: 0, scale: 0.85, filter: "blur(10px)" }, { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" }, "-=0.3")
        .fromTo(headingRef.current, { y: 50, opacity: 0, skewY: 3 }, { y: 0, opacity: 1, skewY: 0, duration: 0.9, ease: "power4.out" }, "-=0.4")
        .fromTo(typingRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .fromTo(descRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .fromTo(btnsRef.current!.children, { y: 20, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.6, ease: "back.out(1.5)" }, "-=0.3")
        .fromTo(metaRef.current!.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" }, "-=0.2");

      gsap.fromTo(countdownTitleRef.current, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: countdownSectionRef.current, start: "top 80%" }
      });
      gsap.fromTo(countdownDigitsRef.current?.querySelectorAll(".countdown-digit") || [], { y: 40, opacity: 0, scale: 0.8, rotateX: 45 }, {
        y: 0, opacity: 1, scale: 1, rotateX: 0,
        stagger: 0.1, duration: 0.8, ease: "back.out(1.5)",
        scrollTrigger: { trigger: countdownSectionRef.current, start: "top 75%" }
      });

      gsap.fromTo(sliderTitleRef.current, { y: 40, opacity: 0, x: -30 }, {
        y: 0, opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sliderSectionRef.current, start: "top 80%" }
      });
      gsap.fromTo(sliderBoxRef.current, { y: 60, opacity: 0, scale: 0.95 }, {
        y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sliderSectionRef.current, start: "top 75%" }
      });

      if (statsGridRef.current) {
        const statsP = statsSectionRef.current?.querySelector("p");
        const statsH2 = statsSectionRef.current?.querySelector("h2");
        if (statsP) gsap.fromTo(statsP, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, scrollTrigger: { trigger: statsSectionRef.current, start: "top 80%" } });
        if (statsH2) gsap.fromTo(statsH2, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.1, scrollTrigger: { trigger: statsSectionRef.current, start: "top 80%" } });
        gsap.fromTo(statsGridRef.current.children, { y: 50, opacity: 0, scale: 0.85, rotate: -3 }, {
          y: 0, opacity: 1, scale: 1, rotate: 0,
          stagger: 0.12, duration: 0.7, ease: "back.out(1.5)",
          scrollTrigger: { trigger: statsGridRef.current, start: "top 80%" }
        });
      }

      if (ctaSectionRef.current) {
        gsap.fromTo(ctaSectionRef.current, { y: 60, opacity: 0, scale: 0.96 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ctaSectionRef.current, start: "top 85%" }
        });
        gsap.fromTo(ctaSectionRef.current.querySelectorAll(".cta-item"), { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: ctaSectionRef.current, start: "top 75%" }
        });
      }

      if (heroRef.current) {
        gsap.to(heroRef.current.querySelector(".hero-grid"), {
          yPercent: 30, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const event = data?.event;
  const slider = data?.slider || [];
  const stats = data?.about?.stats || [];

  return (
    <main>
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(16,78,36,0.5) 0%, transparent 65%)" }}
      >
        <div
          className="hero-grid absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(34,197,94,0.07) 1px, transparent 1px),
              linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px, 60px 60px, 60px 60px",
          }}
        />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: `${(i + 1) * 280}px`,
              height: `${(i + 1) * 280}px`,
              border: `1px solid rgba(34,197,94,${0.06 - i * 0.01})`,
              left: "50%", top: "42%",
              transform: "translate(-50%,-50%)",
              animation: `spin ${10 + i * 5}s linear infinite ${i % 2 ? "reverse" : "normal"}`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-5">
          <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 8px #22c55e" }} />
            Registration Open — IUPC 2026
          </div>

          <div ref={logoRef}>
            <img src="/logo-dark.png" alt="GUBCPC" className="h-28 w-auto mx-auto"
              style={{ filter: "drop-shadow(0 0 40px rgba(34,197,94,0.4))" }} />
          </div>

          <h1 ref={headingRef} className="text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight"
            style={{
              background: "linear-gradient(160deg, #ffffff 0%, #bbf7d0 40%, #4ade80 70%, #16a34a 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
            Intra University<br />Programming Contest
          </h1>

          <div ref={typingRef} className="h-10 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-mono text-green-300">
              {typed}
              <span className="text-green-400" style={{ animation: "blink 1s step-end infinite" }}>|</span>
            </span>
          </div>

          <p ref={descRef} className="max-w-xl text-green-200/55 text-base leading-relaxed font-light">
            {event?.description || "Compete with the best. Conquer algorithms. Rise to the top."}
          </p>

          <div ref={btnsRef} className="flex flex-wrap gap-4 justify-center mt-1">
            <a href="/contact" data-hover
              className="px-8 py-3.5 rounded-full font-bold text-black text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
              Register Your Team →
            </a>
            <a href="/schedule" data-hover
              className="px-8 py-3.5 rounded-full font-semibold text-sm border border-green-500/30 text-green-300 transition-all duration-300 hover:bg-green-500/10 hover:border-green-400/50 hover:scale-105">
              View Schedule
            </a>
          </div>

          <div ref={metaRef} className="flex items-center gap-5 mt-1 flex-wrap justify-center">
            {[
              { icon: "📍", text: event?.venue || "Green University of Bangladesh" },
              { icon: "📅", text: "September 19–20, 2026" },
              { icon: "🏆", text: "Prize Pool: BDT 50,000" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-green-400/55">
                {i > 0 && <span className="hidden sm:block w-px h-3 bg-green-800" />}
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="text-[10px] text-green-500 tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-green-500 to-transparent" />
        </div>
      </section>

      <section ref={countdownSectionRef} className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,78,36,0.12), transparent)" }} />
        <div className="max-w-3xl mx-auto text-center">
          <div ref={countdownTitleRef}>
            <p className="text-green-500 text-xs tracking-[0.4em] uppercase font-bold mb-3">Event Countdown</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Contest Begins In</h2>
            <p className="text-green-400/50 text-sm mb-10">
              <span className="text-green-400">GUBCPC</span> Intra University Programming Contest 2026
            </p>
          </div>
          <div ref={countdownDigitsRef}>
            <Countdown target={event?.date || "2026-09-20T09:00:00"} />
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-green-600">
            <span className="w-1 h-1 rounded-full bg-green-600 animate-pulse" />
            Registration deadline:
            <span className="text-green-400 font-semibold">September 10, 2026</span>
          </div>
        </div>
      </section>

      {slider.length > 0 && (
        <section ref={sliderSectionRef} className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div ref={sliderTitleRef} className="text-center mb-10">
              <p className="text-green-500 text-xs tracking-[0.4em] uppercase font-bold mb-2">Gallery</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Club Moments</h2>
            </div>
            <div ref={sliderBoxRef} className="rounded-3xl overflow-hidden"
              style={{ border: "1px solid rgba(34,197,94,0.14)", boxShadow: "0 0 60px rgba(34,197,94,0.07), 0 40px 80px rgba(0,0,0,0.4)" }}>
              <Swiper
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                effect="fade"
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation loop
                className="h-72 sm:h-[420px]"
              >
                {slider.map((s: any) => (
                  <SwiperSlide key={s.id}>
                    <div className="relative w-full h-full">
                      <img src={s.image} alt={s.caption} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-end p-8"
                        style={{ background: "linear-gradient(to top, rgba(5,15,7,0.95) 0%, rgba(5,15,7,0.2) 50%, transparent 100%)" }}>
                        <div>
                          <p className="text-white text-xl font-bold">{s.caption}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="w-8 h-px bg-green-400" />
                            <span className="text-green-400/60 text-xs tracking-widest uppercase">GUBCPC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      <section ref={statsSectionRef} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-500 text-xs tracking-[0.4em] uppercase font-bold mb-2">Impact</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Club by the Numbers</h2>
          </div>
          <div ref={statsGridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s: any, i: number) => (
              <div key={i}
                className="flex flex-col items-center p-8 rounded-2xl text-center group cursor-default relative overflow-hidden"
                style={{ background: "rgba(0,18,7,0.7)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.08), transparent 70%)" }} />
                <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(90deg, transparent, #22c55e, transparent)" }} />
                <span className="text-5xl font-black mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ color: "#4ade80", textShadow: "0 0 30px rgba(74,222,128,0.3)" }}>
                  {s.value}
                </span>
                <span className="text-green-200/50 text-sm font-medium tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div ref={ctaSectionRef} className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-14 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(16,78,36,0.45) 0%, rgba(5,15,7,0.95) 100%)",
            border: "1px solid rgba(34,197,94,0.18)",
            boxShadow: "0 0 80px rgba(34,197,94,0.06)",
          }}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.1), transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.06), transparent 70%)" }} />
          <div className="relative z-10 text-center">
            <h2 className="cta-item text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to <span style={{ color: "#4ade80" }}>Compete?</span>
            </h2>
            <p className="cta-item text-green-200/55 mb-10 max-w-md mx-auto text-base">
              Form a team of up to 3 members and register before the deadline.
            </p>
            <div className="cta-item flex flex-wrap gap-3 justify-center mb-10">
              {[
                { icon: "🏆", key: "Prize Pool", val: "BDT 50,000" },
                { icon: "👥", key: "Max Teams", val: "100+" },
                { icon: "⏱", key: "Duration", val: "5 Hours" },
                { icon: "💻", key: "Platform", val: "DOMjudge" },
              ].map(({ icon, key, val }) => (
                <div key={key}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <span>{icon}</span>
                  <span className="text-green-200/60">{key}:</span>
                  <span className="text-green-300 font-bold">{val}</span>
                </div>
              ))}
            </div>
            <a href="/contact" data-hover
              className="cta-item inline-block px-12 py-4 rounded-full font-black text-black text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(34,197,94,0.5)]"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 30px rgba(34,197,94,0.3)", letterSpacing: "0.08em" }}>
              REGISTER YOUR TEAM →
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-green-900/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo-dark.png" alt="GUBCPC" className="h-10 w-auto opacity-70" />
          <p className="text-green-700 text-xs text-center">© 2026 GUB Competitive Programming Community · Green University of Bangladesh</p>
          <p className="text-green-800 text-xs tracking-[0.2em] uppercase">Think · Code · Solve</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </main>
  );
}

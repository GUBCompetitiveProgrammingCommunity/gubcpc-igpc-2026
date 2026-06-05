import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Schedule({ data }: { data: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLDivElement>(null);
  const heroBannerRef = useRef<HTMLDivElement>(null);
  const day1Ref = useRef<HTMLDivElement>(null);
  const day2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl
        .fromTo(heroBadgeRef.current, { y: 25, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" })
        .fromTo(heroTitleRef.current, { y: 50, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: "power4.out" }, "-=0.25")
        .fromTo(heroDescRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .fromTo(heroBannerRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, "-=0.2");

      [day1Ref, day2Ref].forEach((ref) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current.querySelector(".day-header"), { x: -60, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%" }
        });
        gsap.fromTo(ref.current.querySelectorAll(".timeline-item"), { x: -50, opacity: 0, scale: 0.95 }, {
          x: 0, opacity: 1, scale: 1,
          stagger: 0.12, duration: 0.65, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 78%" }
        });
        gsap.fromTo(ref.current.querySelectorAll(".timeline-dot"), { scale: 0, opacity: 0 }, {
          scale: 1, opacity: 1,
          stagger: 0.12, duration: 0.4, ease: "back.out(2)",
          scrollTrigger: { trigger: ref.current, start: "top 78%" }
        });
      });

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current, { y: 50, opacity: 0, scale: 0.97 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 85%" }
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const schedule = data?.schedule || [];
  const dayAccents = ["#22c55e", "#4ade80"];
  const dayIcons = ["📋", "🏆"];

  return (
    <main className="pt-20">
      <section ref={heroRef} className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,78,36,0.4) 0%, transparent 70%)",
            backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Event Schedule
          </div>
          <h1 ref={heroTitleRef} className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
            Contest{" "}
            <span style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Timeline
            </span>
          </h1>
          <p ref={heroDescRef} className="text-green-200/55 text-lg max-w-xl mx-auto mb-8">
            Two days of programming excellence — from registration to the award ceremony.
          </p>
          <div ref={heroBannerRef} className="inline-flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: "📅", label: "Date", val: "Sep 19–20, 2026" },
              { icon: "📍", label: "Venue", val: "GUB Main Campus" },
              { icon: "🕙", label: "Start", val: "9:00 AM" },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <span>{icon}</span>
                <span className="text-green-600 text-xs">{label}:</span>
                <span className="text-green-300 font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-16">
          {schedule.map((day: any, di: number) => {
            const ref = di === 0 ? day1Ref : day2Ref;
            const accent = dayAccents[di];
            const icon = dayIcons[di];
            return (
              <div key={di} ref={ref}>
                <div className="day-header flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                    {icon}
                  </div>
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <span className="px-5 py-2.5 rounded-full font-black text-sm text-black"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${di === 0 ? "#16a34a" : "#22c55e"})`, boxShadow: `0 0 20px ${accent}40` }}>
                      {day.day}
                    </span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
                    <span className="text-green-600 text-xs font-medium">{day.date}</span>
                  </div>
                </div>

                <div className="relative pl-10 border-l-2" style={{ borderColor: `${accent}25` }}>
                  {day.events.map((ev: any, ei: number) => (
                    <div key={ei} className="timeline-item relative mb-7 last:mb-0">
                      <div
                        className="timeline-dot absolute -left-[42px] w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                        style={{ background: "#050f07", borderColor: accent, boxShadow: `0 0 12px ${accent}50` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                      </div>
                      <div
                        className="group p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                        style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.1)" }}>
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ background: `linear-gradient(to bottom, ${accent}, transparent)`, opacity: 0.5 }} />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: "radial-gradient(circle at 0% 50%, rgba(34,197,94,0.05), transparent 60%)" }} />
                        <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(90deg, ${accent}50, transparent)` }} />
                        <div className="relative z-10 flex items-start gap-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-black flex-shrink-0 mt-0.5"
                            style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                            {ev.time}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-white font-black text-base mb-1.5 group-hover:text-green-200 transition-colors">{ev.title}</h3>
                            <p className="text-green-200/50 text-sm leading-relaxed">{ev.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <div ref={ctaRef}
            className="p-10 rounded-3xl text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(16,78,36,0.4) 0%, rgba(5,15,7,0.95) 100%)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}>
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }} />
            <div className="text-3xl mb-4">💡</div>
            <h3 className="text-xl font-black text-white mb-2">Need more information?</h3>
            <p className="text-green-200/50 text-sm mb-6">Reach out to us for schedule questions, rule clarifications, or registration help.</p>
            <a href="/contact" data-hover
              className="inline-block px-8 py-3 rounded-full font-black text-black text-sm transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.25)" }}>
              Contact Us →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

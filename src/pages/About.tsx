import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About({ data }: { data: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsTitleRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const missionTitleRef = useRef<HTMLDivElement>(null);
  const missionCardsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const teamTitleRef = useRef<HTMLDivElement>(null);
  const teamGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl
        .fromTo(heroBadgeRef.current, { y: 30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" })
        .fromTo(heroTitleRef.current, { y: 50, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: "power4.out" }, "-=0.2")
        .fromTo(heroDescRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");

      gsap.fromTo(statsTitleRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 82%" }
      });
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.querySelectorAll(".stat-card"), { y: 50, opacity: 0, scale: 0.85, rotate: -4 }, {
          y: 0, opacity: 1, scale: 1, rotate: 0,
          stagger: 0.1, duration: 0.7, ease: "back.out(1.5)",
          scrollTrigger: { trigger: statsRef.current, start: "top 78%" }
        });
      }

      gsap.fromTo(missionTitleRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: missionRef.current, start: "top 82%" }
      });
      if (missionCardsRef.current) {
        gsap.fromTo(missionCardsRef.current.children, { y: 60, opacity: 0, x: (i) => (i === 0 ? -40 : 40) }, {
          y: 0, opacity: 1, x: 0,
          stagger: 0.15, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: missionCardsRef.current, start: "top 78%" }
        });
      }

      gsap.fromTo(teamTitleRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: teamRef.current, start: "top 82%" }
      });
      if (teamGridRef.current) {
        gsap.fromTo(teamGridRef.current.children, { y: 50, opacity: 0, scale: 0.9 }, {
          y: 0, opacity: 1, scale: 1,
          stagger: { amount: 0.6, from: "start" },
          duration: 0.6, ease: "back.out(1.4)",
          scrollTrigger: { trigger: teamGridRef.current, start: "top 80%" }
        });
      }

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          if (heroRef.current) {
            gsap.set(heroRef.current.querySelector(".hero-bg"), { yPercent: self.progress * 25 });
          }
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const about = data?.about;
  const stats = about?.stats || [];
  const problemSetters = about?.problemSetters || [];

  return (
    <main className="pt-20">
      <section ref={heroRef} className="py-28 px-6 text-center relative overflow-hidden">
        <div
          className="hero-bg absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,78,36,0.4) 0%, transparent 70%)",
            backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.04) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div ref={heroBadgeRef} className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
            About Us
          </div>
          <h1 ref={heroTitleRef} className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            GUB{" "}
            <span style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Competitive
            </span>
            <br />Programming Community
          </h1>
          <p ref={heroDescRef} className="text-green-200/55 text-lg leading-relaxed max-w-2xl mx-auto">
            {about?.description}
          </p>
        </div>
      </section>

      <section ref={missionRef} className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,78,36,0.1), transparent)" }} />
        <div className="max-w-5xl mx-auto">
          <div ref={missionTitleRef} className="text-center mb-12">
            <p className="text-green-500 text-xs tracking-[0.4em] uppercase font-bold mb-2">Purpose</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Mission & Vision</h2>
          </div>
          <div ref={missionCardsRef} className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Our Mission", icon: "🎯", accent: "#22c55e",
                text: about?.mission,
                points: ["Weekly practice contests", "Mentorship from seniors", "Resource library access"],
              },
              {
                title: "Our Vision", icon: "🔭", accent: "#4ade80",
                text: about?.vision,
                points: ["National-level recognition", "ICPC participation", "Top programmer community"],
              },
            ].map(({ title, icon, accent, text, points }) => (
              <div key={title} className="p-8 rounded-3xl group relative overflow-hidden"
                style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none opacity-5"
                  style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
                <div className="text-4xl mb-5">{icon}</div>
                <h3 className="text-xl font-black text-white mb-3">{title}</h3>
                <p className="text-green-200/55 leading-relaxed text-sm mb-5">{text}</p>
                <ul className="flex flex-col gap-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-green-300/60">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: accent }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={teamRef} className="py-20 px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <div ref={teamTitleRef} className="text-center mb-12">
            <p className="text-green-500 text-xs tracking-[0.4em] uppercase font-bold mb-2">The Team</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Problem Setters</h2>
          </div>
          <div ref={teamGridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {problemSetters.map((member: any, i: number) => (
              <div key={i}
                className="p-5 rounded-2xl group relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 flex items-center gap-4"
                style={{ background: "rgba(0,18,7,0.85)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <div className="absolute inset-x-0 top-0 h-px transition-opacity duration-500 opacity-30 group-hover:opacity-100"
                  style={{ background: "linear-gradient(90deg, transparent, #22c55e, transparent)", boxShadow: "0 0 8px #22c55e" }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.06), transparent 70%)" }} />
                {/* Avatar: photo if exists, else initial */}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-green-500/20 group-hover:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-all duration-300">
                  <img
                    src={`/${member.name}.png`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-full items-center justify-center text-lg font-black text-white"
                    style={{ background: "linear-gradient(135deg, #16a34a, #0f5c2e)", display: "none" }}
                  >
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="font-bold text-white text-sm leading-snug group-hover:text-green-200 transition-colors">{member.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

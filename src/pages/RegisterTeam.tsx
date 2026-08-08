import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RegisterTeam({ data }: { data: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoCardsRef = useRef<HTMLDivElement>(null);

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    teamName: "",
    p1Name: "",
    p1Id: "",
    p1Phone: "",
    p2Name: "",
    p2Id: "",
    p2Phone: "",
    trxId: ""
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl
        .fromTo(heroBadgeRef.current, { y: 25, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" })
        .fromTo(heroTitleRef.current, { y: 50, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: "power4.out" }, "-=0.2")
        .fromTo(heroDescRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");

      gsap.fromTo(formRef.current, { x: -70, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: formSectionRef.current, start: "top 80%" },
      });

      if (infoCardsRef.current) {
        gsap.fromTo(infoCardsRef.current.children, { x: 70, opacity: 0, scale: 0.92 }, {
          x: 0, opacity: 1, scale: 1,
          stagger: 0.1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: formSectionRef.current, start: "top 78%" },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const contact = data?.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gsap.to(formRef.current, {
      scale: 0.95, opacity: 0, duration: 0.3, ease: "power2.in",
      onComplete: () => setSent(true),
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(0,25,10,0.8)",
    border: "1px solid rgba(34,197,94,0.15)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(34,197,94,0.45)";
    e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.08)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(34,197,94,0.15)";
    e.target.style.boxShadow = "none";
  };

  return (
    <main className="pt-20">
      <section ref={heroRef} className="pt-28 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,78,36,0.4) 0%, transparent 70%)",
            backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.04) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Register Your Team
          </div>
          <h1 ref={heroTitleRef} className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
            Register Your Team{" "}
            <span style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GUBCPC
            </span>
          </h1>
          <p ref={heroDescRef} className="text-green-200/55 text-lg max-w-xl mx-auto">
            Register your team of 2 participants for the Intra Green Programming Contest 2026.
          </p>
        </div>
      </section>

      <section ref={formSectionRef} className="py-8 px-6 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr,380px] gap-10 items-start">

          {!sent ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }} />
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none opacity-[0.04]"
                style={{ background: "radial-gradient(circle, #22c55e, transparent)" }} />
              
              <h2 className="text-2xl font-black text-white mb-2">Team Details</h2>
              
              <div>
                <label className="block text-green-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Team Name</label>
                <input
                  type="text"
                  placeholder="Enter your team name"
                  style={{ ...inputStyle }}
                  value={form.teamName}
                  onChange={e => setForm({ ...form, teamName: e.target.value })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  required
                />
              </div>

              {/* Participant 1 */}
              <div className="p-5 rounded-2xl border border-green-500/10" style={{ background: "rgba(0,12,3,0.4)" }}>
                <h3 className="text-sm font-black text-green-400 uppercase tracking-wider mb-4">Participant 1 (Team Leader)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Name of Participant 1"
                      style={{ ...inputStyle }}
                      value={form.p1Name}
                      onChange={e => setForm({ ...form, p1Name: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Student ID</label>
                    <input
                      type="text"
                      placeholder="Student ID"
                      style={{ ...inputStyle }}
                      value={form.p1Id}
                      onChange={e => setForm({ ...form, p1Id: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      style={{ ...inputStyle }}
                      value={form.p1Phone}
                      onChange={e => setForm({ ...form, p1Phone: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Participant 2 */}
              <div className="p-5 rounded-2xl border border-green-500/10" style={{ background: "rgba(0,12,3,0.4)" }}>
                <h3 className="text-sm font-black text-green-400 uppercase tracking-wider mb-4">Participant 2</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Name of Participant 2"
                      style={{ ...inputStyle }}
                      value={form.p2Name}
                      onChange={e => setForm({ ...form, p2Name: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Student ID</label>
                    <input
                      type="text"
                      placeholder="Student ID"
                      style={{ ...inputStyle }}
                      value={form.p2Id}
                      onChange={e => setForm({ ...form, p2Id: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      style={{ ...inputStyle }}
                      value={form.p2Phone}
                      onChange={e => setForm({ ...form, p2Phone: e.target.value })}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-5 rounded-2xl border border-green-500/20" style={{ background: "rgba(34,197,94,0.03)" }}>
                <h3 className="text-sm font-black text-green-400 uppercase tracking-wider mb-2">Registration Fee Payment</h3>
                <p className="text-xs text-green-200/60 mb-4 leading-relaxed font-sans">
                  Send registration fee of <b className="text-white">BDT 350</b> to any of the following accounts:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl border border-green-500/10 text-xs" style={{ background: "rgba(0,18,7,0.4)" }}>
                    <span className="block font-black text-[#e2125f] mb-1 font-sans">bKash (Personal)</span>
                    <span className="font-bold text-white tracking-wider font-sans">01700-000000</span>
                  </div>
                  <div className="p-3 rounded-xl border border-green-500/10 text-xs" style={{ background: "rgba(0,18,7,0.4)" }}>
                    <span className="block font-black text-[#f57c00] mb-1 font-sans">Nagad (Personal)</span>
                    <span className="font-bold text-white tracking-wider font-sans">01800-000000</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-green-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    placeholder="Enter the bKash or Nagad Transaction ID"
                    style={{ ...inputStyle }}
                    value={form.trxId}
                    onChange={e => setForm({ ...form, trxId: e.target.value })}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                data-hover
                className="w-full py-4 rounded-xl font-black text-black text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.2)", letterSpacing: "0.08em" }}
              >
                SUBMIT REGISTRATION →
              </button>
            </form>
          ) : (
            <div
              className="p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.2)", minHeight: "420px" }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.06), transparent 70%)" }} />
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", boxShadow: "0 0 40px rgba(34,197,94,0.15)" }}>
                ✅
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Registration Submitted!</h3>
                <p className="text-green-200/50 text-sm max-w-xs font-sans">Thank you for registering. We will verify your payment and contact you shortly!</p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="px-7 py-2.5 rounded-full text-sm border border-green-500/25 text-green-400 transition-all hover:bg-green-500/10"
              >
                Submit Another →
              </button>
            </div>
          )}

          <div ref={infoCardsRef} className="flex flex-col gap-4">
            {[
              { icon: "📧", title: "Email", value: contact?.email, sub: "We respond within 24 hours" },
              { icon: "📞", title: "Phone", value: contact?.phone, sub: "Mon–Fri, 9 AM – 6 PM" },
              { icon: "📍", title: "Address", value: contact?.address, sub: "Green University of Bangladesh" },
            ].map(({ icon, title, value, sub }) => (
              <div key={title}
                className="flex gap-4 p-5 rounded-2xl group transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.35), transparent)" }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  {icon}
                </div>
                <div>
                  <div className="text-green-500 text-[10px] font-black tracking-[0.2em] uppercase mb-0.5">{title}</div>
                  <div className="text-white text-sm font-medium leading-snug mb-0.5">{value}</div>
                  <div className="text-green-700 text-xs">{sub}</div>
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.1)" }}>
              <div className="text-green-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">Follow Us</div>
              <div className="flex gap-3">
                {[
                  { label: "Facebook", url: contact?.social?.facebook, letter: "f" },
                  { label: "GitHub", url: contact?.social?.github, letter: "G" },
                  { label: "LinkedIn", url: contact?.social?.linkedin, letter: "in" },
                ].map(({ label, url, letter }) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" data-hover
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                    style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", color: "#4ade80" }}>
                    {letter}
                  </a>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(16,78,36,0.4) 0%, rgba(5,15,7,0.95) 100%)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}>
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }} />
              <p className="text-xs text-green-600 tracking-widest uppercase mb-1 font-bold">Registration Deadline</p>
              <p className="text-2xl font-black text-green-300 mb-1 font-sans">Aug 16, 2026</p>
              <div className="h-px mb-4" style={{ background: "rgba(34,197,94,0.1)" }} />
              <p className="text-green-200/50 text-xs font-sans">Prize Pool: <span className="text-green-300 font-bold">BDT 12,000</span></p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { getContest, registerForContest, CONTEST_SLUG, CONTEST_API_KEY, ContestConfig } from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

const errorToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const showErrorToast = (message: string) => errorToast.fire({ icon: "error", title: message });

const depts = [
  "CSE",
  "SWE",
  "ADS",
  "EEE",
  "TEX",
  "JMC",
  "BBA",
  "LAW",
  "ENG",
  "SOC",
  "Other",  
];

const paymentMethods = ["bKash", "Nagad", "Rocket"];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  teamName: string;
  p1Name: string; p1Id: string; p1Phone: string; p1Email: string; p1Dept: string;
  p2Name: string; p2Id: string; p2Phone: string; p2Email: string; p2Dept: string;
  paymentMethod: string; paymentPhone: string; trxId: string;
};

const validateForm = (form: FormState) => {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.teamName.trim()) errors.teamName = "Team name is required.";

  if (!form.p1Name.trim()) errors.p1Name = "Name is required.";
  if (!form.p1Id.trim()) errors.p1Id = "Student ID is required.";
  if (!form.p1Dept) errors.p1Dept = "Please select a department.";
  if (!form.p1Phone.trim()) errors.p1Phone = "Phone number is required.";
  else if (form.p1Phone.replace(/\D/g, "").length < 10) errors.p1Phone = "Enter a valid phone number (at least 10 digits).";
  if (!form.p1Email.trim()) errors.p1Email = "Email is required.";
  else if (!emailRe.test(form.p1Email.trim())) errors.p1Email = "Enter a valid email address.";

  if (!form.p2Name.trim()) errors.p2Name = "Name is required.";
  if (!form.p2Id.trim()) errors.p2Id = "Student ID is required.";
  if (!form.p2Dept) errors.p2Dept = "Please select a department.";
  if (!form.p2Phone.trim()) errors.p2Phone = "Phone number is required.";
  else if (form.p2Phone.replace(/\D/g, "").length < 10) errors.p2Phone = "Enter a valid phone number (at least 10 digits).";
  if (!form.p2Email.trim()) errors.p2Email = "Email is required.";
  else if (!emailRe.test(form.p2Email.trim())) errors.p2Email = "Enter a valid email address.";

  const p1Email = form.p1Email.trim().toLowerCase();
  const p2Email = form.p2Email.trim().toLowerCase();
  const p1Id = form.p1Id.trim().toLowerCase();
  const p2Id = form.p2Id.trim().toLowerCase();
  const p1Phone = form.p1Phone.trim();
  const p2Phone = form.p2Phone.trim();
  if (!errors.p2Email && p1Email && p2Email && p1Email === p2Email) {
    errors.p2Email = "This email is already used by Participant 1.";
  }
  if (!errors.p2Id && p1Id && p2Id && p1Id === p2Id) {
    errors.p2Id = "This student ID is already used by Participant 1.";
  }
  if (!errors.p2Phone && p1Phone && p2Phone && p1Phone === p2Phone) {
    errors.p2Phone = "This phone number is already used by Participant 1.";
  }

  if (!form.paymentMethod) errors.paymentMethod = "Please select a payment method.";
  if (!form.paymentPhone.trim()) errors.paymentPhone = "Payment phone number is required.";
  if (!form.trxId.trim()) errors.trxId = "Transaction ID is required.";

  return errors;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "#fca5a5" }} className="font-sans">
      {message}
    </p>
  );
}

export default function RegisterTeam({ data }: { data: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoCardsRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<ContestConfig | null>(null);
  const [contestError, setContestError] = useState<string | null>(null);

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    teamName: "",
    p1Name: "",
    p1Id: "",
    p1Phone: "",
    p1Email: "",
    p1Dept: "",
    p2Name: "",
    p2Id: "",
    p2Phone: "",
    p2Email: "",
    p2Dept: "",
    paymentMethod: "",
    paymentPhone: "",
    trxId: ""
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  useEffect(() => {
    getContest(CONTEST_SLUG)
      .then((c) => setContest(c))
      .catch((err) => setContestError(err.message || "Unable to load contest details."))
      .finally(() => setLoading(false));
  }, []);

  const showForm = !loading && !contestError && !!contest && contest.isRegistrationOpen;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl
        .fromTo(heroBadgeRef.current, { y: 25, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" })
        .fromTo(heroTitleRef.current, { y: 50, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: "power4.out" }, "-=0.2")
        .fromTo(heroDescRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");

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

  useEffect(() => {
    if (!showForm) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current, { x: -70, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: formSectionRef.current, start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, [showForm]);

  const contact = data?.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showErrorToast("Please fix the errors below before submitting.");
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const result = await registerForContest(CONTEST_SLUG, CONTEST_API_KEY, {
        teamName: form.teamName,
        participants: [
          { name: form.p1Name, studentId: form.p1Id, email: form.p1Email, phone: form.p1Phone, department: form.p1Dept },
          { name: form.p2Name, studentId: form.p2Id, email: form.p2Email, phone: form.p2Phone, department: form.p2Dept },
        ],
        paymentMethod: form.paymentMethod,
        paymentNumber: form.paymentPhone,
        paymentTransactionId: form.trxId,
      });
      setRegistrationCode(result.registration?.registrationCode ?? null);
      gsap.to(formRef.current, {
        scale: 0.95, opacity: 0, duration: 0.3, ease: "power2.in",
        onComplete: () => setSent(true),
      });
    } catch (err: any) {
      const message = err.message || "Registration failed. Please try again.";
      setSubmitError(message);
      showErrorToast(message);
    } finally {
      setSubmitting(false);
    }
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

  const fieldStyle = (hasError?: string): React.CSSProperties => ({
    ...inputStyle,
    border: hasError ? "1px solid rgba(239,68,68,0.55)" : inputStyle.border,
  });

  const chevronIcon =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234ade80' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")";

  const selectStyle = (hasError?: string): React.CSSProperties => ({
    ...fieldStyle(hasError),
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
    paddingRight: "42px",
    backgroundImage: chevronIcon,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    backgroundSize: "14px",
  });

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(34,197,94,0.45)";
    e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.08)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(34,197,94,0.15)";
    e.target.style.boxShadow = "none";
  };

  const deadlineSource = contest?.registrationDeadlineAt || data?.event?.registrationDeadline;
  const deadlineDisplay = deadlineSource
    ? new Date(deadlineSource).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "TBA";
  const prizePool = data?.event?.prizePool || "BDT 12,000";

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

          {loading ? (
            <div
              className="p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.12)", minHeight: "420px" }}
            >
              <div className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(34,197,94,0.2)", borderTopColor: "#4ade80" }} />
              <p className="text-green-200/60 text-sm font-sans">Loading contest details...</p>
            </div>
          ) : contestError || !contest ? (
            <div
              className="p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(239,68,68,0.25)", minHeight: "420px" }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                ⚠️
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Unable to Load Registration</h3>
                <p className="text-green-200/50 text-sm max-w-xs font-sans">{contestError}</p>
              </div>
            </div>
          ) : !contest.isRegistrationOpen ? (
            <div
              className="p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.2)", minHeight: "420px" }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.06), transparent 70%)" }} />
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", boxShadow: "0 0 40px rgba(34,197,94,0.15)" }}>
                🔒
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Registration Closed</h3>
                <p className="text-green-200/50 text-sm max-w-xs font-sans">{contest.registrationClosedReason}</p>
              </div>
            </div>
          ) : !sent ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden"
              style={{ background: "rgba(0,18,7,0.8)", border: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }} />
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none opacity-[0.04]"
                style={{ background: "radial-gradient(circle, #22c55e, transparent)" }} />

              <h2 className="text-2xl font-black text-white mb-2">Team Details</h2>

              {submitError && (
                <div className="p-4 rounded-xl text-sm font-sans"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-green-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Team Name</label>
                <input
                  type="text"
                  placeholder="Enter your team name"
                  style={fieldStyle(fieldErrors.teamName)}
                  value={form.teamName}
                  onChange={e => setField("teamName", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <FieldError message={fieldErrors.teamName} />
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
                      style={fieldStyle(fieldErrors.p1Name)}
                      value={form.p1Name}
                      onChange={e => setField("p1Name", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p1Name} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Student ID</label>
                    <input
                      type="text"
                      placeholder="Student ID"
                      style={fieldStyle(fieldErrors.p1Id)}
                      value={form.p1Id}
                      onChange={e => setField("p1Id", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p1Id} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Department</label>
                    <select
                      style={selectStyle(fieldErrors.p1Dept)}
                      value={form.p1Dept}
                      onChange={e => setField("p1Dept", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled style={{ background: "#050f07", color: "#e5f9ee" }}>Select Department</option>
                      {depts.map(d => (
                        <option key={d} value={d} style={{ background: "#050f07", color: "#e5f9ee" }}>{d}</option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.p1Dept} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      style={fieldStyle(fieldErrors.p1Phone)}
                      value={form.p1Phone}
                      onChange={e => setField("p1Phone", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p1Phone} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      style={fieldStyle(fieldErrors.p1Email)}
                      value={form.p1Email}
                      onChange={e => setField("p1Email", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p1Email} />
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
                      style={fieldStyle(fieldErrors.p2Name)}
                      value={form.p2Name}
                      onChange={e => setField("p2Name", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p2Name} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Student ID</label>
                    <input
                      type="text"
                      placeholder="Student ID"
                      style={fieldStyle(fieldErrors.p2Id)}
                      value={form.p2Id}
                      onChange={e => setField("p2Id", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p2Id} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Department</label>
                    <select
                      style={selectStyle(fieldErrors.p2Dept)}
                      value={form.p2Dept}
                      onChange={e => setField("p2Dept", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled style={{ background: "#050f07", color: "#e5f9ee" }}>Select Department</option>
                      {depts.map(d => (
                        <option key={d} value={d} style={{ background: "#050f07", color: "#e5f9ee" }}>{d}</option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.p2Dept} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      style={fieldStyle(fieldErrors.p2Phone)}
                      value={form.p2Phone}
                      onChange={e => setField("p2Phone", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p2Phone} />
                  </div>
                  <div>
                    <label className="block text-green-500/80 text-[9px] font-bold tracking-[0.15em] uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      style={fieldStyle(fieldErrors.p2Email)}
                      value={form.p2Email}
                      onChange={e => setField("p2Email", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.p2Email} />
                  </div>
                </div>
              </div>

              {/* Payment Details - visually highlighted since this step is required before submitting */}
              <div className="p-5 sm:p-6 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, rgba(34,197,94,0.16), rgba(22,101,52,0.07))",
                  border: "1.5px solid rgba(74,222,128,0.45)",
                  boxShadow: "0 0 36px rgba(34,197,94,0.1)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1"
                  style={{ background: "linear-gradient(90deg, transparent, #4ade80, transparent)" }} />

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: "rgba(34,197,94,0.18)", border: "1px solid rgba(74,222,128,0.4)" }}>
                    💳
                  </span>
                  <h3 className="text-base font-black text-green-300 uppercase tracking-wider">Registration Fee Payment</h3>
                </div>

                <div
                  className="text-xs sm:text-sm text-green-100/85 mb-5 leading-relaxed font-sans p-3 rounded-xl [&_b]:text-green-200 [&_strong]:text-green-200 [&_a]:text-green-300 [&_a]:underline"
                  style={{ background: "rgba(0,12,3,0.35)", border: "1px solid rgba(74,222,128,0.15)" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      contest.paymentInstructions ||
                        "Please complete the registration fee payment via your preferred method (e.g. bKash, Nagad, Rocket, bank transfer), then fill in the details below exactly as used in the transaction."
                    ),
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Payment Method</label>
                    <select
                      style={selectStyle(fieldErrors.paymentMethod)}
                      value={form.paymentMethod}
                      onChange={e => setField("paymentMethod", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled style={{ background: "#050f07", color: "#e5f9ee" }}>Select Payment Method</option>
                      {paymentMethods.map(m => (
                        <option key={m} value={m} style={{ background: "#050f07", color: "#e5f9ee" }}>{m}</option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.paymentMethod} />
                  </div>
                  <div>
                    <label className="block text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Payment Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 017XXXXXXXX"
                      style={fieldStyle(fieldErrors.paymentPhone)}
                      value={form.paymentPhone}
                      onChange={e => setField("paymentPhone", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.paymentPhone} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      placeholder="Enter the Transaction ID"
                      style={fieldStyle(fieldErrors.trxId)}
                      value={form.trxId}
                      onChange={e => setField("trxId", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <FieldError message={fieldErrors.trxId} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                data-hover
                disabled={submitting}
                className="w-full py-4 rounded-xl font-black text-black text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 20px rgba(34,197,94,0.2)", letterSpacing: "0.08em" }}
              >
                {submitting ? "SUBMITTING..." : "SUBMIT REGISTRATION →"}
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
                <p className="text-green-200/50 text-sm max-w-xs mx-auto font-sans">Thank you for registering. We will verify your payment and contact you shortly!</p>
                {registrationCode && (
                  <p className="text-green-300 text-sm font-bold mt-3 font-sans">
                    Your registration code: <span className="text-white">{registrationCode}</span> — keep this for your records.
                  </p>
                )}
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
              { icon: "📞", title: "Phone", value: contact?.phone, sub: "" },
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
              <p className="text-2xl font-black text-green-300 mb-1 font-sans">{deadlineDisplay}</p>
              <div className="h-px mb-4" style={{ background: "rgba(34,197,94,0.1)" }} />
              <p className="text-green-200/50 text-xs font-sans">Prize Pool: <span className="text-green-300 font-bold">{prizePool}</span></p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

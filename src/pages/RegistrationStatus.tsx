import { FormEvent, useState } from "react";
import { CONTEST_SLUG, getRegistrationStatus, RegistrationStatusEntry } from "../lib/api";

type SearchMode = "email" | "registrationId";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const modeCopy: Record<SearchMode, { label: string; placeholder: string; helper: string }> = {
  email: {
    label: "Team Leader Email",
    placeholder: "teamleader@example.com",
    helper: "Use the team leader email address submitted during registration.",
  },
  registrationId: {
    label: "Registration Code / ID",
    placeholder: "REG-XXXXXX-XXXXXX or numeric ID",
    helper: "Use the registration code you received after submitting the form, or the numeric ID if you have it.",
  },
};

const statusTone: Record<string, string> = {
  Verified: "rgba(34,197,94,0.18)",
  "Pending verification": "rgba(250,204,21,0.16)",
  Rejected: "rgba(248,113,113,0.18)",
};

export default function RegistrationStatus() {
  const [mode, setMode] = useState<SearchMode>("email");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegistrationStatusEntry | null>(null);

  const activeMode = modeCopy[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanQuery = query.trim();
    setError("");
    setResult(null);

    if (!cleanQuery) {
      setError(`Please enter a ${mode === "email" ? "team leader email" : "registration code or ID"}.`);
      return;
    }
    if (mode === "email" && !emailRe.test(cleanQuery)) {
      setError("Please enter a valid team leader email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await getRegistrationStatus(CONTEST_SLUG, {
        email: mode === "email" ? cleanQuery : undefined,
        registrationId: mode === "registrationId" ? cleanQuery : undefined,
      });

      if (!data) {
        setError("No registration status was found with the information you entered.");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unable to load registration status right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-24 px-6">
      <section className="mx-auto max-w-3xl">
        <div
          className="rounded-[32px] border border-green-500/15 p-8 sm:p-10"
          style={{ background: "linear-gradient(180deg, rgba(0,18,7,0.88), rgba(1,10,4,0.96))" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">Registration Status</p>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Check Your Payment Status</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-green-100/65 sm:text-base">
            Search with your team leader email or registration code/ID. Only the payment status will be shown.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {(["email", "registrationId"] as SearchMode[]).map((item) => {
              const active = item === mode;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setQuery("");
                    setError("");
                    setResult(null);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all"
                  style={{
                    background: active ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(34,197,94,0.08)",
                    color: active ? "#021b08" : "#bbf7d0",
                    border: active ? "1px solid transparent" : "1px solid rgba(34,197,94,0.18)",
                  }}
                >
                  {item === "email" ? "Leader Email" : "Registration Code / ID"}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-green-300">
              {activeMode.label}
            </label>
            <input
              type={mode === "email" ? "email" : "text"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeMode.placeholder}
              className="mt-3 w-full rounded-2xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-4 py-4 text-sm text-white outline-none transition-all placeholder:text-green-100/30 focus:border-green-400/40 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.08)]"
            />
            <p className="mt-2 text-xs text-green-100/45">{activeMode.helper}</p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>
        </div>

        {result ? (
          <div
            className="mt-6 rounded-[28px] border border-green-500/12 p-8 text-center"
            style={{ background: "linear-gradient(180deg, rgba(0,16,6,0.9), rgba(0,8,3,0.96))" }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">Payment Status</p>
            <div className="mt-5 flex items-center justify-center">
              <span
                className="rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.18em]"
                style={{
                  background: statusTone[result.paymentStatus] || "rgba(148,163,184,0.16)",
                  color: "#f8fafc",
                }}
              >
                {result.paymentStatus}
              </span>
            </div>
            <p className="mt-4 text-xs text-green-100/45">Registration ID: {result.registrationCode}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

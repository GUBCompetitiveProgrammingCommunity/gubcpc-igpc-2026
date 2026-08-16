import { FormEvent, useEffect, useState } from "react";
import {
  CONTEST_SLUG,
  getRegistrationStatus,
  requestEditOtp,
  updateOwnRegistration,
  RegistrationStatusEntry,
  RegistrationStatusParticipant,
} from "../lib/api";

type SearchMode = "email" | "registrationId";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tshirtSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

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

const roleLabel = (role: RegistrationStatusParticipant["role"]) =>
  role === "leader" ? "Team Leader" : role === "member" ? "Member" : "Entrant";

type EditableParticipant = { id: number; name: string; tshirtSize: string };

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">{label}</p>
      <p className="mt-1 text-sm text-white/90">{value?.trim() ? value : <span className="text-green-100/30">—</span>}</p>
    </div>
  );
}

export default function RegistrationStatus() {
  const [mode, setMode] = useState<SearchMode>("email");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegistrationStatusEntry | null>(null);

  const [teamName, setTeamName] = useState("");
  const [participants, setParticipants] = useState<EditableParticipant[]>([]);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [otpStage, setOtpStage] = useState<"idle" | "awaiting">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpError, setOtpError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const activeMode = modeCopy[mode];

  useEffect(() => {
    if (!result) return;
    setTeamName(result.teamName || "");
    setParticipants(
      result.participants.map((p) => ({ id: p.id, name: p.name, tshirtSize: p.tshirtSize || "" }))
    );
    setSaveError("");
    setSaveSuccess("");
    setOtpStage("idle");
    setOtpCode("");
    setOtpSentTo("");
    setOtpError("");
    setResendCooldown(0);
  }, [result]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const isDirty =
    !!result &&
    (teamName !== (result.teamName || "") ||
      participants.some((p, idx) => {
        const orig = result.participants[idx];
        return !orig || p.name !== orig.name || p.tshirtSize !== (orig.tshirtSize || "");
      }));

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
        setError("No registration was found with the information you entered.");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unable to load registration status right now.");
    } finally {
      setLoading(false);
    }
  };

  const getOwnerEmail = () =>
    (mode === "email" ? query.trim() : "") ||
    result?.participants.find((p) => p.role === "leader" || p.role === "individual")?.email ||
    result?.participants[0]?.email ||
    "";

  const validateEdits = () => {
    const cleanTeamName = teamName.trim();
    if (result && result.teamName !== null && !cleanTeamName) {
      return "Team name cannot be empty.";
    }
    for (const p of participants) {
      if (!p.name.trim()) return "Every participant's name is required.";
    }
    return "";
  };

  const handleRequestOtp = async () => {
    if (!result) return;
    setSaveError("");
    setSaveSuccess("");
    setOtpError("");

    const validationError = validateEdits();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setRequestingOtp(true);
    try {
      const res = await requestEditOtp(CONTEST_SLUG, result.registrationCode, getOwnerEmail());
      setOtpSentTo(res.sentTo);
      setOtpStage("awaiting");
      setOtpCode("");
      setResendCooldown(60);
    } catch (err: any) {
      setSaveError(err.message || "Unable to send a verification code right now.");
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!result) return;
    setOtpError("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setOtpError("Please enter the verification code.");
      return;
    }

    const validationError = validateEdits();
    if (validationError) {
      setOtpError(validationError);
      return;
    }

    const cleanTeamName = teamName.trim();
    setConfirming(true);
    try {
      const updated = await updateOwnRegistration(CONTEST_SLUG, result.registrationCode, {
        email: getOwnerEmail(),
        otp: cleanOtp,
        ...(result.teamName !== null ? { teamName: cleanTeamName } : {}),
        participants: participants.map((p) => ({ id: p.id, name: p.name.trim(), tshirtSize: p.tshirtSize })),
      });
      setResult(updated);
      setSaveSuccess("Your details have been updated successfully.");
    } catch (err: any) {
      setOtpError(err.message || "Unable to verify that code. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const hasPaymentInfo =
    !!result && (result.paymentMethod || result.paymentNumber || result.paymentTransactionId);

  return (
    <main className="pt-24 pb-24 px-6">
      <section className="mx-auto max-w-3xl">
        <div
          className="rounded-[32px] border border-green-500/15 p-8 sm:p-10"
          style={{ background: "linear-gradient(180deg, rgba(0,18,7,0.88), rgba(1,10,4,0.96))" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">Registration Status</p>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Check Your Registration</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-green-100/65 sm:text-base">
            Search with your team leader email or registration code/ID to view your payment status, team, and
            participant details.
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
            className="mt-6 space-y-6 rounded-[28px] border border-green-500/12 p-6 sm:p-8"
            style={{ background: "linear-gradient(180deg, rgba(0,16,6,0.9), rgba(0,8,3,0.96))" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">Payment Status</p>
                <span
                  className="mt-2 inline-block rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.18em]"
                  style={{
                    background: statusTone[result.paymentStatus] || "rgba(148,163,184,0.16)",
                    color: "#f8fafc",
                  }}
                >
                  {result.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-green-100/45">
                Registration ID: <span className="font-mono text-green-200">{result.registrationCode}</span>
              </p>
            </div>

            {hasPaymentInfo ? (
              <div className="rounded-2xl border border-green-500/10 bg-black/20 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                  Payment Details <span className="text-green-100/40 normal-case tracking-normal">(cannot be changed)</span>
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <ReadOnlyField label="Method" value={result.paymentMethod} />
                  <ReadOnlyField label="Sender Number" value={result.paymentNumber} />
                  <ReadOnlyField label="Transaction ID" value={result.paymentTransactionId} />
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-green-500/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">Team &amp; Participant Details</p>
                {result.editingEnabled ? (
                  <span className="rounded-full border border-green-400/25 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-300">
                    Editing Unlocked
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-100/50">
                    Locked
                  </span>
                )}
              </div>

              {!result.editingEnabled ? (
                <p className="mt-3 text-xs text-green-100/45">
                  Editing is currently locked by the organizers. Contact them if you need to change any details.
                </p>
              ) : null}

              {result.teamName !== null ? (
                <div className="mt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">Team Name</p>
                  {result.editingEnabled ? (
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-white/90">{result.teamName || "—"}</p>
                  )}
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {participants.map((editable, idx) => {
                  const original = result.participants[idx];
                  if (!original) return null;
                  return (
                    <div key={original.id} className="rounded-xl border border-green-500/10 bg-black/25 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-wide text-green-300/80">
                        {roleLabel(original.role)}
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">Name</p>
                          {result.editingEnabled ? (
                            <input
                              type="text"
                              value={editable.name}
                              onChange={(e) =>
                                setParticipants((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-white/90">{original.name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">T-shirt Size</p>
                          {result.editingEnabled ? (
                            <select
                              value={editable.tshirtSize}
                              onChange={(e) =>
                                setParticipants((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, tshirtSize: e.target.value } : p))
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                            >
                              <option value="">Select size</option>
                              {tshirtSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="mt-1 text-sm text-white/90">{original.tshirtSize || "—"}</p>
                          )}
                        </div>
                        <ReadOnlyField label="Student ID" value={original.studentId} />
                        <ReadOnlyField label="Email" value={original.email} />
                        <ReadOnlyField label="Phone" value={original.phone} />
                        <ReadOnlyField label="Department" value={original.department} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.editingEnabled ? (
                <div className="mt-5">
                  {saveError ? (
                    <div className="mb-3 rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-200">
                      {saveError}
                    </div>
                  ) : null}
                  {saveSuccess ? (
                    <div className="mb-3 rounded-xl border border-green-400/25 bg-green-500/8 px-4 py-3 text-sm font-semibold text-green-200">
                      {saveSuccess}
                    </div>
                  ) : null}

                  {otpStage === "idle" ? (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={!isDirty || requestingOtp}
                      className="rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                    >
                      {requestingOtp ? "Sending code..." : "Save Changes"}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-green-500/15 bg-black/25 p-4">
                      <p className="text-sm text-white/85">
                        A 6-digit verification code was sent to{" "}
                        <span className="font-semibold text-green-300">{otpSentTo}</span>. Enter it below to
                        confirm and save your changes.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="123456"
                          className="w-36 rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-4 py-2.5 text-center text-lg font-black tracking-[0.3em] text-white outline-none focus:border-green-400/40"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmSave}
                          disabled={confirming || !otpCode.trim()}
                          className="rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-black transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                        >
                          {confirming ? "Confirming..." : "Confirm & Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={resendCooldown > 0 || requestingOtp}
                          className="rounded-full border border-green-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-green-200 transition-all hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpStage("idle");
                            setOtpCode("");
                            setOtpError("");
                          }}
                          className="text-xs font-bold uppercase tracking-[0.14em] text-green-100/50 hover:text-green-100/80"
                        >
                          Cancel
                        </button>
                      </div>
                      {otpError ? (
                        <div className="mt-3 rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-200">
                          {otpError}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {result.remarks ? (
              <div className="rounded-2xl border border-green-500/10 bg-black/20 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">Remarks from Organizers</p>
                <p className="mt-2 text-sm text-white/80">{result.remarks}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

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

type EditFormState = {
  teamName: string;
  leaderTshirtSize: string;
  secondMemberEmail: string;
  secondMemberTshirtSize: string;
};

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">{label}</p>
      <p className="mt-1 text-sm text-white/90">{value?.trim() ? value : <span className="text-green-100/30">—</span>}</p>
    </div>
  );
}

function getLeader(participants: RegistrationStatusParticipant[] = []) {
  return participants.find((p) => p.role === "leader") || participants[0] || null;
}

function getSecondMember(participants: RegistrationStatusParticipant[] = []) {
  return participants.find((p) => p.role === "member") || participants[1] || null;
}

function makeEditForm(result: RegistrationStatusEntry): EditFormState {
  const leader = getLeader(result.participants);
  const secondMember = getSecondMember(result.participants);
  return {
    teamName: result.teamName || "",
    leaderTshirtSize: leader?.tshirtSize || "",
    secondMemberEmail: secondMember?.email || "",
    secondMemberTshirtSize: secondMember?.tshirtSize || "",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function RegistrationStatus() {
  const [mode, setMode] = useState<SearchMode>("email");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegistrationStatusEntry | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [otpStage, setOtpStage] = useState<"idle" | "awaiting">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const activeMode = modeCopy[mode];
  const leader = result ? getLeader(result.participants) : null;
  const secondMember = result ? getSecondMember(result.participants) : null;
  const canEdit = !!result?.editingEnabled;
  const hasPaymentInfo =
    !!result && (result.paymentMethod || result.paymentNumber || result.paymentTransactionId);

  useEffect(() => {
    if (!result) {
      setEditOpen(false);
      setEditForm(null);
      setEditError("");
      setEditSuccess("");
      setOtpStage("idle");
      setOtpCode("");
      setOtpSentTo("");
      setResendCooldown(0);
      return;
    }

    setEditOpen(false);
    setEditForm(makeEditForm(result));
    setEditError("");
    setOtpStage("idle");
    setOtpCode("");
    setOtpSentTo("");
    setResendCooldown(0);
  }, [result]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanQuery = query.trim();
    setError("");
    setEditOpen(false);
    setEditForm(null);
    setEditError("");
    setEditSuccess("");
    setOtpStage("idle");
    setOtpCode("");
    setOtpSentTo("");
    setResendCooldown(0);
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

  const getOwnerEmail = () => leader?.email || "";

  const startEditFlow = async () => {
    if (!result || !canEdit) return;
    const ownerEmail = getOwnerEmail();
    if (!ownerEmail) {
      setEditError("Leader email is not available for this registration.");
      return;
    }

    if (!editForm) {
      setEditForm(makeEditForm(result));
    }
    setEditError("");
    setEditSuccess("");
    setSendingOtp(true);
    try {
      const res = await requestEditOtp(CONTEST_SLUG, result.registrationCode, ownerEmail);
      setEditOpen(true);
      setOtpStage("awaiting");
      setOtpCode("");
      setOtpSentTo(res.sentTo);
      setResendCooldown(60);
    } catch (err: any) {
      setEditError(err.message || "Unable to send a verification code right now.");
      setEditOpen(false);
      setOtpStage("idle");
    } finally {
      setSendingOtp(false);
    }
  };

  const buildUpdatePayload = () => {
    if (!result) return null;
    const form = editForm || makeEditForm(result);

    const payload: {
      email: string;
      otp: string;
      teamName?: string;
      leaderTshirtSize?: string;
      secondMemberEmail?: string;
      secondMemberTshirtSize?: string;
    } = {
      email: getOwnerEmail(),
      otp: otpCode.trim(),
    };

    const originalTeamName = result.teamName || "";
    const cleanTeamName = form.teamName.trim();
    if (cleanTeamName && cleanTeamName !== originalTeamName) {
      payload.teamName = cleanTeamName;
    }

    const originalLeaderTshirtSize = leader?.tshirtSize || "";
    const cleanLeaderTshirtSize = form.leaderTshirtSize.trim();
    if (cleanLeaderTshirtSize && cleanLeaderTshirtSize !== originalLeaderTshirtSize) {
      payload.leaderTshirtSize = cleanLeaderTshirtSize;
    }

    const originalSecondMemberEmail = secondMember?.email || "";
    const cleanSecondMemberEmail = form.secondMemberEmail.trim();
    if (cleanSecondMemberEmail && normalize(cleanSecondMemberEmail) !== normalize(originalSecondMemberEmail)) {
      payload.secondMemberEmail = cleanSecondMemberEmail;
    }

    const originalSecondMemberTshirtSize = secondMember?.tshirtSize || "";
    const cleanSecondMemberTshirtSize = form.secondMemberTshirtSize.trim();
    if (cleanSecondMemberTshirtSize && cleanSecondMemberTshirtSize !== originalSecondMemberTshirtSize) {
      payload.secondMemberTshirtSize = cleanSecondMemberTshirtSize;
    }

    return payload;
  };

  const handleConfirmSave = async () => {
    if (!result || !editForm) return;
    setEditError("");
    setEditSuccess("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setEditError("Please enter the verification code.");
      return;
    }

    const payload = buildUpdatePayload();
    if (!payload) {
      setEditError("Unable to prepare the update request.");
      return;
    }
    if (!payload.teamName && !payload.leaderTshirtSize && !payload.secondMemberEmail && !payload.secondMemberTshirtSize) {
      setEditError("Please change at least one editable field before saving.");
      return;
    }

    setConfirming(true);
    try {
      const updated = await updateOwnRegistration(CONTEST_SLUG, result.registrationCode, payload);
      setResult(updated);
      setEditSuccess("Your registration information has been updated successfully.");
      setEditOpen(false);
      setOtpStage("idle");
      setOtpCode("");
      setOtpSentTo("");
    } catch (err: any) {
      setEditError(err.message || "Unable to verify that code. Please try again.");
    } finally {
      setConfirming(false);
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
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Check Your Registration</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-green-100/65 sm:text-base">
            Search with your team leader email or registration code/ID to view your team information and payment
            status.
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
                    setEditOpen(false);
                    setEditForm(null);
                    setEditError("");
                    setEditSuccess("");
                    setOtpStage("idle");
                    setOtpCode("");
                    setOtpSentTo("");
                    setResendCooldown(0);
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

              <button
                type="button"
                onClick={startEditFlow}
                disabled={!canEdit || sendingOtp}
                className="rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-black transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                {sendingOtp ? "Sending OTP..." : "Edit Info"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Team Name" value={result.teamName} />
              <ReadOnlyField label="Leader Name" value={leader?.name} />
              <ReadOnlyField label="Leader Email" value={leader?.email} />
              <ReadOnlyField label="Leader T-shirt Size" value={leader?.tshirtSize} />
              <ReadOnlyField label="Second Member Name" value={secondMember?.name} />
              <ReadOnlyField label="Second Member Email" value={secondMember?.email} />
              <ReadOnlyField label="Second Member T-shirt Size" value={secondMember?.tshirtSize} />
            </div>

            {!canEdit ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-green-100/70">
                Editing is currently locked by the organizers.
              </div>
            ) : null}

            {editSuccess ? (
              <div className="rounded-2xl border border-green-400/25 bg-green-500/8 px-4 py-3 text-sm font-semibold text-green-200">
                {editSuccess}
              </div>
            ) : null}

            {editOpen && editForm ? (
              <div className="rounded-2xl border border-green-500/10 bg-black/20 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">Edit Info</p>
                <p className="mt-2 text-sm text-green-100/65">
                  An OTP was sent to <span className="font-semibold text-green-300">{otpSentTo}</span>. Leave any
                  field unchanged if you do not want to update it.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={editForm.teamName}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, teamName: e.target.value } : prev))}
                      className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">
                      Leader T-shirt Size
                    </label>
                    <select
                      value={editForm.leaderTshirtSize}
                      onChange={(e) =>
                        setEditForm((prev) => (prev ? { ...prev, leaderTshirtSize: e.target.value } : prev))
                      }
                      className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                    >
                      <option value="">Keep current size</option>
                      {tshirtSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">
                      Second Member Email
                    </label>
                    <input
                      type="email"
                      value={editForm.secondMemberEmail}
                      onChange={(e) =>
                        setEditForm((prev) => (prev ? { ...prev, secondMemberEmail: e.target.value } : prev))
                      }
                      className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-green-300/70">
                      Second Member T-shirt Size
                    </label>
                    <select
                      value={editForm.secondMemberTshirtSize}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, secondMemberTshirtSize: e.target.value } : prev
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-green-500/15 bg-[rgba(0,20,8,0.88)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-400/40"
                    >
                      <option value="">Keep current size</option>
                      {tshirtSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {editError ? (
                  <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-200">
                    {editError}
                  </div>
                ) : null}

                {otpStage === "awaiting" ? (
                  <div className="mt-5 rounded-2xl border border-green-500/15 bg-black/25 p-4">
                    <p className="text-sm text-white/85">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-semibold text-green-300">{otpSentTo}</span> to save the changes.
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
                        {confirming ? "Saving..." : "Confirm & Save"}
                      </button>
                      <button
                        type="button"
                        onClick={startEditFlow}
                        disabled={resendCooldown > 0 || sendingOtp}
                        className="rounded-full border border-green-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-green-200 transition-all hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditOpen(false);
                          setOtpStage("idle");
                          setOtpCode("");
                          setOtpSentTo("");
                          setEditError("");
                        }}
                        className="text-xs font-bold uppercase tracking-[0.14em] text-green-100/50 hover:text-green-100/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const CONTEST_SLUG = import.meta.env.VITE_CONTEST_SLUG as string;
export const CONTEST_API_KEY = import.meta.env.VITE_CONTEST_API_KEY as string;

export interface ContestParticipant {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
}

export interface ContestConfig {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: "individual" | "team";
  minTeamSize: number | null;
  maxTeamSize: number | null;
  requiresPayment: boolean;
  paymentInstructions: string | null;
  venue: string | null;
  contestDate: string | null;
  registrationStartAt: string | null;
  registrationDeadlineAt: string | null;
  registrationEnabled: boolean;
  maxRegistrations: number | null;
  status: string;
  apiKey: string;
  isRegistrationOpen: boolean;
  registrationClosedReason: string;
  registrationCount: number;
}

export interface RegisterContestBody {
  teamName?: string;
  participants: ContestParticipant[];
  paymentMethod?: string;
  paymentNumber?: string;
  paymentTransactionId?: string;
}

export interface RegistrationStatusEntry {
  registrationCode: string;
  teamName: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  participants: { name: string; role: string; email: string }[];
}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }
  return data;
}

export async function getContest(slug: string): Promise<ContestConfig> {
  const res = await fetch(`${API_BASE_URL}/student/contests/${slug}`);
  const data = await parseJsonOrThrow(res);
  return data.contest;
}

export async function registerForContest(
  slug: string,
  apiKey: string,
  body: RegisterContestBody
): Promise<{ message: string; registration: any }> {
  const res = await fetch(`${API_BASE_URL}/student/contests/${slug}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  return parseJsonOrThrow(res);
}

export async function getRegistrationStatus(
  slug: string,
  email: string
): Promise<RegistrationStatusEntry[]> {
  const res = await fetch(
    `${API_BASE_URL}/student/contests/${slug}/status?email=${encodeURIComponent(email)}`
  );
  const data = await parseJsonOrThrow(res);
  return data.data;
}

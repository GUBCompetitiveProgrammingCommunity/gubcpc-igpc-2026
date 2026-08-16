const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const CONTEST_SLUG = import.meta.env.VITE_CONTEST_SLUG as string;
export const CONTEST_API_KEY = import.meta.env.VITE_CONTEST_API_KEY as string;

export interface ContestParticipant {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  tshirtSize: string;
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
  requiresTshirtSize: boolean;
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
  reference?: string;
  participants: ContestParticipant[];
  paymentMethod?: string;
  paymentNumber?: string;
  paymentTransactionId?: string;
}

export interface RegistrationStatusParticipant {
  id: number;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  tshirtSize: string | null;
  role: "individual" | "leader" | "member";
}

export interface RegistrationStatusEntry {
  registrationCode: string;
  teamName: string | null;
  reference: string | null;
  status: string;
  paymentStatus: string;
  remarks: string | null;
  createdAt: string;
  editingEnabled: boolean;
  paymentMethod: string | null;
  paymentNumber: string | null;
  paymentTransactionId: string | null;
  participants: RegistrationStatusParticipant[];
}

export interface UpdateOwnRegistrationBody {
  email: string;
  otp: string;
  teamName?: string;
  participants?: { id: number; name: string; tshirtSize: string }[];
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
  params: { email?: string; registrationId?: string }
): Promise<RegistrationStatusEntry | null> {
  const searchParams = new URLSearchParams();
  if (params.email) searchParams.set("email", params.email);
  if (params.registrationId) searchParams.set("registrationCode", params.registrationId);
  const res = await fetch(
    `${API_BASE_URL}/student/contests/${slug}/status?${searchParams.toString()}`
  );
  const data = await parseJsonOrThrow(res);
  return data.data;
}

export async function requestEditOtp(
  slug: string,
  registrationCode: string,
  email: string
): Promise<{ message: string; sentTo: string }> {
  const res = await fetch(
    `${API_BASE_URL}/student/contests/${slug}/registrations/${encodeURIComponent(registrationCode)}/request-edit-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  return parseJsonOrThrow(res);
}

export async function updateOwnRegistration(
  slug: string,
  registrationCode: string,
  body: UpdateOwnRegistrationBody
): Promise<RegistrationStatusEntry> {
  const res = await fetch(
    `${API_BASE_URL}/student/contests/${slug}/registrations/${encodeURIComponent(registrationCode)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await parseJsonOrThrow(res);
  return data.data;
}

export interface ContactMessageBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(
  body: ContactMessageBody
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/student/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonOrThrow(res);
}

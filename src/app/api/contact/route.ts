import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/contact/validation";
import { sendInquiry } from "@/lib/email/inquiry";

const MAX_BODY_BYTES = 8_000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function limitReached(key: string): boolean {
  const now = Date.now();
  if (attempts.size > 1_000) {
    for (const [ip, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(ip);
    }
    if (attempts.size > 1_000) attempts.clear();
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

const response = (message: string, status: number) =>
  NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return response("Unable to submit this inquiry.", 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return response("Invalid request format.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return response("Inquiry is too long.", 413);

  let payload: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
      return response("Inquiry is too long.", 413);
    }
    payload = JSON.parse(body);
  } catch {
    return response("Invalid request format.", 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return response("Please check the form fields and try again.", 400);

  // Bots commonly fill hidden fields. Answer generically without sending mail.
  if (parsed.data.website) return response("Unable to submit this inquiry.", 400);

  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limitReached(ip)) return response("Too many attempts. Please try again later.", 429);

  const sent = await sendInquiry(parsed.data);
  if (!sent) return response("We couldn't submit your inquiry right now. Please try again or contact us directly.", 503);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { ReferralSource } from "@/generated/prisma/client";
import { requireAdminUser } from "@/lib/session";
import { createReferralLead, findReferrerByCode } from "@/lib/referrals";
import { notifyNewLead } from "@/lib/email";
import { manualLeadSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const parsed = manualLeadSchema.parse(body);

    const referrer = await findReferrerByCode(parsed.refCode);

    if (!referrer) {
      return NextResponse.json(
        { ok: false, error: "Реферер с таким промокодом не найден" },
        { status: 404 },
      );
    }

    const result = await createReferralLead({
      referrerId: referrer.id,
      clientName: parsed.clientName,
      clientPhone: parsed.clientPhone,
      clientEmail: parsed.clientEmail,
      source: ReferralSource.MANUAL,
      notes: parsed.notes,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await notifyNewLead({
      clientName: result.referral.clientName,
      clientPhone: result.referral.clientPhone,
      referrerName: referrer.name,
      refCode: referrer.refCode,
    });

    return NextResponse.json({ ok: true, referral: result.referral });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

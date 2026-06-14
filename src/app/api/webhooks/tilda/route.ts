import { NextResponse } from "next/server";
import { ReferralSource } from "@/generated/prisma/client";
import { createReferralLead, findReferrerByCode } from "@/lib/referrals";
import {
  extractTildaLead,
  getPayloadFieldNames,
  isTildaWebhookTest,
  parseTildaPayload,
  verifyTildaWebhook,
} from "@/lib/tilda";
import { notifyNewLead } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body: unknown;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const payload = parseTildaPayload(body);

    if (!verifyTildaWebhook(payload)) {
      return NextResponse.json({ ok: false, error: "Invalid webhook secret" }, { status: 401 });
    }

    if (isTildaWebhookTest(payload)) {
      return NextResponse.json({ ok: true, test: true });
    }

    const lead = extractTildaLead(payload);

    if (!lead.clientPhone) {
      return NextResponse.json(
        {
          ok: false,
          error: "Phone is required",
          receivedFields: getPayloadFieldNames(payload),
          hint: "Укажите у поля телефона в Tilda имя переменной Phone или phone",
        },
        { status: 400 },
      );
    }

    if (!lead.refCode) {
      return NextResponse.json({ ok: true, skipped: true, reason: "No referral code" });
    }

    const referrer = await findReferrerByCode(lead.refCode);

    if (!referrer) {
      return NextResponse.json({ ok: false, error: "Referrer not found" }, { status: 404 });
    }

    const source =
      payload.ref_source === "code" ? ReferralSource.CODE : ReferralSource.LINK;

    const result = await createReferralLead({
      referrerId: referrer.id,
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      clientEmail: lead.clientEmail,
      source,
      notes: lead.notes,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    await notifyNewLead({
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      referrerName: referrer.name,
      refCode: referrer.refCode,
    });

    return NextResponse.json({
      ok: true,
      referralId: result.referral.id,
    });
  } catch (error) {
    console.error("[tilda webhook]", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}

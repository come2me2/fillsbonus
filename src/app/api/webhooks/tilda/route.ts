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

function wantsJsonResponse(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function webhookRespond(request: Request, json: Record<string, unknown>, status = 200) {
  if (wantsJsonResponse(request)) {
    return NextResponse.json(json, { status });
  }

  // Tilda ожидает plain text "ok" (см. help.tilda.cc/forms/webhook)
  return new NextResponse("ok", {
    status: status === 401 ? 401 : 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

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
      console.warn("[tilda webhook] rejected: invalid secret", getPayloadFieldNames(payload));
      return webhookRespond(request, { ok: false, error: "Invalid webhook secret" }, 401);
    }

    if (isTildaWebhookTest(payload)) {
      return webhookRespond(request, { ok: true, test: true });
    }

    const lead = extractTildaLead(payload);
    console.info("[tilda webhook] lead", {
      fields: getPayloadFieldNames(payload),
      phone: lead.clientPhone ? "yes" : "no",
      refCode: lead.refCode || "(empty)",
      name: lead.clientName,
    });

    if (!lead.clientPhone) {
      console.warn("[tilda webhook] phone missing", getPayloadFieldNames(payload));
      return webhookRespond(
        request,
        {
          ok: false,
          error: "Phone is required",
          receivedFields: getPayloadFieldNames(payload),
          hint: "Укажите у поля телефона в Tilda имя переменной Phone или phone",
        },
        400,
      );
    }

    if (!lead.refCode) {
      console.info("[tilda webhook] skipped: no referral code");
      return webhookRespond(request, { ok: true, skipped: true, reason: "No referral code" });
    }

    const referrer = await findReferrerByCode(lead.refCode);

    if (!referrer) {
      console.warn("[tilda webhook] referrer not found:", lead.refCode);
      return webhookRespond(request, { ok: false, error: "Referrer not found" }, 404);
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
      console.warn("[tilda webhook] create failed:", result.error, lead.clientPhone);
      return webhookRespond(request, { ok: false, error: result.error }, 409);
    }

    console.info("[tilda webhook] created:", result.referral.id, lead.refCode);
    await notifyNewLead({
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      referrerName: referrer.name,
      refCode: referrer.refCode,
    });

    return webhookRespond(request, {
      ok: true,
      referralId: result.referral.id,
    });
  } catch (error) {
    console.error("[tilda webhook]", error);
    return webhookRespond(request, { ok: false, error: "Webhook processing failed" }, 500);
  }
}

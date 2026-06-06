type TildaPayload = Record<string, string>;

function pickField(payload: TildaPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const direct = payload[key];
    if (direct) return direct;

    const lowerKey = Object.keys(payload).find(
      (entry) => entry.toLowerCase() === key.toLowerCase(),
    );

    if (lowerKey && payload[lowerKey]) {
      return payload[lowerKey];
    }
  }

  return undefined;
}

export function parseTildaPayload(body: unknown): TildaPayload {
  if (!body || typeof body !== "object") {
    return {};
  }

  const payload: TildaPayload = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      payload[key] = value;
    } else if (Array.isArray(value)) {
      payload[key] = value.join(", ");
    } else if (value != null) {
      payload[key] = String(value);
    }
  }

  return payload;
}

export function extractTildaLead(payload: TildaPayload) {
  const clientName =
    pickField(payload, ["name", "Name", "Имя", "your_name", "client_name"]) ??
    "Клиент";

  const clientPhone =
    pickField(payload, ["Phone", "phone", "tel", "Телефон", "client_phone"]) ??
    "";

  const clientEmail = pickField(payload, ["email", "Email", "E-mail", "client_email"]);

  const refCode =
    pickField(payload, [
      "ref_code",
      "ref",
      "promo",
      "promocode",
      "Промокод",
      "promo_code",
    ]) ?? "";

  const notes =
    pickField(payload, ["comment", "message", "Комментарий", "formname"]) ??
    undefined;

  return {
    clientName,
    clientPhone,
    clientEmail,
    refCode: refCode.trim().toUpperCase(),
    notes,
    raw: payload,
  };
}

export function verifyTildaWebhook(
  payload: TildaPayload,
  providedSecret?: string | null,
): boolean {
  const expectedSecret = process.env.TILDA_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return true;
  }

  const secret =
    providedSecret ??
    payload.secret ??
    payload.webhook_secret ??
    payload.token;

  return secret === expectedSecret;
}

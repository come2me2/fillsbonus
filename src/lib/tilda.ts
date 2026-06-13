type TildaPayload = Record<string, string>;

const META_KEYS = new Set([
  "tranid",
  "formid",
  "cookies",
  "secret",
  "webhook_secret",
  "token",
  "test",
  "formname",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);

function decodeValue(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function flattenPayload(input: Record<string, unknown>, prefix = ""): TildaPayload {
  const payload: TildaPayload = {};

  for (const [key, value] of Object.entries(input)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value == null) {
      continue;
    }

    if (typeof value === "string") {
      payload[fullKey] = decodeValue(value);
      payload[key] = decodeValue(value);
      continue;
    }

    if (Array.isArray(value)) {
      const joined = value.map((item) => String(item)).join(", ");
      payload[fullKey] = decodeValue(joined);
      payload[key] = decodeValue(joined);
      continue;
    }

    if (typeof value === "object") {
      Object.assign(payload, flattenPayload(value as Record<string, unknown>, fullKey));
    }
  }

  return payload;
}

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

function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function findPhoneByHeuristic(payload: TildaPayload): string | undefined {
  for (const [key, value] of Object.entries(payload)) {
    const normalizedKey = key.toLowerCase();

    if (META_KEYS.has(normalizedKey)) {
      continue;
    }

    if (!looksLikePhone(value)) {
      continue;
    }

    if (/phone|tel|mobile|whatsapp|тел|номер/i.test(key)) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    const normalizedKey = key.toLowerCase();

    if (META_KEYS.has(normalizedKey)) {
      continue;
    }

    if (looksLikePhone(value)) {
      return value;
    }
  }

  return undefined;
}

export function parseTildaPayload(body: unknown): TildaPayload {
  if (!body || typeof body !== "object") {
    return {};
  }

  return flattenPayload(body as Record<string, unknown>);
}

export function isTildaWebhookTest(payload: TildaPayload): boolean {
  const testValue = payload.test?.trim().toLowerCase();
  const keys = Object.keys(payload).filter((key) => !META_KEYS.has(key.toLowerCase()) || key === "test");

  return testValue === "test" && keys.length <= 2;
}

function findRefCodeByHeuristic(payload: TildaPayload): string | undefined {
  for (const [key, value] of Object.entries(payload)) {
    if (META_KEYS.has(key.toLowerCase()) || !value.trim()) {
      continue;
    }

    const normalizedKey = key.toLowerCase().replace(/[\s_-]+/g, "");

    if (normalizedKey === "refcode" || normalizedKey === "promocode") {
      return value;
    }

    if (/ref.*code|promo.*code|промокод/i.test(key)) {
      return value;
    }
  }

  return undefined;
}

export function extractTildaLead(payload: TildaPayload) {
  const clientName =
    pickField(payload, [
      "name",
      "Name",
      "Имя",
      "your_name",
      "client_name",
      "имя",
      "fio",
      "Fio",
    ]) ?? "Клиент";

  const clientPhone =
    pickField(payload, [
      "Phone",
      "phone",
      "tel",
      "Tel",
      "Телефон",
      "телефон",
      "client_phone",
      "phone_number",
      "Phone_number",
      "mobile",
      "Mobile",
      "whatsapp",
      "Whatsapp",
    ]) ?? findPhoneByHeuristic(payload) ??
    "";

  const clientEmail = pickField(payload, [
    "email",
    "Email",
    "E-mail",
    "client_email",
    "mail",
  ]);

  const refCode =
    pickField(payload, [
      "ref_code",
      "ref code",
      "Ref code",
      "Ref_code",
      "ref",
      "promo",
      "promocode",
      "Промокод",
      "promo_code",
      "promoCode",
    ]) ??
    findRefCodeByHeuristic(payload) ??
    "";

  const notes =
    pickField(payload, ["comment", "message", "Комментарий", "formname", "comments"]) ??
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

export function getPayloadFieldNames(payload: TildaPayload): string[] {
  return Object.keys(payload).filter((key) => !META_KEYS.has(key.toLowerCase()));
}

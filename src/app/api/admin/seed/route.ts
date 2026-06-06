import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { seedMockData, SEED_DEFAULT_PASSWORD } from "@/lib/seed-mock";

export async function POST() {
  try {
    await requireAdminUser();
    const result = await seedMockData();

    return NextResponse.json({
      ok: true,
      message: "Мок-данные загружены",
      adminEmail: result.adminEmail,
      defaultPassword: SEED_DEFAULT_PASSWORD,
      referrers: result.referrers,
      referrals: result.referrals,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    console.error("[admin seed]", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 },
    );
  }
}

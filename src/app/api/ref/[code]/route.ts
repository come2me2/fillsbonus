import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLIENT_DISCOUNT_PERCENT } from "@/lib/bonus";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const refCode = code.trim().toUpperCase();

  const referrer = await prisma.user.findUnique({
    where: { refCode },
    select: { name: true, refCode: true },
  });

  if (!referrer) {
    return NextResponse.json(
      { ok: false, error: "Invalid referral code" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      refCode: referrer.refCode,
      referrerName: referrer.name,
      clientDiscountPercent: CLIENT_DISCOUNT_PERCENT,
      message: `Скидка ${CLIENT_DISCOUNT_PERCENT}% для новых клиентов по промокоду ${referrer.refCode}`,
    },
    { headers: CORS_HEADERS },
  );
}

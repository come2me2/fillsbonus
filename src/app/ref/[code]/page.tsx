import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CLIENT_DISCOUNT_PERCENT } from "@/lib/bonus";
import { getReferralLink } from "@/lib/ref-code";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function RefLandingPage({ params }: PageProps) {
  const { code } = await params;
  const refCode = code.trim().toUpperCase();

  const referrer = await prisma.user.findUnique({
    where: { refCode },
    select: { name: true, refCode: true },
  });

  if (!referrer) {
    notFound();
  }

  const shopLink = getReferralLink(referrer.refCode);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">FILLS Referral Program</p>
      <h1 className="mt-4 text-3xl font-semibold text-brand-dark md:text-4xl">
        Вам доступна скидка {CLIENT_DISCOUNT_PERCENT}%
      </h1>
      <p className="mt-6 text-lg text-muted">
        {referrer.name} пригласил вас в FILLS. При заказе мебели укажите промокод{" "}
        <span className="font-semibold tracking-[0.15em] text-brand">{referrer.refCode}</span> или
        перейдите по ссылке ниже — скидка {CLIENT_DISCOUNT_PERCENT}% будет учтена менеджером при
        расчёте сметы.
      </p>

      <div className="mt-10 space-y-4">
        <Link
          href={shopLink}
          className="btn-pill inline-flex rounded-full bg-brand px-8 py-3 font-medium text-white hover:bg-brand-dark"
        >
          Перейти на fillsdesign.ru
        </Link>
        <p className="text-sm text-muted">
          Промокод: <span className="font-medium text-brand-dark">{referrer.refCode}</span>
        </p>
      </div>
    </div>
  );
}

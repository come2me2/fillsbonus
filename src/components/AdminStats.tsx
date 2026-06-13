type ReferralForStats = {
  status: string;
  order: {
    amount: string | number;
    bonusAmount?: string | number | null;
  } | null;
};

export function AdminStats({ referrals }: { referrals: ReferralForStats[] }) {
  const total = referrals.length;
  const pendingAction = referrals.filter(
    (r) => r.status === "LEAD" || r.status === "DELIVERED",
  ).length;
  const turnover = referrals
    .filter((r) => r.status === "BONUS_ACCRUED" && r.order)
    .reduce((sum, r) => sum + Number(r.order?.amount ?? 0), 0);
  const bonusesPaid = referrals.reduce(
    (sum, r) => sum + Number(r.order?.bonusAmount ?? 0),
    0,
  );

  const cards = [
    { label: "Всего заявок", value: total.toLocaleString("ru-RU") },
    { label: "Ожидают действия", value: pendingAction.toLocaleString("ru-RU") },
    {
      label: "Суммарный оборот",
      value: `${turnover.toLocaleString("ru-RU")} ₽`,
    },
    {
      label: "Выплачено бонусов",
      value: `${bonusesPaid.toLocaleString("ru-RU")} ₽`,
    },
  ];

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-border bg-card p-5"
        >
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-brand-dark">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

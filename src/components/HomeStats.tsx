import { Money } from "@/components/Money";

type HomeStatsProps = {
  participants: number;
  totalBonuses: number;
  successfulOrders: number;
};

export function HomeStats({ participants, totalBonuses, successfulOrders }: HomeStatsProps) {
  const cards = [
    {
      label: "Участников программы",
      value: <span>{participants.toLocaleString("ru-RU")}</span>,
    },
    {
      label: "Успешных реферальных заказов",
      value: <span>{successfulOrders.toLocaleString("ru-RU")}</span>,
    },
    {
      label: "Начислено бонусов",
      value: <Money amount={totalBonuses} />,
    },
  ];

  return (
    <section>
      <h2 className="text-center text-2xl font-medium text-brand-dark">Программа уже работает</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card p-6 text-center"
          >
            <p className="text-3xl font-semibold text-brand-dark">{card.value}</p>
            <p className="mt-2 text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

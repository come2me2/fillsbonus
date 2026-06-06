const statusLabels: Record<string, string> = {
  LEAD: "Заявка",
  IN_PROGRESS: "В работе",
  PAID: "Оплачен",
  DELIVERED: "Доставлен",
  BONUS_ACCRUED: "Бонус начислен",
  REJECTED: "Отклонён",
  PENDING: "Ожидает",
  COMPLETED: "Завершено",
  WITHDRAWAL_REQUEST: "Запрос вывода",
  WITHDRAWAL_PAID: "Выплачено",
  SPEND: "На заказ",
  ACCRUAL: "Начисление",
};

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  PAID: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  BONUS_ACCRUED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  WITHDRAWAL_REQUEST: "bg-purple-100 text-purple-800",
  WITHDRAWAL_PAID: "bg-green-100 text-green-800",
  SPEND: "bg-sky-100 text-sky-800",
  ACCRUAL: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

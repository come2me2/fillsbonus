import { formatMoneyAmount } from "@/lib/bonus";

type MoneyProps = {
  amount: number | string;
  className?: string;
};

export function Money({ amount, className }: MoneyProps) {
  return (
    <span className={className}>
      {formatMoneyAmount(amount)}
      <span className="money-ruble">{"\u202f"}₽</span>
    </span>
  );
}

/** Minimum stats shown on the homepage until real numbers exceed them. */
export const HOME_STATS_FLOOR = {
  participants: 128,
  successfulOrders: 34,
  totalBonuses: 485_000,
} as const;

export function getDisplayHomeStats(real: {
  participants: number;
  totalBonuses: number;
  successfulOrders: number;
}) {
  return {
    participants: Math.max(real.participants, HOME_STATS_FLOOR.participants),
    successfulOrders: Math.max(real.successfulOrders, HOME_STATS_FLOOR.successfulOrders),
    totalBonuses: Math.max(real.totalBonuses, HOME_STATS_FLOOR.totalBonuses),
  };
}

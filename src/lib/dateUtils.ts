import { config } from "@/constants/config";

/**
 * Returns true if the given ISO date string is older than the threshold.
 */
export function isStale(
  isoDate: string,
  thresholdDays: number = config.STALENESS_THRESHOLD_DAYS
): boolean {
  const updated = new Date(isoDate).getTime();
  const now = Date.now();
  const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
  return diffDays >= thresholdDays;
}

/**
 * Returns the number of days since the given ISO date string.
 */
export function daysSince(isoDate: string): number {
  const updated = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - updated) / (1000 * 60 * 60 * 24));
}

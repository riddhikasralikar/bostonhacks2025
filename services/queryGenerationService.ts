import type { Trend } from '../types';

export const generateVibeQueries = async (
  trend: Trend,
  count: number = 10
): Promise<string[]> => {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'queries', trend, count }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to generate queries.');
  }

  return res.json();
};

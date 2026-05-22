import type { Trend } from '../types';

export const predictTrendsFromImages = async (
  images: { base64: string; mimeType: string }[]
): Promise<Trend[]> => {
  if (images.length === 0) throw new Error('At least one image is required.');

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'analyze', images }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to analyze trends.');
  }

  return res.json();
};

const getNextSeason = (): string => {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  if (month === 11 || month <= 1) return `Spring ${year}`;
  if (month <= 4) return `Summer ${year}`;
  if (month <= 7) return `Fall ${year}`;
  return `Winter ${year}/${year + 1}`;
};

export const predictSeasonalTrends = async (): Promise<Trend[]> => {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'seasonal' }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to forecast seasonal trends.');
  }

  return res.json();
};

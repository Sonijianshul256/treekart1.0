import type { TreeStatus } from '@/types';

export function markerIcon(status: TreeStatus) {
  const color = status === 'available' ? '2f9e44' : status === 'rented' ? '2f6fed' : 'e9a93a';
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="48" viewBox="0 0 34 48">
        <path fill="#${color}" d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 31 17 31s17-18.25 17-31C34 7.61 26.39 0 17 0Z"/>
        <circle cx="17" cy="17" r="6" fill="white"/>
      </svg>
    `)}`
  };
}

export function estimateEta(distanceKm: number, speedKmph = 28) {
  const hours = distanceKm / speedKmph;
  return `${Math.max(1, Math.round(hours * 60))} min`;
}

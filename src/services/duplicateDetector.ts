import { Complaint } from '../types';
import { StorageService } from './storage';
import { getHaversineDistance } from './routingEngine';

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateComplaint?: Complaint;
  distanceMeters: number;
  message: string;
}

export function checkForDuplicate(
  category: string,
  lat: number,
  lng: number,
  excludeId?: string
): DuplicateCheckResult {
  const allComplaints = StorageService.getComplaints().filter(
    (c) => c.status !== 'Closed' && c.id !== excludeId
  );

  let closest: Complaint | undefined;
  let minDistance = Number.MAX_VALUE;

  for (const c of allComplaints) {
    if (c.category === category) {
      const dist = getHaversineDistance(lat, lng, c.lat, c.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = c;
      }
    }
  }

  // If there's an identical category within 150 metres
  if (closest && minDistance <= 150) {
    return {
      hasDuplicate: true,
      duplicateComplaint: closest,
      distanceMeters: Math.round(minDistance),
      message: `Similar complaint found nearby: #${closest.id} (${closest.category}) is ${Math.round(minDistance)} metres away.`,
    };
  }

  return {
    hasDuplicate: false,
    distanceMeters: Math.round(minDistance === Number.MAX_VALUE ? 0 : minDistance),
    message: 'No similar nearby complaints detected.',
  };
}

import { RoutingDecision } from '../types';
import { StorageService } from './storage';
import { OFFICIAL_LOCALITIES } from '../data/mysuruOfficialData';

export interface RouteComplaintInput {
  complaintId: string;
  category: string;
  lat: number;
  lng: number;
  locationName: string;
  submissionDate?: string; // defaults to now
}

export function routeComplaint(input: RouteComplaintInput): RoutingDecision {
  const submissionTime = input.submissionDate ? new Date(input.submissionDate) : new Date();
  const routingDeadline = new Date(submissionTime.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const jurisdictions = StorageService.getJurisdictions();
  const versions = StorageService.getJurisdictionVersions();

  // Find nearest or matching jurisdiction
  let matchedJurisdiction = jurisdictions[0]; // default MCC Core
  let minDistance = Number.MAX_VALUE;

  for (const j of jurisdictions) {
    const dist = getHaversineDistance(input.lat, input.lng, j.centerLat, j.centerLng);
    if (dist <= j.radiusMeters && dist < minDistance) {
      minDistance = dist;
      matchedJurisdiction = j;
    }
  }

  // Find active version for this jurisdiction at submission time
  const subDateStr = submissionTime.toISOString().slice(0, 10);
  const matchedVersion = versions.find((v) => {
    if (v.jurisdictionId !== matchedJurisdiction.id) return false;
    const startOk = v.effectiveStartDate <= subDateStr;
    const endOk = !v.effectiveEndDate || v.effectiveEndDate >= subDateStr;
    return startOk && endOk;
  }) || versions.find((v) => v.id === matchedJurisdiction.activeVersionId) || versions[0];

  // Lookup Locality Info
  const localityMatch = OFFICIAL_LOCALITIES.find(
    (l) => l.name.toLowerCase() === input.locationName.toLowerCase() ||
           getHaversineDistance(input.lat, input.lng, l.lat, l.lng) < 800
  );

  const governingBody = matchedVersion.governingBody;
  let department = 'Engineering';
  let authority = governingBody;
  let ruleApplied = '';
  let isManualReviewRequired = false;

  // Determine official department based on category and jurisdiction type
  switch (input.category) {
    case 'Pothole / Road Damage':
      if (governingBody.includes('Gram Panchayat')) {
        department = 'Panchayat Engineering Division';
        authority = governingBody;
        ruleApplied = 'Rural road maintenance under Zilla Panchayat / Gram Panchayat jurisdiction';
      } else if (governingBody.includes('Town Municipal') || governingBody.includes('Town Panchayat')) {
        department = 'Engineering & Public Works';
        authority = governingBody;
        ruleApplied = 'Town municipal road infrastructure maintenance mandate';
      } else {
        department = 'Roads & Infrastructure (Engineering)';
        authority = 'Mysuru City Corporation';
        ruleApplied = 'Road-related civic issue within City Corporation limits (rule-pothole-mcc)';
      }
      break;

    case 'Garbage Overflow':
      department = 'Health & Solid Waste Management';
      authority = governingBody.includes('Mysuru City Corporation') ? 'Mysuru City Corporation' : governingBody;
      ruleApplied = 'Solid waste overflow & public sanitation within municipal limits';
      break;

    case 'Blocked Drain':
      if (governingBody.includes('Gram Panchayat')) {
        department = 'Panchayat Sanitation & Drainage';
        authority = governingBody;
        ruleApplied = 'Rural drainage desilting and open gutter maintenance';
      } else {
        department = 'Underground Drainage (UGD)';
        authority = 'Mysuru City Corporation';
        ruleApplied = 'UGD blockage and stormwater drain overflow within MCC limits';
      }
      break;

    case 'Streetlight Problem':
      department = 'Street Lighting & CESC Liaison';
      authority = 'Mysuru City Corporation / CESC';
      ruleApplied = 'Public street illumination within urban grid under MCC and CESC MoU';
      break;

    case 'Water Issue':
      if (governingBody.includes('Gram Panchayat')) {
        department = 'Rural Drinking Water & Sanitation Dept (RDWSD)';
        authority = 'Taluk Panchayat Mysuru';
        ruleApplied = 'Rural multi-village water supply scheme';
      } else {
        department = 'Vani Vilas Water Works (VVWW)';
        authority = 'Mysuru City Corporation';
        ruleApplied = 'Municipal pipeline supply and potable drinking water breakdown';
      }
      break;

    case 'Construction Waste':
      department = 'Town Planning & Building Enforcement';
      authority = governingBody.includes('Mysuru City Corporation') ? 'Mysuru City Corporation' : governingBody;
      ruleApplied = 'Illegal C&D waste dumped on public thoroughfare';
      break;

    default:
      department = 'General Public Grievance Cell';
      authority = governingBody;
      ruleApplied = 'Unclassified category requiring administrative triaging';
      isManualReviewRequired = true;
      break;
  }

  // Construct Explainability statement
  const zoneInfo = localityMatch ? ` (${localityMatch.zone})` : '';
  const explanation = isManualReviewRequired
    ? `Manual Review Required: The category "${input.category}" does not have a verified single automated mapping in official Mysuru datasets. It has been directed to the General Grievance Cell for human dispatch.`
    : `Location: ${input.locationName || 'Mysuru Coordinates'}${zoneInfo}
Current Jurisdiction: ${governingBody} (Version ${matchedVersion.versionNumber})
Issue Category: ${input.category}
Responsibility Rule: ${ruleApplied}
Department: ${department}
Authority: ${authority}
Routing Time: ${submissionTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}

Routing Logic: The reported GPS coordinates fall within the official territorial bounds of ${matchedJurisdiction.name}. In accordance with the official municipal service charter and active jurisdiction version ${matchedVersion.versionNumber} (effective ${matchedVersion.effectiveStartDate}), ${input.category.toLowerCase()} is assigned to ${department} under ${authority}.`;

  return {
    complaintId: input.complaintId,
    routedAt: submissionTime.toISOString(),
    complaintLocationName: input.locationName || 'Mysuru',
    lat: input.lat,
    lng: input.lng,
    jurisdictionId: matchedJurisdiction.id,
    jurisdictionName: matchedJurisdiction.name,
    jurisdictionVersionNumber: matchedVersion.versionNumber,
    governingBody,
    category: input.category,
    ruleApplied,
    department,
    authority,
    routingDeadline,
    routingSlaStatus: 'Within SLA',
    explanation,
    isManualReviewRequired,
  };
}

export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

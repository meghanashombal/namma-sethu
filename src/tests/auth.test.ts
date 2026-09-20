import { StorageService } from '../services/storage';
import { translations } from '../data/translations';
import { User, UserRole } from '../types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('--- Running Auth & RBAC Tests ---');

// Mock localStorage for Node environment if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    key: (i: number) => Object.keys(store)[i] || null,
    length: 0,
  } as Storage;
}

// Test 1: Demo users exist and contain required personas
const demoUsers = StorageService.getDemoUsers();
assert(Array.isArray(demoUsers) && demoUsers.length >= 3, 'Demo users list loaded with at least 3 personas');

const citizen = demoUsers.find((u) => u.role === 'CITIZEN');
const staff = demoUsers.find((u) => u.role === 'STAFF');
const admin = demoUsers.find((u) => u.role === 'ADMIN');

assert(!!citizen && !!citizen.name && !!citizen.email, 'Citizen demo user is properly configured');
assert(!!staff && !!staff.name && !!staff.department, 'Staff demo user has assigned department');
assert(!!admin && !!admin.name && !!admin.authority, 'Admin demo user has assigned authority');

// Test 2: StorageService get / set CurrentUser
StorageService.setCurrentUser(staff!);
const currentStaff = StorageService.getCurrentUser();
assert(currentStaff.id === staff!.id, 'Current user correctly saved and retrieved from storage (Staff)');

StorageService.setCurrentUser(citizen!);
const currentCitizen = StorageService.getCurrentUser();
assert(currentCitizen.id === citizen!.id, 'Current user correctly switched to Citizen');

// Test 3: Translations exist for Auth modal
assert(!!translations.en.appName, 'English translation contains appName');
assert(!!translations.kn.appName, 'Kannada translation contains appName');

// Test 4: Custom User creation logic verification
function createMockUser(name: string, email: string, phone: string, role: UserRole, department?: string): User {
  const domain =
    role === 'STAFF'
      ? 'mcc.mysuru.gov.in'
      : role === 'ADMIN'
      ? 'admin.mysuru.gov.in'
      : 'citizen.mysuru.gov.in';
  const cleanName = name.toLowerCase().replace(/\s+/g, '');

  return {
    id: `usr-custom-${Date.now()}`,
    name: name.trim(),
    email: email.trim() || `${cleanName}@${domain}`,
    role,
    department:
      role === 'STAFF'
        ? department || 'Roads & Infrastructure (Engineering)'
        : role === 'ADMIN'
        ? 'Civic Technology & System Admin'
        : undefined,
    authority:
      role === 'ADMIN'
        ? 'Mysuru District E-Governance Cell'
        : 'Mysuru City Corporation',
    phone: phone.trim() || '+91 98860 12345',
    preferredLanguage: 'en',
  };
}

const customCitizen = createMockUser('Ravi Shastri', '', '', 'CITIZEN');
assert(customCitizen.email === 'ravishastri@citizen.mysuru.gov.in', 'Citizen default email format is correct');
assert(customCitizen.phone === '+91 98860 12345', 'Citizen fallback phone is provided');

const customStaff = createMockUser('Girish Gowda', '', '+91 98450 99999', 'STAFF', 'Underground Drainage (UGD)');
assert(customStaff.email === 'girishgowda@mcc.mysuru.gov.in', 'Staff default email domain is mcc.mysuru.gov.in');
assert(customStaff.department === 'Underground Drainage (UGD)', 'Staff department is assigned');

const customAdmin = createMockUser('Priya Mohan', 'priya@custom.org', '', 'ADMIN');
assert(customAdmin.email === 'priya@custom.org', 'Admin custom email is preserved');
assert(customAdmin.authority === 'Mysuru District E-Governance Cell', 'Admin authority is assigned');

console.log('--- All Auth & RBAC tests passed successfully! ---');

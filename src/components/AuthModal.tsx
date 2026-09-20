import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Language, translations } from '../data/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onUserSelect: (user: User) => void;
  language: Language;
}

const STAFF_DEPARTMENTS = [
  'Roads & Infrastructure (Engineering)',
  'Health & Solid Waste Management',
  'Underground Drainage (UGD)',
  'Vani Vilas Water Works (VVWW)',
  'Street Lighting & CESC Liaison',
  'Town Planning & Building Enforcement',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserSelect,
  language,
}) => {
  const [tab, setTab] = useState<'demo' | 'signup'>('demo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [department, setDepartment] = useState(STAFF_DEPARTMENTS[0]);

  const t = translations[language] || translations.en;
  const demoUsers = StorageService.getDemoUsers();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const domain =
      role === 'STAFF'
        ? 'mcc.mysuru.gov.in'
        : role === 'ADMIN'
        ? 'admin.mysuru.gov.in'
        : 'citizen.mysuru.gov.in';
    const cleanName = name.toLowerCase().replace(/\s+/g, '');

    const newUser: User = {
      id: `usr-custom-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${cleanName}@${domain}`,
      role,
      department:
        role === 'STAFF'
          ? department
          : role === 'ADMIN'
          ? 'Civic Technology & System Admin'
          : undefined,
      authority:
        role === 'ADMIN'
          ? 'Mysuru District E-Governance Cell'
          : 'Mysuru City Corporation',
      phone: phone.trim() || '+91 98860 12345',
      preferredLanguage: language,
    };

    onUserSelect(newUser);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 id="auth-modal-title" className="text-base font-black text-slate-900">
              {t.appName} Authentication & RBAC
            </h2>
            <p className="text-xs text-slate-500">
              Switch roles to evaluate Citizen, Staff & Admin portals.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'demo' ? 'bg-white text-[#087F5B] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Switch Demo Account (Instant)
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'signup' ? 'bg-white text-[#087F5B] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register / Custom Sign In
          </button>
        </div>

        {/* DEMO ACCOUNTS */}
        {tab === 'demo' && (
          <div className="space-y-2.5 text-xs">
            <p className="text-slate-600 text-[11px]">
              Click any verified persona below to immediately experience the app from that role's perspective:
            </p>

            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onUserSelect(u);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  currentUser?.id === u.id
                    ? 'border-[#087F5B] bg-emerald-50/70 ring-2 ring-[#087F5B]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                      u.role === 'CITIZEN'
                        ? 'bg-blue-100 text-blue-700'
                        : u.role === 'STAFF'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {u.role === 'CITIZEN' ? (
                      <UserIcon className="w-5 h-5" />
                    ) : u.role === 'STAFF' ? (
                      <Briefcase className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {u.department ? `${u.department} • ` : ''}
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser?.id === u.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'CITIZEN'
                        ? 'bg-blue-50 text-blue-700'
                        : u.role === 'STAFF'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CUSTOM SIGN UP */}
        {tab === 'signup' && (
          <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Full Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Murthy"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Portal Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 focus:border-[#087F5B]"
              >
                <option value="CITIZEN">Citizen (Grievance Submitter)</option>
                <option value="STAFF">Civic Staff (Ward Field Engineer)</option>
                <option value="ADMIN">Administrator (District Grievance Officer)</option>
              </select>
            </div>

            {role === 'STAFF' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Department:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 focus:border-[#087F5B]"
                >
                  {STAFF_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number (Mysuru SMS updates):</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98860 12345"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address (Optional):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'STAFF'
                    ? 'anand@mcc.mysuru.gov.in'
                    : role === 'ADMIN'
                    ? 'anand@admin.mysuru.gov.in'
                    : 'anand@citizen.mysuru.gov.in'
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 focus:border-[#087F5B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white font-bold cursor-pointer transition-colors mt-2 shadow-sm"
            >
              Sign In to Namma Sethu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

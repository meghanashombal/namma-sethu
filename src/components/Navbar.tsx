import React, { useState } from 'react';
import {
  Shield,
  Languages,
  Bell,
  Smartphone,
  Monitor,
  UserCheck,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { User, NotificationItem, UserRole } from '../types';
import { Language, translations } from '../data/translations';
import { StorageService } from '../services/storage';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onNavigate: (view: string, complaintId?: string) => void;
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  language,
  onLanguageChange,
  isMobileFrame,
  onToggleMobileFrame,
  onNavigate,
  notifications,
  onRefreshNotifications,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const t = translations[language];
  const demoUsers = StorageService.getDemoUsers();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRoleSelect = (u: User) => {
    onUserChange(u);
    setShowRoleMenu(false);
    if (u.role === 'CITIZEN') onNavigate('citizen_dashboard');
    else if (u.role === 'STAFF') onNavigate('staff_dashboard');
    else if (u.role === 'ADMIN') onNavigate('admin_dashboard');
  };

  const handleNotifClick = (item: NotificationItem) => {
    StorageService.markNotificationAsRead(item.id);
    onRefreshNotifications();
    setShowNotifMenu(false);
    if (item.complaintId) {
      onNavigate('complaint_detail', item.complaintId);
    }
  };

  const markAllRead = () => {
    StorageService.markAllNotificationsAsRead(currentUser.id);
    onRefreshNotifications();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#087F5B] text-white shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand & Palace-Bridge Motif */}
        <button
          id="nav-brand-btn"
          onClick={() => {
            if (currentUser.role === 'CITIZEN') onNavigate('landing');
            else if (currentUser.role === 'STAFF') onNavigate('staff_dashboard');
            else onNavigate('admin_dashboard');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          {/* Logo symbol: Mysuru palace dome arch with bridge road */}
          <div className="w-10 h-10 rounded-xl bg-[#F8FAF6] text-[#087F5B] flex items-center justify-center font-black shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
            <span className="text-xl">🌉</span>
            <div className="absolute bottom-0 w-full h-1 bg-[#22C55E]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#22C55E]/30 text-[#A7F3D0] border border-[#22C55E]/40">
                MYSURU
              </span>
            </div>
            <p className="text-[11px] text-[#A7F3D0] font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            id="nav-lang-btn"
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-xs font-semibold text-[#A7F3D0] border border-white/10 transition-colors"
            title="Switch Language / ಭಾಷೆ ಬದಲಿಸಿ"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Desktop/Mobile Device Frame Toggle */}
          <button
            id="nav-frame-toggle-btn"
            onClick={onToggleMobileFrame}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-xs font-medium text-white/90 border border-white/10 transition-colors"
            title="Toggle between Mobile App mockup and Fullscreen view"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-lg bg-black/15 hover:bg-black/25 text-white relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div
                id="notif-dropdown-panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-3 bg-[#087F5B] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#A7F3D0]" />
                    <span className="font-bold text-sm">Notifications ({notifications.length})</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#A7F3D0] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Live SMS Gateway status */}
                <div className="px-3 py-1.5 bg-emerald-50 text-[10px] text-emerald-800 border-b border-emerald-100 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-medium">
                    <Smartphone className="w-3 h-3 text-[#087F5B]" />
                    <span>SMS Tracking sent to {currentUser.phone || '+91 98450 12345'}</span>
                  </span>
                  <span className="font-bold text-[#087F5B] uppercase text-[9px]">Live SMS</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                          !n.isRead ? 'bg-emerald-50/70 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher & Auth */}
          <div className="relative">
            <button
              id="nav-role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 border border-white/10 transition-colors text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[140px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-[#A7F3D0]">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Role Dropdown */}
            {showRoleMenu && (
              <div
                id="role-dropdown-panel"
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Account
                  </p>
                  <p className="text-xs text-slate-600">
                    Test RBAC & workflows instantly
                  </p>
                </div>

                <div className="mt-1 space-y-1">
                  {demoUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleRoleSelect(u)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-emerald-50 text-[#087F5B] font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            u.role === 'CITIZEN'
                              ? 'bg-blue-100 text-blue-700'
                              : u.role === 'STAFF'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onNavigate('landing');
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Landing Page
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onNavigate('auth');
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    {t.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Role } from '@resolvex/shared';
import { ResolveXLogo } from '../assets/ResolveXLogo';
import { Sun, Moon, Building2, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleLabels: Record<Role, string> = {
    [Role.STUDENT]: 'Student Reporter',
    [Role.STAFF]: 'Maintenance Staff',
    [Role.FACILITY_MANAGER]: 'Facility Manager',
    [Role.ADMINISTRATOR]: 'Administrator',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-navy-900/95 backdrop-blur border-b border-slate-200 dark:border-navy-800 transition-colors">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Organization Badge */}
          <div className="flex items-center gap-4">
            <ResolveXLogo size="md" variant="full" />
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
              <Building2 size={13} className="text-brand-blue dark:text-brand-sky" />
              <span className="font-medium">ResolveX University</span>
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-navy-700 px-1.5 py-0.2 rounded">College</span>
            </div>
          </div>

          {/* Desktop Right Nav (Role switcher, Theme, Quick Status) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Role Switcher Pill */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-800/80 p-1 rounded-lg border border-slate-200 dark:border-navy-700">
              <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <User size={13} />
                <span>Simulate Role:</span>
              </div>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                className="bg-white dark:bg-navy-900 text-xs font-medium text-navy-900 dark:text-slate-100 py-1 px-2.5 rounded-md border border-slate-300 dark:border-navy-600 focus:ring-2 focus:ring-brand-sky focus:outline-none cursor-pointer"
                aria-label="Select simulated user role"
              >
                {Object.values(Role).map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="touch-target p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-transparent hover:border-slate-200 dark:hover:border-navy-700 transition"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-navy-900" />}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleDarkMode}
              className="touch-target p-2 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-4 space-y-4">
          <div className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-navy-800 text-xs">
            <Building2 size={15} className="text-brand-blue" />
            <span className="font-semibold">Tenant:</span>
            <span>ResolveX University (COLLEGE)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Active Simulated Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Role).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`touch-target px-3 py-2 text-xs font-medium rounded-lg text-left border ${
                    currentRole === r
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-navy-700'
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

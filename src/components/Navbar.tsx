import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Shield,
  User,
  Database,
  LogOut,
  LogIn,
  SlidersHorizontal,
  Gift,
  Award,
  Sparkles,
  Users
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenInspector: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenInspector,
  onOpenAuth
}) => {
  const { currentUser, logout, activeRole, setActiveRole, switchUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner with Author details */}
      <div className="bg-slate-900 text-white text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-300">Lottery Portal Management System</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Author: <strong className="text-white">ANURAG KUMAR</strong> (Roll No: <code className="text-amber-300 font-mono">13000124009</code>)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 font-mono">
            ● 0-Cost Ready
          </span>
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] rounded transition font-semibold"
          >
            <Database className="w-3 h-3" />
            Inspect Master Stores (D1–D5)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Ticket className="w-5 h-5 transform -rotate-12" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                Lottery<span className="text-indigo-600">Portal</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Academic Management System
              </span>
            </div>
          </div>

          {/* Navigation Tabs based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {activeRole === 'Participant' ? (
              <>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'catalog'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Gift className="w-4 h-4 text-indigo-600" />
                  Lottery Catalog (FR-3)
                </button>
                <button
                  onClick={() => setCurrentTab('my-tickets')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'my-tickets'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  My Tickets (FR-1.5 / FR-3.5)
                </button>
                <button
                  onClick={() => setCurrentTab('profile')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'profile'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500" />
                  My Profile (FR-1.5)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('admin-events')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'admin-events'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Event Management (FR-2)
                </button>
                <button
                  onClick={() => setCurrentTab('admin-draw')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'admin-draw'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Execute Draw (FR-4)
                </button>
                <button
                  onClick={() => setCurrentTab('admin-claims')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'admin-claims'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-rose-500" />
                  Verify Claims (FR-5)
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* 1-Click Role Switcher for seamless testing */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setActiveRole('Participant');
                  if (currentUser?.Role === 'Administrator') {
                    // switch to participant demo
                    switchUser('USR-2001');
                  }
                  setCurrentTab('catalog');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeRole === 'Participant'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Participant
              </button>
              <button
                onClick={() => {
                  setActiveRole('Administrator');
                  if (currentUser?.Role !== 'Administrator') {
                    // switch to admin demo
                    switchUser('USR-1001');
                  }
                  setCurrentTab('admin-events');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeRole === 'Administrator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            {/* User Session Info */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:block text-right">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {currentUser.Name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentUser.User_ID} ({currentUser.Role})
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          {activeRole === 'Participant' ? (
            <>
              <button
                onClick={() => setCurrentTab('catalog')}
                className={`py-1 px-2 font-bold ${currentTab === 'catalog' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                Catalog
              </button>
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`py-1 px-2 font-bold ${currentTab === 'my-tickets' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setCurrentTab('profile')}
                className={`py-1 px-2 font-bold ${currentTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('admin-events')}
                className={`py-1 px-2 font-bold ${currentTab === 'admin-events' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                Events (FR-2)
              </button>
              <button
                onClick={() => setCurrentTab('admin-draw')}
                className={`py-1 px-2 font-bold ${currentTab === 'admin-draw' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                Draw (FR-4)
              </button>
              <button
                onClick={() => setCurrentTab('admin-claims')}
                className={`py-1 px-2 font-bold ${currentTab === 'admin-claims' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600'}`}
              >
                Claims (FR-5)
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

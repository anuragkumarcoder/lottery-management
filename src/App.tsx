import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { WinnerAlertBanner } from './components/WinnerAlertBanner';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { ClaimModal } from './components/ClaimModal';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { AuthModal } from './components/AuthModal';

import { CatalogView } from './pages/CatalogView';
import { MyTicketsView } from './pages/MyTicketsView';
import { ProfileView } from './pages/ProfileView';
import { AdminEventsView } from './pages/AdminEventsView';
import { AdminDrawView } from './pages/AdminDrawView';
import { AdminClaimsView } from './pages/AdminClaimsView';

import { TicketRecord, TransactionRecord, WinnerRecord } from './types/lottery';
import { storageService } from './services/storage';

const MainLayout: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('catalog');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    tickets: TicketRecord[];
    txn?: TransactionRecord | null;
  }>({ isOpen: false, tickets: [], txn: null });
  const [claimData, setClaimData] = useState<{
    isOpen: boolean;
    winner: WinnerRecord | null;
  }>({ isOpen: false, winner: null });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Switch default tab if role changes
  useEffect(() => {
    if (activeRole === 'Administrator' && (currentTab === 'catalog' || currentTab === 'my-tickets' || currentTab === 'profile')) {
      setCurrentTab('admin-events');
    } else if (activeRole === 'Participant' && (currentTab === 'admin-events' || currentTab === 'admin-draw' || currentTab === 'admin-claims')) {
      setCurrentTab('catalog');
    }
  }, [activeRole]);

  // Check for unclaimed winners for current user (FR-5.1)
  const unclaimedWinners: WinnerRecord[] = currentUser
    ? storageService.getWinnersByUser(currentUser.User_ID).filter(w => w.Claim_Status === 'Unclaimed')
    : [];

  const handleTicketPurchased = (tickets: TicketRecord[], txn: TransactionRecord) => {
    setReceiptData({
      isOpen: true,
      tickets,
      txn
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenReceipt = (tickets: TicketRecord[]) => {
    setReceiptData({
      isOpen: true,
      tickets,
      txn: null
    });
  };

  const handleOpenClaim = (winner: WinnerRecord) => {
    setClaimData({
      isOpen: true,
      winner
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Automated Winner Banner (FR-5.1) */}
      <WinnerAlertBanner
        unclaimedWinners={unclaimedWinners}
        onOpenClaim={handleOpenClaim}
      />

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeRole === 'Participant' ? (
          <>
            {currentTab === 'catalog' && (
              <CatalogView
                key={refreshTrigger}
                onTicketPurchased={handleTicketPurchased}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}
            {currentTab === 'my-tickets' && (
              <MyTicketsView
                key={refreshTrigger}
                onOpenReceipt={handleOpenReceipt}
                onOpenClaim={handleOpenClaim}
              />
            )}
            {currentTab === 'profile' && <ProfileView />}
          </>
        ) : (
          <>
            {currentTab === 'admin-events' && <AdminEventsView key={refreshTrigger} />}
            {currentTab === 'admin-draw' && <AdminDrawView key={refreshTrigger} />}
            {currentTab === 'admin-claims' && <AdminClaimsView key={refreshTrigger} />}
          </>
        )}
      </main>

      {/* Footer with Student Credentials & 0-Cost Info */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <span className="font-bold text-slate-800 block text-sm">
              Lottery Portal Management System
            </span>
            <span>
              Submitted by <strong>ANURAG KUMAR</strong> • Roll Number: <code className="text-indigo-600 font-bold">13000124009</code>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Master Tables (D1–D5) Inspector
            </button>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
              100% Zero-Cost Ready
            </span>
            <span>•</span>
            <span className="text-slate-400">GitHub Pages / Vercel 1-Click</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DigitalReceiptModal
        isOpen={receiptData.isOpen}
        onClose={() => setReceiptData({ isOpen: false, tickets: [], txn: null })}
        tickets={receiptData.tickets}
        transaction={receiptData.txn}
      />

      <ClaimModal
        isOpen={claimData.isOpen}
        onClose={() => setClaimData({ isOpen: false, winner: null })}
        winner={claimData.winner}
        onClaimSubmitted={() => setRefreshTrigger(prev => prev + 1)}
      />

      <DatabaseInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onDataReset={() => setRefreshTrigger(prev => prev + 1)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

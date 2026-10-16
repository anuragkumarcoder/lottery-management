import React, { useState } from 'react';
import { TicketRecord, WinnerRecord } from '../types/lottery';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Award,
  Receipt,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  ShieldCheck
} from 'lucide-react';

interface MyTicketsViewProps {
  onOpenReceipt: (tickets: TicketRecord[]) => void;
  onOpenClaim: (winner: WinnerRecord) => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  onOpenReceipt,
  onOpenClaim
}) => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'All' | 'Winner' | 'Valid'>('All');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Please Sign In</h3>
        <p className="text-xs text-slate-500 mt-1">
          You must be logged in to inspect your historic ticket purchases.
        </p>
      </div>
    );
  }

  const userTickets = storageService.getTicketsByUser(currentUser.User_ID);
  const userWinners = storageService.getWinnersByUser(currentUser.User_ID);

  const filteredTickets = userTickets.filter(t => {
    if (filter === 'Winner') return t.Status === 'Winner';
    if (filter === 'Valid') return t.Status === 'Valid';
    return true;
  });

  const getWinnerForTicket = (ticketId: string): WinnerRecord | undefined => {
    return userWinners.find(w => w.Ticket_ID === ticketId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Purchased Tickets & History (FR-1.5)
            </h2>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
              D3 Ticket Master
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Participant: <strong className="text-slate-800">{currentUser.Name}</strong> ({currentUser.User_ID})
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'All' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tickets ({userTickets.length})
          </button>
          <button
            onClick={() => setFilter('Winner')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filter === 'Winner'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Winners ({userWinners.length})
          </button>
          <button
            onClick={() => setFilter('Valid')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'Valid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No tickets found for this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't bought any tickets yet or none match the selected filter. Check the active lotteries catalog to participate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => {
            const winnerInfo = getWinnerForTicket(ticket.Ticket_ID);
            const isWinner = ticket.Status === 'Winner' || !!winnerInfo;

            return (
              <div
                key={ticket.Ticket_ID}
                className={`rounded-2xl p-5 border transition flex flex-col justify-between ${
                  isWinner
                    ? 'bg-gradient-to-br from-amber-50/90 via-yellow-50 to-white border-amber-300 shadow-md ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      ID: {ticket.Ticket_ID}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isWinner
                          ? 'bg-amber-400 text-amber-950 animate-pulse'
                          : ticket.Status === 'Valid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isWinner ? (
                        <>
                          <Award className="w-3.5 h-3.5" /> WINNER!
                        </>
                      ) : (
                        ticket.Status
                      )}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{ticket.Event_Title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">Event:</span>
                    <code className="text-xs font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {ticket.Event_ID}
                    </code>
                  </div>

                  {/* Serial Number Banner */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Serial Number (FR-3.5)
                      </span>
                      <span className="font-mono font-extrabold text-sm text-indigo-950 tracking-wider">
                        {ticket.Ticket_Number}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 text-sm">${ticket.Purchase_Price}</span>
                  </div>

                  {/* If Winner, Show Prize Card & Claim Button */}
                  {winnerInfo && (
                    <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-yellow-200" />
                          {winnerInfo.Prize}
                        </span>
                        <span className="text-base font-extrabold text-yellow-200">
                          ${winnerInfo.Prize_Amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/20 text-xs">
                        <span className="text-[11px] text-white/90">
                          Status:{' '}
                          <strong className="underline uppercase tracking-wider">
                            {winnerInfo.Claim_Status}
                          </strong>
                        </span>

                        {winnerInfo.Claim_Status === 'Unclaimed' && (
                          <button
                            onClick={() => onOpenClaim(winnerInfo)}
                            className="px-3 py-1 bg-white text-rose-700 hover:bg-yellow-100 font-bold text-xs rounded-lg shadow transition flex items-center gap-1"
                          >
                            Submit Claim (FR-5.2)
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {winnerInfo.Claim_Status === 'Pending' && (
                          <span className="text-[11px] bg-yellow-400/30 text-yellow-100 px-2 py-0.5 rounded border border-yellow-200/40">
                            Verification Pending (FR-5.3)
                          </span>
                        )}

                        {winnerInfo.Claim_Status === 'Approved' && (
                          <span className="text-[11px] bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded">
                            Approved ✓ Ready for Payout
                          </span>
                        )}

                        {winnerInfo.Claim_Status === 'Paid Out' && (
                          <span className="text-[11px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Paid Out ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(ticket.PurchasedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onOpenReceipt([ticket])}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Digital Receipt (FR-3.5)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

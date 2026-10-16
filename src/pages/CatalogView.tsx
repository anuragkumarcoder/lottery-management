import React, { useState } from 'react';
import { LotteryEventRecord, TicketRecord, TransactionRecord } from '../types/lottery';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface CatalogViewProps {
  onTicketPurchased: (tickets: TicketRecord[], txn: TransactionRecord) => void;
  onOpenAuth: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onTicketPurchased,
  onOpenAuth
}) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<LotteryEventRecord[]>(() => {
    storageService.enforceAutomaticExpiry();
    return storageService.getEvents();
  });

  // Purchase Modal State
  const [selectedEvent, setSelectedEvent] = useState<LotteryEventRecord | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment_sim' | 'processing'>('select');
  const [paymentError, setPaymentError] = useState<string>('');

  const refreshEvents = () => {
    storageService.enforceAutomaticExpiry();
    setEvents(storageService.getEvents());
  };

  const activeEvents = events.filter(e => e.Status === 'Active');
  const upcomingEvents = events.filter(e => e.Status === 'Upcoming');
  const closedEvents = events.filter(e => e.Status === 'Closed' || e.Status === 'Drawn' || e.Status === 'Locked');

  const handleStartPurchase = (event: LotteryEventRecord) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedEvent(event);
    setTicketCount(1);
    setPaymentStep('select');
    setPaymentError('');
  };

  const handleConfirmOrder = () => {
    if (!selectedEvent) return;
    const remaining = selectedEvent.Pool_Limit - selectedEvent.Sold_Count;
    if (ticketCount > remaining) {
      setPaymentError(`Cannot purchase ${ticketCount} tickets. Only ${remaining} remaining in pool!`);
      return;
    }
    // Advance to simulated payment gateway step
    setPaymentStep('payment_sim');
  };

  const handleExecutePayment = () => {
    if (!selectedEvent || !currentUser) return;
    setPaymentStep('processing');
    setPaymentError('');

    // Realistic small delay to simulate gateway communication & transaction logging
    setTimeout(() => {
      const res = storageService.purchaseTickets(
        currentUser.User_ID,
        currentUser.Name,
        selectedEvent.Event_ID,
        ticketCount,
        'Simulated Digital Payment (No-Cost Mode)'
      );

      if (res.success && res.txn) {
        refreshEvents();
        setSelectedEvent(null);
        setPaymentStep('select');
        onTicketPurchased(res.tickets, res.txn);
      } else {
        setPaymentStep('payment_sim');
        setPaymentError(res.message);
      }
    }, 900);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Transparent & Unbiased Automated Draws
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Official Lottery Portal & Draws
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Browse verified lottery events, check real-time ticket pool availability, and receive instant digital receipts with cryptographic ticket numbers.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              FR-3.2 Pool Validation
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              D4 Audit Logging
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Ticket className="w-4 h-4 text-amber-300" />
              D3 Unique Serial Assignment
            </div>
          </div>
        </div>
      </div>

      {/* Active Events Section (FR-3.1) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Lottery Events</h2>
            <p className="text-xs text-slate-500">Live ticket sales open for verified participants</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            {activeEvents.length} Active
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No active events currently open</h3>
            <p className="text-xs text-slate-500 mt-1">
              Switch to the Admin tab to schedule new lottery events under FR-2.1.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map(evt => {
              const remaining = evt.Pool_Limit - evt.Sold_Count;
              const percentSold = Math.min(100, Math.round((evt.Sold_Count / evt.Pool_Limit) * 100));
              const topPrize = evt.Prize_Breakdown[0];

              return (
                <div
                  key={evt.Event_ID}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                        {evt.Event_ID}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Active
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 leading-snug">{evt.Title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.Description}</p>

                    {/* Grand Prize Box */}
                    {topPrize && (
                      <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {topPrize.title}
                          </span>
                          <span className="text-2xl font-black text-amber-600 block mt-0.5">
                            ${topPrize.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-800 font-semibold bg-white px-2 py-1 rounded shadow-xs">
                          {evt.Prize_Breakdown.length} Prize Tier{evt.Prize_Breakdown.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar & Pool Stats */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Ticket Pool (D2 Limit)</span>
                        <span>
                          {evt.Sold_Count} / {evt.Pool_Limit} sold ({percentSold}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentSold}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{remaining} ticket{remaining === 1 ? '' : 's'} available</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          Closes: {new Date(evt.Closing_Time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Price / Ticket</span>
                      <span className="text-xl font-black text-slate-900">${evt.Price}</span>
                    </div>

                    <button
                      onClick={() => handleStartPurchase(evt)}
                      disabled={remaining <= 0}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Ticket className="w-4 h-4" />
                      Buy Tickets (FR-3)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Closed / Recent Draws Catalog */}
      {closedEvents.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Completed & Closed Events</h3>
              <p className="text-xs text-slate-500">Events undergoing or completed random winner draws (FR-4)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {closedEvents.length} events
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {closedEvents.map(evt => (
              <div key={evt.Event_ID} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-slate-500 font-semibold">{evt.Event_ID}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.Status === 'Drawn'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {evt.Status === 'Drawn' ? 'Draw Completed (D5)' : 'Closed / Locked'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{evt.Title}</h4>
                <p className="text-slate-500 mt-1">
                  Sold: {evt.Sold_Count} / {evt.Pool_Limit} tickets (${evt.Price}/ea)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FR-3 Purchase & Checkout Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                    FR-3: Ticket Purchase Flow
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">{selectedEvent.Title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {paymentError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {paymentStep === 'select' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Event Code:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedEvent.Event_ID}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Remaining in Ticket Pool (D2):</span>
                      <span className="font-bold text-emerald-600">
                        {selectedEvent.Pool_Limit - selectedEvent.Sold_Count} tickets
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Price Per Ticket:</span>
                      <span className="font-bold text-slate-900">${selectedEvent.Price}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Quantity of Tickets (FR-3.1)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                        >
                          -
                        </button>
                        <span className="px-5 py-2 font-bold text-sm text-slate-800 font-mono">
                          {ticketCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setTicketCount(
                              Math.min(
                                selectedEvent.Pool_Limit - selectedEvent.Sold_Count,
                                ticketCount + 1
                              )
                            )
                          }
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        {[1, 2, 5, 10].map(cnt => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() =>
                              setTicketCount(
                                Math.min(
                                  selectedEvent.Pool_Limit - selectedEvent.Sold_Count,
                                  cnt
                                )
                              )
                            }
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                              ticketCount === cnt
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            +{cnt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-500 block">Total Due:</span>
                      <span className="text-2xl font-black text-slate-900">
                        ${(selectedEvent.Price * ticketCount).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleConfirmOrder}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'payment_sim' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                    <span className="font-bold block flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Simulated Payment Gateway (FR-3.3)
                    </span>
                    <p className="text-indigo-700 mt-1">
                      As specified, the external payment gateway is bypassed for $0 deployment cost. You can simulate instant payment confirmation below.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Purchaser Name:</span>
                      <span className="font-semibold text-slate-900">{currentUser?.Name}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Purchaser User_ID (D1):</span>
                      <span className="font-mono text-slate-900">{currentUser?.User_ID}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Tickets:</span>
                      <span className="font-bold text-slate-900">{ticketCount} unit(s)</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Payable Amount:</span>
                      <span className="font-black text-base text-slate-900">
                        ${(selectedEvent.Price * ticketCount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('select')}
                      className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Confirm & Pay (FR-3.4 / 3.5)
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">Confirming Order & Generating Tickets...</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Writing to Transaction Log (D4) and assigning unique serials to Ticket Master Table (D3)...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { LotteryEventRecord, PrizeTier } from '../types/lottery';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Clock,
  Ban,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sliders,
  DollarSign,
  Ticket,
  Lock,
  Sparkles,
  Edit
} from 'lucide-react';

export const AdminEventsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<LotteryEventRecord[]>(() => {
    storageService.enforceAutomaticExpiry();
    return storageService.getEvents();
  });

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(25);
  const [poolLimit, setPoolLimit] = useState<number>(200);
  const [openingTime, setOpeningTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [closingTime, setClosingTime] = useState<string>(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState('');
  const [prizes, setPrizes] = useState<PrizeTier[]>([
    { rank: 1, title: '1st Prize (Grand)', amount: 5000, winnersCount: 1 },
    { rank: 2, title: '2nd Prize', amount: 1500, winnersCount: 2 }
  ]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const refreshEvents = () => {
    storageService.enforceAutomaticExpiry();
    setEvents(storageService.getEvents());
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');

    if (!title.trim()) {
      setStatusMessage('Event title is required.');
      return;
    }

    const openDate = new Date(openingTime);
    const closeDate = new Date(closingTime);

    if (closeDate <= openDate) {
      setStatusMessage('Closing timestamp must be later than opening timestamp.');
      return;
    }

    const newEvt = storageService.createEvent({
      Title: title.trim(),
      Price: Number(price),
      Pool_Limit: Number(poolLimit),
      Status: 'Active',
      Opening_Time: openDate.toISOString(),
      Closing_Time: closeDate.toISOString(),
      Prize_Breakdown: prizes,
      Description: description.trim()
    });

    setIsCreating(false);
    refreshEvents();
    setStatusMessage(`Successfully created event ${newEvt.Event_ID}: ${newEvt.Title} in Master Table D2!`);
  };

  const handleExtendClosing = (event: LotteryEventRecord) => {
    const currentClose = new Date(event.Closing_Time);
    const newClose = new Date(currentClose.getTime() + 3 * 24 * 3600 * 1000); // add 3 days
    storageService.updateEvent(event.Event_ID, {
      Closing_Time: newClose.toISOString(),
      Status: 'Active'
    });
    refreshEvents();
    setStatusMessage(`FR-2.3: Extended closing threshold for ${event.Event_ID} by 3 days.`);
  };

  const handleTerminate = (event: LotteryEventRecord) => {
    if (window.confirm(`FR-2.3 Dynamic Control: Are you sure you want to terminate "${event.Title}" before scheduled draw?`)) {
      storageService.updateEvent(event.Event_ID, {
        Status: 'Closed'
      });
      refreshEvents();
      setStatusMessage(`Event ${event.Event_ID} has been manually terminated and closed.`);
    }
  };

  const handleAddPrizeTier = () => {
    const nextRank = prizes.length + 1;
    setPrizes([...prizes, { rank: nextRank, title: `${nextRank}th Prize`, amount: 500, winnersCount: 1 }]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Event Configuration & Lifecycle (FR-2)
            </h2>
            <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
              D2 Event Master
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrator controls: Schedule lotteries, manage prize allocations, and dynamically terminate or extend events.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          {isCreating ? 'Cancel Configuration' : 'Configure New Lottery (FR-2.1)'}
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Creation Form Modal / Card (FR-2.1) */}
      {isCreating && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-lg space-y-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">FR-2.1: Schedule New Lottery Event</h3>
              <p className="text-xs text-slate-500">Parameters will be written to Lottery Event Master (D2)</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
              Auto ID Generator
            </span>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title (FR-2.1)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Festival Mega Fortune Draw 2026"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ticket Price ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Ticket Pool Limit (Pool_Limit)
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={poolLimit}
                  onChange={e => setPoolLimit(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Opening Timestamp
                </label>
                <input
                  type="datetime-local"
                  required
                  value={openingTime}
                  onChange={e => setOpeningTime(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Closing Timestamp (Auto-Lock FR-2.4)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={closingTime}
                  onChange={e => setClosingTime(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Terms
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details on rules, draw date, and eligibility..."
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Prize Breakdown Configuration (FR-2.1) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Prize Breakdown Allocation
                </span>
                <button
                  type="button"
                  onClick={handleAddPrizeTier}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Prize Tier
                </button>
              </div>

              <div className="space-y-2">
                {prizes.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs">
                    <span className="w-8 font-bold text-slate-500">#{p.rank}</span>
                    <input
                      type="text"
                      value={p.title}
                      onChange={e => {
                        const copy = [...prizes];
                        copy[idx].title = e.target.value;
                        setPrizes(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      placeholder="Prize Title"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">$</span>
                      <input
                        type="number"
                        min={1}
                        value={p.amount}
                        onChange={e => {
                          const copy = [...prizes];
                          copy[idx].amount = Number(e.target.value);
                          setPrizes(copy);
                        }}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Winners:</span>
                      <input
                        type="number"
                        min={1}
                        value={p.winnersCount}
                        onChange={e => {
                          const copy = [...prizes];
                          copy[idx].winnersCount = Number(e.target.value);
                          setPrizes(copy);
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Persist Event to D2 (FR-2.2)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
          <span>Configured Master Events ({events.length})</span>
          <span className="text-[11px] text-slate-400">FR-2.4 Auto-Expiry Active</span>
        </div>

        <div className="divide-y divide-slate-100">
          {events.map(evt => {
            const isClosed = evt.Status === 'Closed' || evt.Status === 'Drawn';
            const remaining = evt.Pool_Limit - evt.Sold_Count;

            return (
              <div key={evt.Event_ID} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {evt.Event_ID}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        evt.Status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.Status === 'Drawn'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {evt.Status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Price: <strong>${evt.Price}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{evt.Title}</h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Pool Sold: <strong>{evt.Sold_Count}</strong> / {evt.Pool_Limit} tickets ({remaining} left)
                    </span>
                    <span>•</span>
                    <span>Opens: {new Date(evt.Opening_Time).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-semibold">
                      Closing: {new Date(evt.Closing_Time).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* FR-2.3 Dynamic Event Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {evt.Status === 'Active' && (
                    <>
                      <button
                        onClick={() => handleExtendClosing(evt)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition"
                        title="Extend Registration Closing Time (FR-2.3)"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Extend +3 Days
                      </button>
                      <button
                        onClick={() => handleTerminate(evt)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
                        title="Manually terminate event prior to draw (FR-2.3)"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Terminate
                      </button>
                    </>
                  )}

                  {evt.Status === 'Closed' && (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Ready for Draw (FR-4)
                    </span>
                  )}

                  {evt.Status === 'Drawn' && (
                    <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Results Stored in D5
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

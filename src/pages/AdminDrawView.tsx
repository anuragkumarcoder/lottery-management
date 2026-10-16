import React, { useState } from 'react';
import { LotteryEventRecord, WinnerRecord, TicketRecord } from '../types/lottery';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Play,
  CheckCircle,
  AlertCircle,
  Award,
  ShieldAlert,
  Ticket,
  Users,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDrawView: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<LotteryEventRecord[]>(() => {
    storageService.enforceAutomaticExpiry();
    return storageService.getEvents();
  });

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnWinners, setDrawnWinners] = useState<WinnerRecord[]>([]);
  const [drawMessage, setDrawMessage] = useState<string>('');
  const [animatingNumber, setAnimatingNumber] = useState<string>('LOTTO-XXXXXX');

  const refreshEvents = () => {
    storageService.enforceAutomaticExpiry();
    setEvents(storageService.getEvents());
  };

  // Events eligible for draw (Closed status or manual draw trigger)
  const eligibleEvents = events.filter(e => e.Status === 'Closed' || e.Status === 'Locked');
  const pastDrawnEvents = events.filter(e => e.Status === 'Drawn');

  const selectedEvent = events.find(e => e.Event_ID === selectedEventId);
  const eventTickets: TicketRecord[] = selectedEventId
    ? storageService.getTicketsByEvent(selectedEventId)
    : [];

  const handleExecuteDraw = () => {
    if (!selectedEvent || !currentUser) return;
    if (eventTickets.length === 0) {
      setDrawMessage('Error: No tickets purchased for this event. Cannot execute draw.');
      return;
    }

    setIsDrawing(true);
    setDrawMessage('');
    setDrawnWinners([]);

    // Animate the random rolling algorithm (FR-4.3 visual feedback)
    let counter = 0;
    const interval = setInterval(() => {
      const randomTicket = eventTickets[Math.floor(Math.random() * eventTickets.length)];
      setAnimatingNumber(randomTicket.Ticket_Number);
      counter++;
      if (counter > 20) {
        clearInterval(interval);

        // Execute cryptographic draw
        const res = storageService.executeDraw(
          selectedEvent.Event_ID,
          currentUser.User_ID,
          currentUser.Name
        );

        setIsDrawing(false);
        if (res.success) {
          setDrawnWinners(res.winners);
          setDrawMessage(res.message);
          refreshEvents();

          // Celebration confetti
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.4 }
          });
        } else {
          setDrawMessage(res.message);
        }
      }
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Automated Random Winner Draw Engine (FR-4)
          </h2>
          <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
            FR-4.1 Draw Trigger Command
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute cryptographically unbiased pseudo-random winner selection on closed lottery pools and persist mappings to Winner Master Table (D5).
        </p>
      </div>

      {drawMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            drawMessage.includes('Error')
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {drawMessage.includes('Error') ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span>{drawMessage}</span>
        </div>
      )}

      {/* Control Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Event Selection (FR-4.1 & FR-4.2) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-600" />
            1. Select Closed Event (FR-4.1)
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Closed & Locked Events
            </label>
            <select
              value={selectedEventId}
              onChange={e => {
                setSelectedEventId(e.target.value);
                setDrawnWinners([]);
                setDrawMessage('');
              }}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Choose an Event to Draw --</option>
              {eligibleEvents.map(evt => (
                <option key={evt.Event_ID} value={evt.Event_ID}>
                  {evt.Event_ID}: {evt.Title} ({evt.Sold_Count} sold)
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Event Title:</span>
                <span className="font-bold text-slate-900">{selectedEvent.Title}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {selectedEvent.Status}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Eligible Tickets in D3 (FR-4.2):</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {eventTickets.length} ticket(s)
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Prize Tiers Configured:</span>
                <span className="font-bold text-slate-800">
                  {selectedEvent.Prize_Breakdown.length} tiers
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleExecuteDraw}
            disabled={!selectedEvent || eventTickets.length === 0 || isDrawing}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            {isDrawing ? 'Selecting Winners Randomly...' : 'Execute Secure Draw (FR-4.1)'}
          </button>
        </div>

        {/* Right: Unbiased Draw Visualizer (FR-4.3) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-800">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              FR-4.3: Unbiased Pseudo-Random Algorithm
            </span>
            <h3 className="text-xl font-bold">Random Winner Selection Terminal</h3>
            <p className="text-xs text-slate-400">
              Uses cryptographically secure Web Crypto values (<code className="text-emerald-400">crypto.getRandomValues</code>) to shuffle and assign prizes without human bias or intervention.
            </p>
          </div>

          {/* Randomizer Animation Display */}
          <div className="my-8 py-8 px-6 bg-slate-950/80 rounded-2xl border border-indigo-500/30 text-center space-y-3">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Live Serial Number Stream
            </span>
            <div className="text-3xl sm:text-5xl font-mono font-black tracking-wider text-amber-300 drop-shadow-md">
              {animatingNumber}
            </div>
            <div className="text-[11px] text-indigo-300 flex items-center justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isDrawing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              {isDrawing ? 'Randomizing candidates across dataset...' : 'Algorithm Engine Idle & Ready'}
            </div>
          </div>

          {/* Winning Results (FR-4.4 Result Persistence) */}
          {drawnWinners.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Winner Master Table (D5) - Persisted Records ({drawnWinners.length})
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  D2 Status → 'Drawn'
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {drawnWinners.map((win, idx) => (
                  <div
                    key={win.Winner_ID}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="text-amber-300 font-bold block">{win.Prize}</span>
                      <span className="font-mono text-white text-xs">{win.Ticket_Number}</span>
                      <span className="text-[10px] text-slate-300 block">Winner: {win.User_Name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-300">
                        ${win.Prize_Amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {win.Winner_ID}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Previously Drawn Events History */}
      {pastDrawnEvents.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Completed Draws History (D5)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastDrawnEvents.map(evt => {
              const evtWinners = storageService.getWinners().filter(w => w.Event_ID === evt.Event_ID);
              return (
                <div key={evt.Event_ID} className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {evt.Event_ID}
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold">
                      Draw Completed
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{evt.Title}</h4>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-500">
                    <span>Winners Selected: <strong>{evtWinners.length}</strong></span>
                    <span>Total Prize Pool: <strong>${evt.Prize_Breakdown.reduce((s, p) => s + (p.amount * p.winnersCount), 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

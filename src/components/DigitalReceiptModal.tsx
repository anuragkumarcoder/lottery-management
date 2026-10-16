import React from 'react';
import { TicketRecord, TransactionRecord } from '../types/lottery';
import { CheckCircle2, Printer, X, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketRecord[];
  transaction?: TransactionRecord | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  tickets,
  transaction
}) => {
  if (!isOpen || tickets.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const firstTicket = tickets[0];
  const totalAmount = tickets.reduce((sum, t) => sum + t.Purchase_Price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Digital Purchase Receipt</h2>
          <p className="text-emerald-100 text-xs mt-1">Conforms to FR-3.5: Master Table D3 & D4 Confirmed</p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6 text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-200 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Transaction ID (D4)</span>
              <span className="font-mono font-semibold text-slate-800">{transaction?.Txn_ID || firstTicket.Txn_ID}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Date & Time</span>
              <span className="font-medium text-slate-800 text-xs">
                {new Date(firstTicket.PurchasedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Participant (D1)</span>
              <span className="font-semibold text-slate-800">{firstTicket.User_Name}</span>
              <span className="block text-xs font-mono text-slate-500">ID: {firstTicket.User_ID}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Payment Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Confirmed (Simulated)
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 uppercase font-semibold">Lottery Event (D2)</span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5">{firstTicket.Event_Title}</h3>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-2">
              <span>Event Code: <code className="text-indigo-600">{firstTicket.Event_ID}</code></span>
              <span>Unit Price: <strong>${firstTicket.Purchase_Price}</strong></span>
            </div>
          </div>

          {/* Assigned Serial Numbers (FR-3.5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <TicketIcon className="w-4 h-4 text-indigo-600" />
                Issued Tickets & Unique Serial Numbers ({tickets.length})
              </span>
              <span className="text-xs text-slate-500">Saved to D3 Ticket Master</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tickets.map((t, idx) => (
                <div
                  key={t.Ticket_ID}
                  className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-indigo-950 block">{t.Ticket_Number}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {t.Ticket_ID}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active & Eligible
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="font-semibold text-slate-800">Total Paid Amount:</span>
            <span className="text-2xl font-extrabold text-slate-900">${totalAmount.toLocaleString()}</span>
          </div>

          {/* Barcode Mock Visual */}
          <div className="text-center pt-2">
            <div className="inline-block tracking-[0.3em] font-mono text-xs text-slate-400 select-none">
              ||| | ||||| || ||| |||| || ||||| | ||| || ||||
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
              Secured Digital Proof of Purchase
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

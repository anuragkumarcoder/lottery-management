import React, { useState } from 'react';
import { WinnerRecord, ClaimStatus } from '../types/lottery';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Eye,
  ShieldCheck,
  AlertCircle,
  History,
  FileCheck
} from 'lucide-react';

export const AdminClaimsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [winners, setWinners] = useState<WinnerRecord[]>(() => storageService.getWinners());
  const [selectedWinner, setSelectedWinner] = useState<WinnerRecord | null>(null);
  const [inspectionDoc, setInspectionDoc] = useState<WinnerRecord | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const refreshWinners = () => {
    const list = storageService.getWinners();
    setWinners(list);
    if (selectedWinner) {
      setSelectedWinner(list.find(w => w.Winner_ID === selectedWinner.Winner_ID) || null);
    }
  };

  const handleUpdateStatus = (winnerId: string, status: ClaimStatus) => {
    if (!currentUser) return;
    setStatusMsg('');

    const res = storageService.updateClaimDecision(
      winnerId,
      status,
      currentUser.User_ID,
      currentUser.Name,
      decisionNote.trim() || `Administrative decision set to: ${status}`
    );

    if (res.success) {
      setStatusMsg(res.message);
      setDecisionNote('');
      refreshWinners();
    }
  };

  const pendingClaims = winners.filter(w => w.Claim_Status === 'Pending');
  const otherClaims = winners.filter(w => w.Claim_Status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Winner Claims & Verification Management (FR-5)
          </h2>
          <span className="text-xs font-mono bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">
            D5 Winner Master & FR-5.3
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect submitted identity verification documents, cross-reference tickets with D3/D5 records, and record audit decisions.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Grid: Claims List & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending and All Claims List */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Submitted Claims Awaiting Review (FR-5.3)
              </span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                {pendingClaims.length} Pending
              </span>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No pending claims submitted. When winners upload ID documents under FR-5.2, they appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingClaims.map(claim => (
                  <div
                    key={claim.Winner_ID}
                    onClick={() => setSelectedWinner(claim)}
                    className={`p-4 cursor-pointer transition flex justify-between items-center ${
                      selectedWinner?.Winner_ID === claim.Winner_ID
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {claim.Winner_ID}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                          Pending Review
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {claim.User_Name} ({claim.User_Email})
                      </h4>
                      <p className="text-xs text-slate-500">
                        {claim.Prize} • Ticket #{claim.Ticket_Number}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-base font-extrabold text-amber-600">
                        ${claim.Prize_Amount.toLocaleString()}
                      </span>
                      {claim.Identity_Doc && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> ID Attached
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Claims Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
              All Master Winner Records ({winners.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Winner ID</th>
                    <th className="px-4 py-2.5">Participant</th>
                    <th className="px-4 py-2.5">Prize / Amount</th>
                    <th className="px-4 py-2.5">Ticket #</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {winners.map(w => (
                    <tr
                      key={w.Winner_ID}
                      onClick={() => setSelectedWinner(w)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-700 font-semibold">{w.Winner_ID}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{w.User_Name}</td>
                      <td className="px-4 py-2.5 font-bold text-amber-600">${w.Prize_Amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">{w.Ticket_Number}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.Claim_Status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.Claim_Status === 'Paid Out'
                              ? 'bg-indigo-100 text-indigo-800'
                              : w.Claim_Status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : w.Claim_Status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.Claim_Status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedWinner(w);
                          }}
                          className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Inspection & Decision Console (FR-5.3 & FR-5.4) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verification & Audit Console (FR-5.3)
          </h3>

          {!selectedWinner ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Award className="w-10 h-10 mx-auto opacity-30" />
              <p>Select any winner record from the left table to inspect submitted ID proof and record decisions.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Winner Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedWinner.Winner_ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Participant:</span>
                  <span className="font-bold text-slate-900">{selectedWinner.User_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedWinner.User_Email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event:</span>
                  <span className="font-bold text-slate-800">{selectedWinner.Event_Title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ticket Serial:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedWinner.Ticket_Number}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">Prize:</span>
                  <span className="font-black text-amber-600 text-sm">
                    {selectedWinner.Prize} (${selectedWinner.Prize_Amount.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Current Claim Status:</span>
                  <span className="font-bold uppercase text-slate-800">{selectedWinner.Claim_Status}</span>
                </div>
              </div>

              {/* Uploaded Identity Document Inspection (FR-5.3) */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Identity Document File (FR-5.3)
                </span>

                {selectedWinner.Identity_Doc ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <div>
                          <span className="font-bold text-emerald-950 block text-[11px]">
                            {selectedWinner.Identity_Doc.fileName}
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            {selectedWinner.Identity_Doc.fileType} • {selectedWinner.Identity_Doc.fileSize}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectionDoc(selectedWinner)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded shadow-xs text-[11px] border border-emerald-300"
                      >
                        View Document
                      </button>
                    </div>

                    {selectedWinner.Identity_Doc.fileData.startsWith('data:image') && (
                      <img
                        src={selectedWinner.Identity_Doc.fileData}
                        alt="ID Document"
                        className="max-h-36 mx-auto rounded-lg border border-slate-300 shadow-xs cursor-pointer object-contain"
                        onClick={() => setInspectionDoc(selectedWinner)}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No identity document uploaded yet for this winner.</p>
                )}
              </div>

              {/* Admin Decision Input (FR-5.4) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Administrative Note (Logged for Audit)
                </label>
                <textarea
                  rows={2}
                  value={decisionNote}
                  onChange={e => setDecisionNote(e.target.value)}
                  placeholder="e.g. Identity verified against government records. Payout authorized."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedWinner.Winner_ID, 'Approved')}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Claim
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedWinner.Winner_ID, 'Rejected')}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Claim
                  </button>
                </div>

                <button
                  onClick={() => handleUpdateStatus(selectedWinner.Winner_ID, 'Paid Out')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm mt-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Mark as Paid Out (Final)
                </button>
              </div>

              {/* Audit Log Trail (FR-5.4) */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1 text-[11px]">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  FR-5.4 Audit Trail ({selectedWinner.Audit_Log.length} entries)
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedWinner.Audit_Log.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px]">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{log.action}</span>
                        <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{log.note || 'No extra note'}</p>
                      <span className="text-slate-400 text-[9px]">By: {log.adminName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identity Doc Fullscreen Modal */}
      {inspectionDoc && inspectionDoc.Identity_Doc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Document Inspection: {inspectionDoc.Identity_Doc.fileName}
                </h4>
                <p className="text-xs text-slate-500">
                  Uploaded by: {inspectionDoc.User_Name} for Winner Record {inspectionDoc.Winner_ID}
                </p>
              </div>
              <button
                onClick={() => setInspectionDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-4 bg-slate-100 rounded-xl">
              {inspectionDoc.Identity_Doc.fileData.startsWith('data:image') ? (
                <img
                  src={inspectionDoc.Identity_Doc.fileData}
                  alt="Verified Identity Document"
                  className="max-h-[50vh] rounded-lg shadow-md"
                />
              ) : (
                <div className="p-8 text-center text-slate-600">
                  <FileText className="w-16 h-16 mx-auto mb-2 text-indigo-600" />
                  <p className="font-bold text-sm">{inspectionDoc.Identity_Doc.fileName}</p>
                  <p className="text-xs text-slate-500">PDF / Binary Document</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectionDoc(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

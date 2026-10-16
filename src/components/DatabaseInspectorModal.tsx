import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Database, RefreshCw, X, Table, Code, RotateCcw, ShieldCheck } from 'lucide-react';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({
  isOpen,
  onClose,
  onDataReset
}) => {
  const [activeTab, setActiveTab] = useState<'D1' | 'D2' | 'D3' | 'D4' | 'D5'>('D1');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRefreshKey(prev => prev + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const users = storageService.getUsers();
  const events = storageService.getEvents();
  const tickets = storageService.getTickets();
  const txns = storageService.getTransactions();
  const winners = storageService.getWinners();

  const handleReset = () => {
    if (window.confirm('Reset all D1-D5 stores back to fresh default evaluation data?')) {
      storageService.initDatabase(true);
      setRefreshKey(prev => prev + 1);
      onDataReset();
    }
  };

  const getTableMeta = () => {
    switch (activeTab) {
      case 'D1':
        return {
          title: 'User Master Table (D1)',
          desc: 'Stores registered user profiles and credentials',
          schema: '{User_ID, Name, Email, Phone, Password_Hash, Status}',
          count: users.length,
          data: users
        };
      case 'D2':
        return {
          title: 'Lottery Event Master (D2)',
          desc: 'Holds event configurations and schedules',
          schema: '{Event_ID, Title, Price, Pool_Limit, Status}',
          count: events.length,
          data: events
        };
      case 'D3':
        return {
          title: 'Ticket Master Table (D3)',
          desc: 'Records purchased tickets and user ownership',
          schema: '{Ticket_ID, Event_ID, User_ID, Ticket_Number, Status}',
          count: tickets.length,
          data: tickets
        };
      case 'D4':
        return {
          title: 'Transaction Log (D4)',
          desc: 'Logs financial payment attempts and gateway statuses',
          schema: '{Txn_ID, User_ID, Amount, Status, Timestamp}',
          count: txns.length,
          data: txns
        };
      case 'D5':
        return {
          title: 'Winner Master Table (D5)',
          desc: 'Tracks draw results, winner mappings, and claim states',
          schema: '{Winner_ID, Event_ID, Ticket_ID, User_ID, Prize, Claim_Status}',
          count: winners.length,
          data: winners
        };
    }
  };

  const meta = getTableMeta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Live Data Stores Inspector (D1 – D5)</h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-mono px-2 py-0.5 rounded-full">
                  Data Dictionary Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect real-time state of all 5 persistence layers from the system specification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
              title="Reset all tables to initial evaluation seed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo DB
            </button>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex space-x-1 py-2">
            {(['D1', 'D2', 'D3', 'D4', 'D5'] as const).map(tab => {
              const label =
                tab === 'D1'
                  ? `D1 User Master (${users.length})`
                  : tab === 'D2'
                  ? `D2 Event Master (${events.length})`
                  : tab === 'D3'
                  ? `D3 Ticket Master (${tickets.length})`
                  : tab === 'D4'
                  ? `D4 Transaction Log (${txns.length})`
                  : `D5 Winner Master (${winners.length})`;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition ${
                viewMode === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition ${
                viewMode === 'json' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw JSON
            </button>
          </div>
        </div>

        {/* Table Schema Banner */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
          <div>
            <span className="font-bold text-slate-800">{meta.title}</span> —{' '}
            <span className="text-slate-500">{meta.desc}</span>
          </div>
          <div className="font-mono text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded border border-slate-300">
            Schema: {meta.schema}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          {viewMode === 'json' ? (
            <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto shadow-inner leading-relaxed">
              {JSON.stringify(meta.data, null, 2)}
            </pre>
          ) : meta.data.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <Database className="w-10 h-10 mx-auto mb-2 opacity-40" />
              No records currently present in this data store.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    {Object.keys(meta.data[0])
                      .filter(k => k !== 'fileData' && k !== 'Password_Hash' && k !== 'Audit_Log')
                      .map(key => (
                        <th key={key} className="px-4 py-3 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    {activeTab === 'D5' && <th className="px-4 py-3">Doc Uploaded</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meta.data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      {Object.keys(row)
                        .filter(k => k !== 'fileData' && k !== 'Password_Hash' && k !== 'Audit_Log')
                        .map(key => {
                          const val = row[key];
                          return (
                            <td key={key} className="px-4 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                              {typeof val === 'object' && val !== null ? (
                                <span className="font-mono text-[10px] text-slate-500">
                                  {Array.isArray(val) ? `[${val.length} items]` : '{Object}'}
                                </span>
                              ) : key.includes('Status') ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    val === 'Active' || val === 'Valid' || val === 'Approved' || val === 'Success'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : val === 'Closed' || val === 'Drawn' || val === 'Paid Out'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : val === 'Winner'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {String(val)}
                                </span>
                              ) : key.includes('Price') || key.includes('Amount') ? (
                                <span className="font-bold text-slate-900">${val}</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      {activeTab === 'D5' && (
                        <td className="px-4 py-2.5">
                          {row.Identity_Doc ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ {row.Identity_Doc.fileName}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">None</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All tables synchronized with localStorage browser engine.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

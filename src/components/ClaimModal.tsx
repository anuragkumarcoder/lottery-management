import React, { useState } from 'react';
import { WinnerRecord, IdentityDoc } from '../types/lottery';
import { storageService } from '../services/storage';
import { X, Upload, FileText, CheckCircle, AlertCircle, Award } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: WinnerRecord | null;
  onClaimSubmitted: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  winner,
  onClaimSubmitted
}) => {
  const [docType, setDocType] = useState('National ID / Aadhaar Card');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  if (!isOpen || !winner) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        return;
      }
      setFile(selected);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file || !filePreview) {
      setError('Please upload an identity verification document.');
      return;
    }

    setIsSubmitting(true);

    const identityDoc: IdentityDoc = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: docType,
      fileData: filePreview,
      uploadedAt: new Date().toISOString()
    };

    const res = storageService.submitClaim(winner.Winner_ID, identityDoc);

    setIsSubmitting(false);
    if (res.success) {
      onClaimSubmitted();
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              FR-5.2 Claim Submission
            </span>
          </div>
          <h2 className="text-2xl font-bold">Claim Your Lottery Prize</h2>
          <p className="text-white/80 text-xs mt-1">
            Submit your identity verification document to verify ownership and process payout.
          </p>
        </div>

        {/* Prize Overview */}
        <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex justify-between items-center text-sm">
          <div>
            <span className="text-xs text-slate-500 block">Winning Lottery Event</span>
            <span className="font-bold text-slate-800">{winner.Event_Title}</span>
            <span className="text-xs font-mono text-indigo-600 block mt-0.5">
              Ticket: {winner.Ticket_Number}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">{winner.Prize}</span>
            <span className="text-xl font-extrabold text-amber-600">
              ${winner.Prize_Amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Type
            </label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="National ID / Aadhaar Card">National ID / Aadhaar Card</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="Voter ID Card">Voter ID Card</option>
              <option value="Government Employee ID">Government Employee ID</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Identity Verification Document (Image / PDF)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition bg-slate-50/50">
              <div className="space-y-2 text-center">
                {filePreview ? (
                  <div className="space-y-2">
                    {filePreview.startsWith('data:image') ? (
                      <img
                        src={filePreview}
                        alt="Document Preview"
                        className="max-h-36 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                      />
                    ) : (
                      <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                        <FileText className="w-6 h-6" />
                        <span>{file?.name}</span>
                      </div>
                    )}
                    <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Ready to submit: {file?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-slate-400" />
                    <div className="text-xs text-slate-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer font-bold text-indigo-600 hover:text-indigo-500 underline"
                      >
                        <span>Click to browse</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*,application/pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>{' '}
                      or drag & drop
                    </div>
                    <p className="text-[11px] text-slate-400">PNG, JPG, or PDF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFilePreview('');
                }}
                className="mt-2 text-xs text-rose-500 hover:text-rose-700 underline block"
              >
                Remove selected file
              </button>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

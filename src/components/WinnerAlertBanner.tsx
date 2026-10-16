import React from 'react';
import { WinnerRecord } from '../types/lottery';
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerAlertBannerProps {
  unclaimedWinners: WinnerRecord[];
  onOpenClaim: (winner: WinnerRecord) => void;
}

export const WinnerAlertBanner: React.FC<WinnerAlertBannerProps> = ({ unclaimedWinners, onOpenClaim }) => {
  if (unclaimedWinners.length === 0) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 }
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-lg animate-pulse-slow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm animate-bounce">
              <Award className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <p className="font-bold text-base flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                CONGRATULATIONS! You have winning lottery tickets! (FR-5.1 Alert)
              </p>
              <p className="text-xs text-white/90">
                You won {unclaimedWinners.length} prize{unclaimedWinners.length > 1 ? 's' : ''}:{' '}
                {unclaimedWinners.map(w => `${w.Prize} ($${w.Prize_Amount.toLocaleString()}) on #${w.Ticket_Number}`).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerConfetti}
              className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition"
              title="Celebrate!"
            >
              🎉 Cheer
            </button>
            <button
              onClick={() => onOpenClaim(unclaimedWinners[0])}
              className="px-4 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-yellow-50 rounded-lg shadow-md transition flex items-center gap-1.5 transform hover:scale-105"
            >
              Submit Prize Claim (FR-5.2)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Trash2, Send, Mic } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (duration: number) => void;
  onCancel: () => void;
  id?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
  id,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id={id}
      className="flex items-center gap-4 w-full bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 rounded-xl border border-[#00a884]/30"
    >
      <button
        onClick={onCancel}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
        title="Cancelar grabación"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording indicator & timer */}
      <div className="flex items-center gap-2 flex-1">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-mono">
          {formatTime(seconds)}
        </span>

        {/* Dynamic visual waveform animation */}
        <div className="flex items-center gap-1 ml-4 h-6 flex-1 max-w-xs">
          {[40, 70, 30, 90, 60, 80, 50, 100, 30, 60, 40, 80, 90, 50, 30, 70].map((val, idx) => (
            <div
              key={idx}
              style={{ height: `${(val * (1 + (seconds % 3) * 0.2)) % 100}%` }}
              className="w-1 bg-[#00a884] rounded-full transition-all duration-300"
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onSendVoice(seconds || 5)}
        className="p-2.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full shadow-md transition-transform active:scale-95"
        title="Enviar nota de voz"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};

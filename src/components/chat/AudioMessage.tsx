import React, { useState, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface AudioMessageProps {
  url?: string;
  duration?: number;
  fromMe: boolean;
  senderAvatar?: string;
  id?: string;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({
  url,
  duration = 30,
  fromMe,
  senderAvatar,
  id,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // simulate progress playback
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 300 / playbackRate);
    }
  };

  const cycleSpeed = () => {
    if (playbackRate === 1) setPlaybackRate(1.5);
    else if (playbackRate === 1.5) setPlaybackRate(2);
    else setPlaybackRate(1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id={id} className="flex items-center gap-3 py-1.5 px-1 min-w-[240px]">
      {/* Sender Avatar Icon */}
      <div className="relative flex-shrink-0">
        <img
          src={senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
          alt="Audio Sender"
          className="w-10 h-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
          <Mic className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 ${
          fromMe ? 'bg-[#00a884]' : 'bg-[#00a884]'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform Visualization & Time */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* Fake visual audio bars */}
        <div className="flex items-center gap-0.5 h-6">
          {[40, 70, 30, 90, 60, 80, 50, 100, 30, 60, 40, 80, 90, 50, 30, 70, 40, 60, 30, 80].map((val, idx) => {
            const barProgress = (idx / 20) * 100;
            const isPlayed = barProgress <= progress;
            return (
              <div
                key={idx}
                style={{ height: `${val}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed
                    ? 'bg-[#00a884]'
                    : fromMe
                    ? 'bg-gray-400/50'
                    : 'bg-gray-400/40'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>{formatTime((duration * progress) / 100)}</span>
          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};

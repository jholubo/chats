import React from 'react';
import { Bot, Sparkles, UserCheck, ArrowRight, Check } from 'lucide-react';
import { CopilotSuggestion } from '../../types';

interface AICopilotBarProps {
  humanTakeover: boolean;
  aiCopilotEnabled: boolean;
  onToggleTakeover: () => void;
  suggestions: CopilotSuggestion[];
  onApplySuggestion: (text: string) => void;
}

export const AICopilotBar: React.FC<AICopilotBarProps> = ({
  humanTakeover,
  aiCopilotEnabled,
  onToggleTakeover,
  suggestions,
  onApplySuggestion,
}) => {
  return (
    <div className="bg-[#182229] border-b border-gray-800 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 text-xs z-10 shadow-sm">
      {/* Left: Takeover Status Banner */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            humanTakeover
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {humanTakeover ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              Intervención Humana Activa
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              IA Copilot respondiendo
            </>
          )}
        </div>

        <button
          onClick={onToggleTakeover}
          className="text-[11px] text-gray-300 hover:text-white underline font-medium"
        >
          {humanTakeover ? 'Devolver a IA Copilot' : 'Tomar Control Manual'}
        </button>
      </div>

      {/* Right: AI Quick Reply Suggestions */}
      {aiCopilotEnabled && suggestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto max-w-full custom-scrollbar py-0.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3" />
            Sugerencias Gemini:
          </span>

          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => onApplySuggestion(sug.text)}
              className="bg-[#202c33] hover:bg-[#28363f] border border-gray-700 hover:border-emerald-500 text-gray-200 text-[11px] px-3 py-1 rounded-xl flex items-center gap-2 transition-all flex-shrink-0 group max-w-xs truncate"
              title={sug.text}
            >
              <span className="truncate">{sug.text}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                {Math.round(sug.confidence * 100)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

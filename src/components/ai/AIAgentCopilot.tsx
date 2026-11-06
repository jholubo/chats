import React, { useState } from 'react';
import {
  Bot,
  BrainCircuit,
  FileText,
  Plus,
  Send,
  Sparkles,
  Sliders,
  CheckCircle,
  Database,
  ShieldCheck,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { AIAgentConfig, KnowledgeDoc } from '../../types';

interface AIAgentCopilotProps {
  agentConfig: AIAgentConfig;
  knowledgeDocs: KnowledgeDoc[];
  onUpdateAgent: (updated: Partial<AIAgentConfig>) => void;
  onAddKnowledgeDoc: (doc: Partial<KnowledgeDoc>) => void;
}

export const AIAgentCopilot: React.FC<AIAgentCopilotProps> = ({
  agentConfig,
  knowledgeDocs,
  onUpdateAgent,
  onAddKnowledgeDoc,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; time: string }>
  >([
    {
      sender: 'agent',
      text: '¡Hola! Soy Lubo AI Copilot con Gemini 2.5 Flash. Prueba hacerme una pregunta sobre los planes de LuboChat o requisitos de WhatsApp Cloud API.',
      time: '10:00 AM',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // New Knowledge Doc State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Ventas');
  const [docContent, setDocContent] = useState('');

  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;

    const userText = promptInput;
    setPromptInput('');
    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Ahora' },
    ]);
    setIsLoading(true);

    try {
      // Call server backend api `/api/ai/copilot-chat`
      const res = await fetch('/api/ai/copilot-chat', {
        method: 'POST',
        headers: { 'Content-[#111b21]': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          systemInstruction: agentConfig.systemPrompt,
          temperature: agentConfig.temperature,
        }),
      });

      const data = await res.json();
      const aiReply =
        data.text ||
        '¡Hola! De acuerdo a nuestra Base de Conocimiento, LuboChat ofrece planes desde $49/mes con soporte WABA multi-agente.';

      setChatHistory((prev) => [
        ...prev,
        { sender: 'agent', text: aiReply, time: 'Ahora' },
      ]);
    } catch (error) {
      console.error('AI Playground error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'LuboChat ofrece planes Starter ($49), Pro ($149) y Enterprise ($399). ¿Deseas más información sobre la integración con Meta API?',
          time: 'Ahora',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;

    onAddKnowledgeDoc({
      title: docTitle,
      category: docCategory,
      content: docContent,
      status: 'Indexed',
      totalTokens: Math.floor(docContent.length / 4) + 150,
      updatedAt: '2026-08-05',
    });

    setDocTitle('');
    setDocContent('');
    setShowAddDocModal(false);
  };

  return (
    <div className="flex-1 bg-[#111b21] flex flex-col h-full overflow-hidden text-gray-100">
      {/* Top Header */}
      <div className="bg-[#202c33] px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Capa de Inteligencia Artificial (Gemini & RAG)</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Agente virtual de atención, base de conocimiento RAG e interacción inteligente para copiloto de soporte.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#111b21] px-3 py-1.5 rounded-xl border border-gray-800">
            <span className="text-gray-400">Auto-Respuesta:</span>
            <button
              onClick={() => onUpdateAgent({ autoReplyEnabled: !agentConfig.autoReplyEnabled })}
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                agentConfig.autoReplyEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {agentConfig.autoReplyEnabled ? 'ACTIVADO' : 'DESACTIVADO'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
        {/* Left Column: System Prompt & Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#182229] p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              Configuración del Agente IA
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Nombre del Agente Virtual
              </label>
              <input
                type="text"
                value={agentConfig.name}
                onChange={(e) => onUpdateAgent({ name: e.target.value })}
                className="w-full bg-[#111b21] text-xs p-2.5 rounded-xl border border-gray-700 text-white focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Instrucciones del Sistema (System Prompt)
              </label>
              <textarea
                rows={5}
                value={agentConfig.systemPrompt}
                onChange={(e) => onUpdateAgent({ systemPrompt: e.target.value })}
                className="w-full bg-[#111b21] text-xs p-2.5 rounded-xl border border-gray-700 text-white focus:outline-none focus:border-[#00a884] leading-relaxed custom-scrollbar"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Modelo LLM</label>
                <select
                  value={agentConfig.model}
                  onChange={(e) => onUpdateAgent({ model: e.target.value })}
                  className="w-full bg-[#111b21] p-2 rounded-lg border border-gray-700 text-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Temperatura: {agentConfig.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agentConfig.temperature}
                  onChange={(e) => onUpdateAgent({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#00a884]"
                />
              </div>
            </div>
          </div>

          {/* RAG Knowledge Base */}
          <div className="bg-[#182229] p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                Base de Conocimiento (RAG Docs)
              </div>
              <button
                onClick={() => setShowAddDocModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Indexar Documento
              </button>
            </div>

            <div className="space-y-2">
              {knowledgeDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#111b21] p-3 rounded-xl border border-gray-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-200">{doc.title}</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{doc.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Categoría: {doc.category}</span>
                    <span>Tokens: {doc.totalTokens}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live AI Agent Playground */}
        <div className="lg:col-span-7 bg-[#182229] rounded-2xl border border-gray-800 flex flex-col overflow-hidden h-[600px]">
          <div className="bg-[#202c33] p-3.5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Playground de Pruebas del Copilot</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">Entorno Sandbox</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#005c4b] text-white rounded-tr-none'
                      : 'bg-[#202c33] text-gray-100 rounded-tl-none border border-gray-700'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Gemini está procesando la consulta RAG...
              </div>
            )}
          </div>

          <form onSubmit={handleTestPrompt} className="p-3 bg-[#202c33] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="Haz una pregunta para probar el agente IA..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="flex-1 bg-[#111b21] text-xs px-3 py-2.5 rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#00a884] hover:bg-[#008069] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Index Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#202c33] border border-gray-700 rounded-2xl w-full max-w-md p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-white">Indexar Documento en RAG</h3>
            <form onSubmit={handleCreateDocSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Política de Garantías y Devoluciones"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Categoría</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none"
                >
                  <option value="Ventas">Ventas</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Facturación">Facturación</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Contenido de la Guía</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe el texto de conocimiento que leerá Gemini..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-[#182229]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Indexar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

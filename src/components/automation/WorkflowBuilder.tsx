import React, { useState } from 'react';
import {
  Zap,
  Play,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Settings,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';
import { WorkflowRule } from '../../types';

interface WorkflowBuilderProps {
  workflows: WorkflowRule[];
  onToggleWorkflow: (id: string) => void;
  onAddWorkflow: (rule: Partial<WorkflowRule>) => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflows,
  onToggleWorkflow,
  onAddWorkflow,
}) => {
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New rule form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('Mensaje de WhatsApp Recibido');
  const [condition, setCondition] = useState('Contiene palabra clave "precio"');
  const [action, setAction] = useState('Responder con catálogo PDF + Etiquetar Lead');

  const handleRunSimulation = (wfName: string) => {
    setIsTesting(true);
    setTestOutput(`[WORKFLOW ENGINE] Iniciando ejecución de simulador: "${wfName}"...`);

    setTimeout(() => {
      setTestOutput((prev) => `${prev}\n⚡ Evento Inbound detectado via Meta Webhook ID: msg_${Date.now()}`);
    }, 400);

    setTimeout(() => {
      setTestOutput((prev) => `${prev}\n🔍 Evaluando condición de regla... [CUMPLE = TRUE]`);
    }, 800);

    setTimeout(() => {
      setTestOutput(
        (prev) => `${prev}\n✅ Acción ejecutada con éxito por Worker-01. Respuesta despachada en 140ms.`
      );
      setIsTesting(false);
    }, 1200);
  };

  const handleCreateWorkflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddWorkflow({
      name,
      description: description || 'Regla personalizada de automatización omnicanal.',
      trigger,
      triggerEvent: 'Inbound Event',
      condition,
      action,
      isActive: true,
      executionCount: 0,
      lastExecutedAt: 'Recién creada',
    });

    setName('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 bg-[#111b21] flex flex-col h-full overflow-hidden text-gray-100">
      {/* Header */}
      <div className="bg-[#202c33] px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Automation Engine & Workflows</h1>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-500/30">
              Trigger / Condition / Action
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Motor de reglas sin código para automatizar envíos en masa, respuestas inteligentes y enrutamiento.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva Automatización
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {/* Simulation Output Terminal if active */}
        {testOutput && (
          <div className="bg-[#0b141a] p-4 rounded-xl border border-gray-800 font-mono text-xs text-emerald-400 space-y-2 relative shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-gray-400">
              <span className="flex items-center gap-1.5 font-sans font-semibold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Simulador de Motor de Reglas en Tiempo Real
              </span>
              <button
                onClick={() => setTestOutput(null)}
                className="text-gray-500 hover:text-white text-[10px]"
              >
                Cerrar
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{testOutput}</pre>
          </div>
        )}

        {/* Workflows List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-[#182229] p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{wf.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{wf.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleWorkflow(wf.id)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {wf.isActive ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Flow Diagram Representation */}
                <div className="mt-4 bg-[#111b21] p-3 rounded-xl border border-gray-800 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      GATILLO
                    </span>
                    <span className="text-gray-200">{wf.trigger}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      CONDICIÓN
                    </span>
                    <span className="text-gray-200">{wf.condition}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      ACCIÓN
                    </span>
                    <span className="text-gray-200 font-medium">{wf.action}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Controls */}
              <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs text-gray-400">
                <div className="flex items-center gap-3 text-[11px]">
                  <span>Ejecuciones: <strong className="text-white">{wf.executionCount}</strong></span>
                  <span>Última: <strong className="text-gray-300">{wf.lastExecutedAt}</strong></span>
                </div>

                <button
                  disabled={isTesting}
                  onClick={() => handleRunSimulation(wf.name)}
                  className="bg-[#202c33] hover:bg-[#28363f] text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  Probar Regla
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#202c33] border border-gray-700 rounded-2xl w-full max-w-md p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-white">Crear Regla de Automatización</h3>
            <form onSubmit={handleCreateWorkflowSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Nombre de la Automatización</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Asignar Lead VIP por Palabra Clave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Breve explicación de la regla..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Gatillo (Trigger)</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                >
                  <option value="Mensaje Inbound Recibido">Mensaje Inbound Recibido</option>
                  <option value="Nuevo Lead Creado en CRM">Nuevo Lead Creado en CRM</option>
                  <option value="Etiqueta Asignada a Contacto">Etiqueta Asignada a Contacto</option>
                  <option value="Error en Cola de Mensajes">Error en Cola de Mensajes</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Condición</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Acción Automatizada</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-[#182229]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#00a884] hover:bg-[#008069] text-white font-bold px-4 py-2 rounded-xl"
                >
                  Activar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

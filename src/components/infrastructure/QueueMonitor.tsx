import React, { useState } from 'react';
import {
  Server,
  Activity,
  Database,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Terminal,
  Cpu,
  HardDrive,
  Layers,
} from 'lucide-react';
import { QueueStatus, WorkerLog } from '../../types';

interface QueueMonitorProps {
  queueStatus: QueueStatus;
  workerLogs: WorkerLog[];
  onRetryFailedJobs: () => void;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({
  queueStatus,
  workerLogs,
  onRetryFailedJobs,
}) => {
  const [activeTab, setActiveTab] = useState<'workers' | 'webhooks'>('workers');
  const [selectedLog, setSelectedLog] = useState<WorkerLog | null>(null);

  const mockWebhookPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '984019284019284',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+57 300 123 4567',
                phone_number_id: '109284712049182',
              },
              contacts: [
                {
                  profile: { name: 'María García' },
                  wa_id: '573129876543',
                },
              ],
              messages: [
                {
                  from: '573129876543',
                  id: 'wamid.HBgMNTczMTI5ODc2NTQzFQIAERgSQjgwMEEzOUE3MzBDRTY0QUQxAA==',
                  timestamp: '1785938400',
                  type: 'text',
                  text: {
                    body: '¿Nos puedes confirmar el webhook de Meta para las plantillas de mensaje?',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  return (
    <div className="flex-1 bg-[#111b21] flex flex-col h-full overflow-hidden text-gray-100">
      {/* Header */}
      <div className="bg-[#202c33] px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Infraestructura & Colas de Mensajes</h1>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/30 flex items-center gap-1 font-mono">
              <Database className="w-3.5 h-3.5" />
              Redis Queue Engine
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Monitoreo en tiempo real de Redis, Workers asíncronos y procesamiento masivo de webhooks de Meta API.
          </p>
        </div>

        <button
          onClick={onRetryFailedJobs}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar Envíos Fallidos
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {/* Metric Cards Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Estado Redis
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              {queueStatus.redisStatus}
            </div>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Trabajos Activos
            </span>
            <span className="text-lg font-bold text-white">{queueStatus.activeJobs}</span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              En Espera (Queue)
            </span>
            <span className="text-lg font-bold text-amber-400">{queueStatus.waitingJobs}</span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Fallidos
            </span>
            <span className="text-lg font-bold text-rose-400">{queueStatus.failedJobs}</span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Procesados (24h)
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {queueStatus.completedJobs24h.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Uso de Memoria
            </span>
            <span className="text-xs font-bold text-gray-200 font-mono">
              {queueStatus.memoryUsage}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'workers'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#182229] text-gray-400 hover:text-white'
            }`}
          >
            Logs de Workers Asíncronos
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'webhooks'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#182229] text-gray-400 hover:text-white'
            }`}
          >
            Inspector de Webhooks de Meta API
          </button>
        </div>

        {/* Workers Logs Table View */}
        {activeTab === 'workers' ? (
          <div className="bg-[#182229] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 bg-[#202c33] border-b border-gray-800 font-bold text-xs text-gray-200 flex items-center justify-between">
              <span>Bitácora de Ejecución de Tareas</span>
              <span className="text-[10px] text-gray-400 font-mono">3 Workers Activos</span>
            </div>

            <div className="divide-y divide-gray-800 text-xs">
              {workerLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 hover:bg-[#202c33] transition-colors flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'Success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{log.workerId}</span>
                        <span className="bg-[#111b21] text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-800">
                          {log.jobType}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{log.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-gray-400 font-mono text-[11px]">
                    <span>Latencia: <strong className="text-emerald-400">{log.durationMs}ms</strong></span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Webhooks Inspector View */
          <div className="bg-[#182229] p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Terminal className="w-4 h-4" />
                Meta Cloud API Inbound Webhook Payload (POST /api/whatsapp/webhook)
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded">
                HTTP 200 OK
              </span>
            </div>

            <pre className="bg-[#0b141a] p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto custom-scrollbar">
              {JSON.stringify(mockWebhookPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Users,
  DollarSign,
  CheckCircle2,
  PhoneCall,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { AnalyticsMetric, AgentPerformance } from '../../types';

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetric;
  agentPerformances: AgentPerformance[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  agentPerformances,
}) => {
  const chartData = [
    { hour: '08:00 AM', mensajes: 1200, tiempoRespuestaSec: 90 },
    { hour: '10:00 AM', mensajes: 3400, tiempoRespuestaSec: 45 },
    { hour: '12:00 PM', mensajes: 4800, tiempoRespuestaSec: 38 },
    { hour: '02:00 PM', mensajes: 2900, tiempoRespuestaSec: 50 },
    { hour: '04:00 PM', mensajes: 5100, tiempoRespuestaSec: 42 },
    { hour: '06:00 PM', mensajes: 3800, tiempoRespuestaSec: 60 },
  ];

  return (
    <div className="flex-1 bg-[#111b21] flex flex-col h-full overflow-hidden text-gray-100">
      {/* Header */}
      <div className="bg-[#202c33] px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Analíticas Omnicanal & Reportes</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
              Métricas WABA API
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Rendimiento del equipo de agentes, tiempo de respuesta promedio, tasa de conversión y CSAT.
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Mensajes Totales
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {metrics.totalMessages.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center font-bold">
                +14% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Tiempo Resp. Prom.
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-400">
                {metrics.avgResponseTimeMin} min
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Calificación CSAT
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-amber-400">
                {metrics.csatScore} / 5.0
              </span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Tasa de Conversión
            </span>
            <span className="text-lg font-bold text-purple-400">
              {metrics.conversionRate}%
            </span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Valor Pipeline CRM
            </span>
            <span className="text-lg font-bold text-emerald-400">
              ${metrics.totalPipelineValue.toLocaleString()} USD
            </span>
          </div>

          <div className="bg-[#182229] p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Entregabilidad WABA
            </span>
            <span className="text-lg font-bold text-blue-400">
              {metrics.wabaDeliveryRate}%
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Volume Over Time */}
          <div className="bg-[#182229] p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00a884]" />
              Volumen de Mensajes Inbound/Outbound
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a884" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00a884" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3942" />
                  <XAxis dataKey="hour" stroke="#8696a0" fontSize={11} />
                  <YAxis stroke="#8696a0" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#202c33', borderColor: '#3b4a54', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mensajes"
                    stroke="#00a884"
                    fillOpacity={1}
                    fill="url(#colorMsg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Speed Bar Chart */}
          <div className="bg-[#182229] p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Velocidad de Respuesta (Segundos)
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3942" />
                  <XAxis dataKey="hour" stroke="#8696a0" fontSize={11} />
                  <YAxis stroke="#8696a0" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#202c33', borderColor: '#3b4a54', color: '#fff' }}
                  />
                  <Bar dataKey="tiempoRespuestaSec" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Agent Performance Leaderboard Table */}
        <div className="bg-[#182229] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 bg-[#202c33] border-b border-gray-800 font-bold text-xs text-gray-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Rendimiento por Agente Humano
            </span>
            <span className="text-[10px] text-gray-400">Últimos 30 días</span>
          </div>

          <div className="divide-y divide-gray-800 text-xs">
            {agentPerformances.map((agent) => (
              <div
                key={agent.agentId}
                className="p-4 flex items-center justify-between hover:bg-[#202c33] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.agentName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white">{agent.agentName}</h4>
                    <span className="text-[10px] text-gray-400">ID: {agent.agentId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Asignados</span>
                    <span className="font-bold text-white">{agent.assignedChats}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Resueltos</span>
                    <span className="font-bold text-emerald-400">{agent.resolvedChats}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Resp. Prom.</span>
                    <span className="font-bold text-blue-400">{agent.avgResponseTimeSec}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Rating</span>
                    <span className="font-bold text-amber-400">★ {agent.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

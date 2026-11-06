import React from 'react';
import {
  MessageSquare,
  Kanban,
  Zap,
  Bot,
  Server,
  BarChart3,
  Building2,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { Organization, Workspace, Role } from '../../types';

export type SaasViewTab = 'chats' | 'crm' | 'automations' | 'ai_agent' | 'queue' | 'analytics';

interface SaaSNavigationRailProps {
  activeTab: SaasViewTab;
  onSelectTab: (tab: SaasViewTab) => void;
  organization: Organization;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  userRole: Role;
  unreadTotal: number;
}

export const SaaSNavigationRail: React.FC<SaaSNavigationRailProps> = ({
  activeTab,
  onSelectTab,
  organization,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  userRole,
  unreadTotal,
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const navItems = [
    {
      id: 'chats' as SaasViewTab,
      label: 'LuboChat',
      icon: MessageSquare,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    {
      id: 'crm' as SaasViewTab,
      label: 'CRM Kanban',
      icon: Kanban,
    },
    {
      id: 'automations' as SaasViewTab,
      label: 'Workflows',
      icon: Zap,
    },
    {
      id: 'ai_agent' as SaasViewTab,
      label: 'IA Copilot',
      icon: Bot,
    },
    {
      id: 'queue' as SaasViewTab,
      label: 'Infra & Colas',
      icon: Server,
    },
    {
      id: 'analytics' as SaasViewTab,
      label: 'Analíticas',
      icon: BarChart3,
    },
  ];

  return (
    <div className="w-16 md:w-20 bg-[#111b21] border-r border-gray-800 flex flex-col items-center py-3 justify-between z-30 select-none flex-shrink-0">
      {/* Top Organization Branding & Workspace Switcher */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            title={`${organization.name} - ${activeWs.name}`}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-[#008069] to-emerald-400 p-0.5 shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-[#111b21] rounded-[10px] flex items-center justify-center text-emerald-400 font-bold text-xs md:text-sm">
              LC
            </div>
          </button>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111b21] flex items-center justify-center text-[8px] text-white font-bold">
            ✓
          </span>

          {/* Workspace Dropdown Popup */}
          {showWorkspaceMenu && (
            <div className="absolute left-16 top-0 w-64 bg-[#202c33] border border-gray-700 rounded-xl shadow-2xl p-3 z-50 text-white text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <div>
                  <h4 className="font-semibold text-gray-100">{organization.name}</h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                    Plan {organization.plan}
                  </span>
                </div>
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                  Workspaces Activos
                </span>
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      ws.id === activeWorkspaceId
                        ? 'bg-[#00a884] text-white font-semibold'
                        : 'hover:bg-[#182229] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ws.color }}
                      />
                      <span className="text-xs">{ws.name}</span>
                    </div>
                    <span className="text-[10px] opacity-80">{ws.channel}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-700 text-[10px] text-gray-400 flex items-center justify-between">
                <span>Rol: <strong className="text-white">{userRole}</strong></span>
                <span className="text-emerald-400">Multi-tenant OK</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-2 w-full px-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#202c33] text-[#00a884] shadow-inner font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#182229]'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] mt-1 tracking-tight text-center truncate max-w-[60px]">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span className="absolute top-1 right-2 bg-[#00a884] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Workspace Badge */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: activeWs.color }}
          title={`Canal: ${activeWs.channel}`}
        />
        <span className="text-[9px] text-gray-500 font-mono">v2.5 SaaS</span>
      </div>
    </div>
  );
};

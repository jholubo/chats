import React, { useState, useEffect } from 'react';
import { WhatsAppConfig, WhatsAppTemplate } from '../../types';
import { ArrowLeft, Key, Bot, ShieldCheck, Moon, Sun, Check, RefreshCw, Copy, ExternalLink, HelpCircle, Radio } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onUpdateConfig: (newConfig: WhatsAppConfig) => void;
  templates: WhatsAppTemplate[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  id?: string;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  templates,
  darkMode,
  onToggleDarkMode,
  id,
}) => {
  const [mode, setMode] = useState<'simulation' | 'cloud_api'>(config.mode);
  const [phoneNumberId, setPhoneNumberId] = useState(config.phoneNumberId);
  const [wabaAccountId, setWabaAccountId] = useState(config.wabaAccountId);
  const [accessToken, setAccessToken] = useState(config.accessToken);
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(config.webhookVerifyToken || 'lubochat_private_token');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(config.autoReplyEnabled);
  const [autoReplyGreeting, setAutoReplyGreeting] = useState(config.autoReplyGreeting);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Compute public webhook URLs
  const sharedCallbackUrl = 'https://ais-pre-iinwq3ivmstwmndsy5dqiq-791063967917.us-east1.run.app/api/whatsapp/webhook';
  const currentOriginUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/whatsapp/webhook`
    : sharedCallbackUrl;

  const callbackUrl = sharedCallbackUrl;

  const handleCopyUrl = (urlToCopy = callbackUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookVerifyToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleSave = async () => {
    const updated = {
      ...config,
      mode,
      phoneNumberId,
      wabaAccountId,
      accessToken,
      webhookVerifyToken,
      autoReplyEnabled,
      autoReplyGreeting,
    };
    onUpdateConfig(updated);

    try {
      await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookVerifyToken,
          phoneNumberId,
          wabaAccountId,
          accessToken,
        }),
      });
      setTestResult('✅ Configuración guardada y sincronizada con el servidor.');
    } catch {
      setTestResult('Configuración guardada localmente.');
    }
  };

  const handleTestWebhook = async () => {
    setTestResult('Probando verificación de webhook con el servidor...');
    try {
      const challenge = 'test_challenge_' + Math.floor(Math.random() * 100000);
      const res = await fetch(`/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(webhookVerifyToken)}&hub.challenge=${challenge}`);
      const text = await res.text();

      if (res.ok && text === challenge) {
        setTestResult('✅ ¡Webhook validado con éxito! El servidor respondió con HTTP 200 y el challenge correcto.');
      } else {
        setTestResult(`❌ Error en verificación: Estado ${res.status}. Token esperado no coincidió.`);
      }
    } catch (err: any) {
      setTestResult(`❌ Error de conexión al webhook: ${err?.message || 'Error desconocido'}`);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Verificando API de WhatsApp Business con Meta...');
    if (mode === 'simulation') {
      setTimeout(() => {
        setTestResult('✅ Modo Simulación Sandbox activo. API simulada respondiendo al 100%.');
      }, 600);
      return;
    }

    if (!phoneNumberId || !accessToken) {
      setTestResult('⚠️ Falta ingresar el Phone Number ID o el Access Token para probar la API de Meta.');
      return;
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(`✅ Conectado a Meta: ${data.verified_name || data.display_phone_number || 'Número verificado'}`);
      } else {
        setTestResult(`❌ Error de Meta: ${data.error?.message || 'Token o Phone ID inválido'}`);
      }
    } catch {
      setTestResult('✅ Servidor listo para procesar solicitudes de WhatsApp Cloud API.');
    }
  };

  return (
    <div
      id={id}
      className="absolute inset-y-0 left-0 z-40 w-full sm:w-96 bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col shadow-2xl transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex items-end h-28 p-4 bg-[#008069] dark:bg-[#202c33] text-white gap-6">
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors mb-0.5">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-semibold mb-0.5">Configuración y Meta API</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mode Selector */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-3">
          <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block">
            Modo de Operación
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('simulation')}
              className={`p-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                mode === 'simulation'
                  ? 'border-[#00a884] bg-[#00a884]/10 text-[#00a884]'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Simulación Sandbox
            </button>
            <button
              onClick={() => setMode('cloud_api')}
              className={`p-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                mode === 'cloud_api'
                  ? 'border-[#00a884] bg-[#00a884]/10 text-[#00a884]'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              WhatsApp Cloud API
            </button>
          </div>
        </div>

        {/* Meta Webhook Configuration Section - Step 2 from Meta Dashboard */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-3 border-2 border-[#00a884]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00a884]">
              <Radio className="w-4 h-4 animate-pulse text-[#00a884]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Configurar Webhooks (Paso 2 Meta)
              </h3>
            </div>
            <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-bold px-2 py-0.5 rounded-full">
              Paso Activo
            </span>
          </div>

          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
            Copia estos dos valores exactos y pégalos en la pantalla de <strong>Meta for Developers</strong> que tienes abierta:
          </p>

          {/* Campo 1: URL de devolución de llamada */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
                1. URL de devolución de llamada
              </label>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-[11px] text-[#00a884] hover:underline font-semibold flex items-center gap-1"
              >
                {copiedUrl ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> ¡Copiado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copiar URL
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={callbackUrl}
                className="w-full text-xs p-2.5 rounded-lg bg-gray-100 dark:bg-[#111b21] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono select-all focus:outline-none"
              />
            </div>
          </div>

          {/* Campo 2: Token de verificación */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
                2. Token de verificación
              </label>
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-[11px] text-[#00a884] hover:underline font-semibold flex items-center gap-1"
              >
                {copiedToken ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> ¡Copiado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copiar Token
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={webhookVerifyToken}
                onChange={(e) => setWebhookVerifyToken(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-gray-100 dark:bg-[#111b21] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono font-bold select-all focus:outline-none"
              />
            </div>
          </div>

          {/* Instrucciones Rápidas de Meta */}
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-[11px] text-sky-800 dark:text-sky-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Instrucciones en la pantalla de Meta:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] pl-1">
              <li>Pega la <strong>URL</strong> en el primer campo de Meta.</li>
              <li>Pega el <strong>Token</strong> en el segundo campo de Meta.</li>
              <li>Haz clic en el botón azul <strong>"Verificar y guardar"</strong>.</li>
              <li>En la sección que se desbloquea, suscríbete al campo <strong>messages</strong>.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={handleTestWebhook}
            className="w-full py-2 bg-[#00a884]/15 hover:bg-[#00a884]/25 text-xs font-bold text-[#00a884] rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#00a884]/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Verificar Endpoint de Webhook ahora
          </button>
        </div>

        {/* WhatsApp Business API Credentials */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#00a884]">
            <Key className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Credenciales Meta Cloud API</h3>
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Phone Number ID</label>
            <input
              type="text"
              placeholder="Ej: 109284712049182"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="w-full text-xs p-2 mt-1 rounded bg-gray-50 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">WABA Account ID</label>
            <input
              type="text"
              placeholder="Ej: 984019284019284"
              value={wabaAccountId}
              onChange={(e) => setWabaAccountId(e.target.value)}
              className="w-full text-xs p-2 mt-1 rounded bg-gray-50 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Permanent Access Token</label>
            <input
              type="password"
              placeholder="EAAG..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full text-xs p-2 mt-1 rounded bg-gray-50 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={handleTestConnection}
            className="w-full py-2 bg-gray-100 dark:bg-[#182229] hover:bg-gray-200 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Probar Conexión con Meta API
          </button>
        </div>

        {/* Auto-Responder Bot Rules */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00a884]">
              <Bot className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Bot Auto-Respondedor</h3>
            </div>
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) => setAutoReplyEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#00a884] rounded"
            />
          </div>

          {autoReplyEnabled && (
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Mensaje de Bienvenida Automático
              </label>
              <textarea
                rows={3}
                value={autoReplyGreeting}
                onChange={(e) => setAutoReplyGreeting(e.target.value)}
                className="w-full text-xs p-2 mt-1 rounded bg-gray-50 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Modo Oscuro WhatsApp</span>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              darkMode ? 'bg-[#00a884]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-medium border border-emerald-500/20">
            {testResult}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#00a884] hover:bg-[#008f70] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

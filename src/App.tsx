import React, { useRef, useEffect } from 'react';
import { useChatEngine } from './hooks/useChatEngine';
import { EnterpriseTopBar } from './components/enterprise/EnterpriseTopBar';
import { SidebarHeader } from './components/navigation/SidebarHeader';
import { ChatList } from './components/chat/ChatList';
import { ChatHeader } from './components/chat/ChatHeader';
import { MessageBubble } from './components/chat/MessageBubble';
import { MessageInput } from './components/chat/MessageInput';

import { ProfileDrawer } from './components/drawers/ProfileDrawer';
import { SettingsDrawer } from './components/drawers/SettingsDrawer';
import { StatusDrawer } from './components/drawers/StatusDrawer';
import { NewChatDrawer } from './components/drawers/NewChatDrawer';
import { ChatInfoDrawer } from './components/drawers/ChatInfoDrawer';
import { DistributionDrawer } from './components/drawers/DistributionDrawer';
import { ContactsDrawer } from './components/drawers/ContactsDrawer';
import { TransferModal } from './components/modals/TransferModal';
import { CloseChatModal } from './components/modals/CloseChatModal';
import { QuickResponsesModal } from './components/modals/QuickResponsesModal';

import { Lock, Laptop, MessageSquare, Sparkles } from 'lucide-react';

export default function App() {
  const {
    // Sellers & Roles
    sellers,
    activeSellerId,
    setActiveSellerId,
    activeSeller,
    distributionConfig,
    setDistributionConfig,

    // Filter
    activeFilter,
    setActiveFilter,
    filteredConversations,
    unreadNewCount,
    unassignedCount,
    closedCount,
    myChatsCount,

    // Quick Responses
    quickResponses,
    handleAddQuickResponse,
    handleDeleteQuickResponse,

    // CRM & Team Collaboration Actions
    handleTransferChat,
    handleCloseChat,
    handleChangeCrmStage,
    handleAddReminder,
    handleCompleteReminder,

    // Contacts
    contacts,
    handleAddContactNote,
    handleSaveContact,

    // Real-time Presence & Lock
    handleUserTyping,
    handleLockChat,
    handleUnlockChat,
    handleAdminTakeover,
    handleChangeConversationStatus,

    // WhatsApp Core
    activeChatId,
    activeConversation,
    activeMessages,
    userProfile,
    waConfig,
    templates,
    stories,
    darkMode,
    replyingToMessage,

    // Drawers & Modals
    drawerProfileOpen,
    drawerSettingsOpen,
    drawerStatusOpen,
    drawerNewChatOpen,
    drawerInfoOpen,
    modalDistributionOpen,
    drawerContactsOpen,

    setDrawerProfileOpen,
    setDrawerSettingsOpen,
    setDrawerStatusOpen,
    setDrawerNewChatOpen,
    setDrawerInfoOpen,
    setModalDistributionOpen,
    setDrawerContactsOpen,
    setReplyingToMessage,

    setUserProfile,
    setWaConfig,
    setDarkMode,

    // Actions
    handleSendMessage,
    handleSelectChat,
    handleReassignChat,
    handleSimulateInboundChat,
    handleTogglePin,
    handleToggleMute,
    handleMarkUnread,
    handleDeleteChat,
    handleStartNewChat,
  } = useChatEngine();

  const [transferModalOpen, setTransferModalOpen] = React.useState(false);
  const [closeChatModalOpen, setCloseChatModalOpen] = React.useState(false);
  const [modalQuickResponsesOpen, setModalQuickResponsesOpen] = React.useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const isLockedByOther =
    activeConversation &&
    activeConversation.lockedBySellerId &&
    activeConversation.lockedBySellerId !== activeSeller.id;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c1317] flex flex-col items-center justify-center font-sans antialiased select-none">
      {/* Outer Main Enterprise Window */}
      <div className="relative w-full h-full xl:max-w-[1700px] xl:max-h-[97vh] xl:my-auto bg-[#111b21] xl:rounded-2xl xl:shadow-2xl overflow-hidden flex flex-col border border-gray-800">
        
        {/* MAIN WHATSAPP WEB INTERFACE */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          
          {/* LEFT SIDEBAR (WhatsApp Conversations List) */}
          <div
            className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col h-full border-r border-gray-800 ${
              activeChatId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <SidebarHeader
              user={userProfile}
              activeSeller={activeSeller}
              sellers={sellers}
              onSelectRoleSeller={(sellerId) => setActiveSellerId(sellerId)}
              onOpenDistributionModal={() => setModalDistributionOpen(true)}
              onOpenContactsDrawer={() => setDrawerContactsOpen(true)}
              onOpenQuickResponsesModal={() => setModalQuickResponsesOpen(true)}
              onSimulateInboundChat={handleSimulateInboundChat}
              onOpenProfile={() => setDrawerProfileOpen(true)}
              onOpenStatus={() => setDrawerStatusOpen(true)}
              onOpenNewChat={() => setDrawerNewChatOpen(true)}
              onOpenSettings={() => setDrawerSettingsOpen(true)}
              wabaMode={waConfig.mode}
            />

            <div className="flex-1 overflow-hidden relative">
              <ChatList
                conversations={filteredConversations}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onTogglePin={handleTogglePin}
                onToggleMute={handleToggleMute}
                onMarkUnread={handleMarkUnread}
                onDeleteChat={handleDeleteChat}
                onOpenNewChat={() => setDrawerNewChatOpen(true)}
                activeFilterTab={activeFilter}
                onSelectFilterTab={(tab) => setActiveFilter(tab)}
                unreadNewCount={unreadNewCount}
                unassignedCount={unassignedCount}
                myChatsCount={myChatsCount}
                closedCount={closedCount}
                onTransferChat={(chatId) => {
                  const targetSeller = sellers.find((s) => s.id !== activeSeller.id) || sellers[0];
                  if (targetSeller) handleTransferChat(chatId, targetSeller.id);
                }}
              />

              {/* Drawers */}
              <ProfileDrawer
                isOpen={drawerProfileOpen}
                onClose={() => setDrawerProfileOpen(false)}
                user={userProfile}
                onUpdateUser={(updated) => setUserProfile({ ...userProfile, ...updated })}
              />

              <SettingsDrawer
                isOpen={drawerSettingsOpen}
                onClose={() => setDrawerSettingsOpen(false)}
                config={waConfig}
                onUpdateConfig={(cfg) => setWaConfig(cfg)}
                templates={templates}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
              />

              <StatusDrawer
                isOpen={drawerStatusOpen}
                onClose={() => setDrawerStatusOpen(false)}
                stories={stories}
              />

              <NewChatDrawer
                isOpen={drawerNewChatOpen}
                onClose={() => setDrawerNewChatOpen(false)}
                conversations={filteredConversations}
                onSelectContact={handleStartNewChat}
              />
            </div>
          </div>

          {/* RIGHT MAIN CHAT WINDOW */}
          <div
            className={`flex-1 flex flex-col h-full bg-[#0b141a] relative ${
              !activeChatId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <div className="flex flex-col h-full w-full relative">
                {/* Chat Header */}
                <ChatHeader
                  conversation={activeConversation}
                  activeSeller={activeSeller}
                  sellers={sellers}
                  onReassignSeller={(sellerId) => handleReassignChat(activeConversation.id, sellerId)}
                  onAdminTakeover={() => handleAdminTakeover(activeConversation.id)}
                  onChangeStatus={(status) => handleChangeConversationStatus(activeConversation.id, status)}
                  onLockChat={() => handleLockChat(activeConversation.id)}
                  onUnlockChat={() => handleUnlockChat(activeConversation.id)}
                  onToggleInfoDrawer={() => setDrawerInfoOpen(!drawerInfoOpen)}
                  onSearchInChat={() => alert('Búsqueda activa en el historial de mensajes')}
                  onOpenTransferModal={() => setTransferModalOpen(true)}
                  onOpenCloseModal={() => setCloseChatModalOpen(true)}
                />

                {/* Auto-Claiming Notification Banner */}
                {(activeConversation.isNewChat || activeConversation.labels.includes('CHAT NUEVO')) && (
                  <div className="bg-amber-950/80 border-b border-amber-700/60 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                      <span>
                        <strong className="text-amber-300">Chat Nuevo Entrante:</strong> Al responder este chat, se asignará automáticamente a tu usuario (<strong>{activeSeller.name}</strong>).
                      </span>
                    </div>
                  </div>
                )}

                {/* Chat Wallpaper Background Overlay */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative bg-repeat bg-center custom-scrollbar"
                  style={{
                    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                    backgroundSize: '400px',
                    opacity: 0.95,
                  }}
                >
                  {/* End-to-end Encryption Banner */}
                  <div className="flex items-center justify-center my-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-[#182229]/90 text-amber-200/90 text-[11px] font-medium rounded-lg shadow-sm max-w-md text-center border border-amber-300/20">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span>
                        Mensajes cifrados empresarialmente en el WhatsApp único de la empresa (+57 300 123 4567).
                      </span>
                    </div>
                  </div>

                  {/* Messages List */}
                  {activeMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onReply={(m) => setReplyingToMessage(m)}
                      onStar={(id) => alert(`Mensaje ${id} destacado`)}
                      onReact={(id, emoji) => alert(`Reaccionado con ${emoji}`)}
                    />
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  replyingToMessage={replyingToMessage}
                  onCancelReply={() => setReplyingToMessage(null)}
                  onUserTyping={handleUserTyping}
                  isLockedByOther={Boolean(isLockedByOther)}
                  lockedBySellerName={activeConversation.lockedBySellerName}
                  quickResponses={quickResponses}
                  onAddQuickResponse={handleAddQuickResponse}
                  onDeleteQuickResponse={handleDeleteQuickResponse}
                  contactName={activeConversation.contact.name}
                  sellerName={activeSeller.name}
                />
              </div>
            ) : (
              /* EMPTY CHAT SELECTION SCREEN */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#222e35] select-none">
                <div className="relative mb-6 p-8 bg-emerald-500/10 rounded-full text-[#00a884]">
                  <Laptop className="w-20 h-20" />
                  <div className="absolute top-2 right-2 p-2 bg-[#00a884] text-white rounded-full shadow-lg animate-pulse">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                <h1 className="text-2xl font-light text-gray-100 mb-2">
                  LuboChat Enterprise — Herramienta Privada de WhatsApp
                </h1>
                <p className="text-xs text-gray-400 max-w-lg leading-relaxed mb-8">
                  Plataforma interna para la gestión de vendedores y atención al cliente sobre un único número oficial de WhatsApp, con asignación inteligente por porcentajes y cuotas.
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-700 pt-6">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Infraestructura Privada Empresarial & Sincronización WhatsApp Web</span>
                </div>
              </div>
            )}

            {/* Right Contact Info Drawer */}
            {activeConversation && drawerInfoOpen && (
              <div className="absolute inset-y-0 right-0 z-30">
                <ChatInfoDrawer
                  isOpen={drawerInfoOpen}
                  onClose={() => setDrawerInfoOpen(false)}
                  conversation={activeConversation}
                  sellers={sellers}
                  onChangeCrmStage={handleChangeCrmStage}
                  onTransferChat={handleTransferChat}
                  onAddReminder={handleAddReminder}
                  onCompleteReminder={handleCompleteReminder}
                  onAddContactNote={handleAddContactNote}
                />
              </div>
            )}
          </div>

        </div>

        {/* 3. ENTERPRISE DISTRIBUTION DRAWER (ADMIN) */}
        <DistributionDrawer
          isOpen={modalDistributionOpen}
          onClose={() => setModalDistributionOpen(false)}
          config={distributionConfig}
          onSaveConfig={(newConfig) => setDistributionConfig(newConfig)}
          onSimulateInbound={handleSimulateInboundChat}
        />

        {/* 4. CONTACTS & NOTES DRAWER */}
        <ContactsDrawer
          isOpen={drawerContactsOpen}
          onClose={() => setDrawerContactsOpen(false)}
          contacts={contacts}
          sellers={sellers}
          onSaveContact={handleSaveContact}
          onAddContactNote={handleAddContactNote}
          onOpenChat={(phoneOrId) => handleStartNewChat(contacts.find(c => c.id === phoneOrId || c.phoneNumber === phoneOrId) || contacts[0])}
        />

        {/* 5. TRANSFER CHAT MODAL */}
        {activeConversation && (
          <TransferModal
            isOpen={transferModalOpen}
            onClose={() => setTransferModalOpen(false)}
            chatId={activeConversation.id}
            contactName={activeConversation.contact.name}
            currentSellerName={activeConversation.assignedSellerName}
            sellers={sellers.filter((s) => s.id !== activeSeller.id)}
            onConfirmTransfer={handleTransferChat}
          />
        )}

        {/* 6. CLOSE CHAT MODAL */}
        {activeConversation && (
          <CloseChatModal
            isOpen={closeChatModalOpen}
            onClose={() => setCloseChatModalOpen(false)}
            chatId={activeConversation.id}
            contactName={activeConversation.contact.name}
            onConfirmClose={handleCloseChat}
          />
        )}

        {/* 7. QUICK RESPONSES MODAL */}
        <QuickResponsesModal
          isOpen={modalQuickResponsesOpen}
          onClose={() => setModalQuickResponsesOpen(false)}
          quickResponses={quickResponses}
          onAddQuickResponse={handleAddQuickResponse}
          onDeleteQuickResponse={handleDeleteQuickResponse}
        />

      </div>
    </div>
  );
}

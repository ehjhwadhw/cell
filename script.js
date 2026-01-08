// ============================================
// CELULAR 2 - Versão Standalone Completa
// Idêntico ao React - Funciona no navegador
// ============================================

// Estado Global
const state = {
    isLocked: true,
    isScanning: false,
    currentApp: null,
    currentScreen: null,
    
    // Configurações
    wallpaper: 'assets/wallpaper-default.png',
    scale: 50,
    
    // Saldos
    nubankBalance: 25000,
    doubleBalance: 1000,
    balanceVisible: true,
    
    // Dados WhatsApp
    myPhone: '999999',
    myAvatar: '',
    contacts: [
        { id: '100001', name: 'João Silva', phone: '100001', avatar: '', lastMessage: 'Beleza, te vejo amanhã!', time: '10:42', timestamp: Date.now() - 3600000, unread: 2, online: true, isGroup: false },
        { id: '100002', name: 'Maria Santos', phone: '100002', avatar: '', lastMessage: 'Ok, obrigada! 😊', time: '09:15', timestamp: Date.now() - 7200000, unread: 0, online: false, isGroup: false },
        { id: '100004', name: 'Carlos Oliveira', phone: '100004', avatar: '', lastMessage: 'Valeu parceiro!', time: 'Ontem', timestamp: Date.now() - 90000000, unread: 0, online: true, isGroup: false }
    ],
    
    groups: [],
    
    conversations: {
        '100001': [
            { text: 'E aí mano, tudo bem?', sent: false, time: '10:30', type: 'text' },
            { text: 'Tudo certo! E você?', sent: true, time: '10:32', type: 'text' },
            { text: 'De boa também, vamos sair hoje?', sent: false, time: '10:35', type: 'text' },
            { text: 'Bora! Que horas?', sent: true, time: '10:38', type: 'text' },
            { text: 'Beleza, te vejo amanhã!', sent: false, time: '10:42', type: 'text' }
        ],
        '100002': [
            { text: 'Oi Maria!', sent: true, time: '09:00', type: 'text' },
            { text: 'Oi! Tudo bem?', sent: false, time: '09:05', type: 'text' },
            { text: 'Tudo sim! Já mandei o arquivo', sent: true, time: '09:10', type: 'text' },
            { text: 'Ok, obrigada! 😊', sent: false, time: '09:15', type: 'text' }
        ]
    },
    
    // Dados OLX
    olxListings: [
        { id: '1', title: 'Honda Civic 2020', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400', category: 'carros', playerId: '100001' },
        { id: '2', title: 'Yamaha MT-07', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', category: 'motos', playerId: '100002' },
        { id: '3', title: 'Casa 3 Quartos', price: 350000, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400', category: 'casas', playerId: '100003' }
    ],
    
    // Transações Nubank
    transactions: [
        { id: '1', senderName: 'Carlos_Oliveira', value: 5000, time: '14:32' },
        { id: '2', senderName: 'Maria_Santos', value: 1500, time: '12:15' },
        { id: '3', senderName: 'João_Silva', value: 3200, time: '09:45' },
        { id: '4', senderName: 'Ana_Paula', value: 800, time: 'Ontem' },
        { id: '5', senderName: 'Pedro_Lima', value: 10000, time: 'Ontem' }
    ],
    
    doubleHistory: [],
    
    wallpapers: [
        { name: 'Padrão', file: 'assets/wallpaper-default.png' },
        { name: 'Ferrari', file: 'assets/wallpaper-ferrari.png' },
        { name: 'McLaren', file: 'assets/wallpaper-mclaren.png' },
        { name: 'Porsche', file: 'assets/wallpaper-porsche.png' },
        { name: 'Money', file: 'assets/wallpaper-money.png' },
        { name: 'Retrowave', file: 'assets/wallpaper-retrowave.png' },
        { name: 'Statue', file: 'assets/wallpaper-statue.png' }
    ],
    
    // Audio recording
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    recordingStartTime: null,
    
    // Call state
    callAudio: null,
    callDuration: 0,
    callInterval: null
};

// Elementos DOM
let elements = {};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    elements = {
        phoneContainer: document.getElementById('phoneContainer'),
        screenContent: document.getElementById('screenContent'),
        lockScreen: document.getElementById('lockScreen'),
        homeScreen: document.getElementById('homeScreen'),
        appContainer: document.getElementById('appContainer'),
        fingerprintBtn: document.getElementById('fingerprintBtn'),
        fingerprintText: document.getElementById('fingerprintText'),
        lockTime: document.getElementById('lockTime'),
        lockDate: document.getElementById('lockDate'),
        homeTime: document.getElementById('homeTime'),
        homeIndicator: document.getElementById('homeIndicator')
    };

    updateClock();
    setInterval(updateClock, 1000);
    applyWallpaper();
    applyInitialScale();
    
    elements.fingerprintBtn.addEventListener('click', handleUnlock);
    
    // Close button click - triggers CEF event to close browser
    document.getElementById('closePhoneBtn').addEventListener('click', closePhone);
    
    // Celular começa oculto - espera evento 'celularShow' do servidor
    elements.phoneContainer.style.display = 'none';
    
    // Home indicator click - close phone when on home screen
    elements.homeIndicator.addEventListener('click', handleHomeIndicatorClick);

    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const app = icon.dataset.app;
            if (app) openApp(app);
        });
    });

    // Registrar evento CEF para mostrar o celular
    if (typeof Cef !== 'undefined' && Cef.registerEventCallback) {
        Cef.registerEventCallback('celularShow', function() {
            openPhoneWithCommand();
        });
    }

    console.log('[Celular2] Inicializado (aguardando comando /celular)');
});

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function updateClock() {
    const time = formatTime();
    const date = formatDate();
    if (elements.lockTime) elements.lockTime.textContent = time;
    if (elements.lockDate) elements.lockDate.textContent = date;
    if (elements.homeTime) elements.homeTime.textContent = time;
}

function applyWallpaper() {
    if (elements.screenContent) {
        elements.screenContent.style.backgroundImage = `url('${state.wallpaper}')`;
    }
}

function applyInitialScale() {
    const scaleValue = state.scale / 100;
    if (elements.phoneContainer) {
        elements.phoneContainer.style.transform = `scale(${scaleValue})`;
        elements.phoneContainer.style.transformOrigin = 'center center';
    }
}

function handleHomeIndicatorClick() {
    // Only close phone if on home screen (no app open and not locked)
    if (!state.isLocked && !state.currentApp) {
        closePhone();
    }
}

function closePhone() {
    // Disparar evento CEF IMEDIATAMENTE para liberar o foco do jogo
    if (typeof Cef !== 'undefined') {
        if (Cef.trigger) Cef.trigger('celularClose');
        else if (Cef.emit) Cef.emit('celularClose');
        else if (Cef.call) Cef.call('celularClose');
    }
    
    elements.phoneContainer.classList.remove('visible');
    elements.phoneContainer.classList.add('closing');
    
    setTimeout(() => {
        elements.phoneContainer.classList.remove('closing');
        elements.phoneContainer.style.display = 'none';
        document.body.style.background = 'transparent';
        // Reset to lock screen for next open
        state.isLocked = true;
        elements.lockScreen.classList.remove('hidden');
        elements.homeScreen.classList.add('hidden');
    }, 500);
    
    console.log('[Celular2] Celular fechado');
}

function openPhone() {
    elements.phoneContainer.classList.remove('closing');
    elements.phoneContainer.classList.add('visible');
}

function openPhoneWithCommand() {
    elements.phoneContainer.style.display = 'block';
    document.body.style.background = 'transparent';
    
    setTimeout(() => {
        elements.phoneContainer.classList.add('visible');
    }, 50);
    
    console.log('[Celular2] Celular aberto via comando');
}

function getInitials(name) {
    const parts = name.replace('_', ' ').split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function generateGroupId() {
    return 'group_' + Date.now();
}

// ============================================
// DESBLOQUEIO
// ============================================

function handleUnlock() {
    if (!state.isLocked || state.isScanning) return;

    state.isScanning = true;
    elements.fingerprintBtn.classList.add('scanning');
    elements.fingerprintText.textContent = 'Escaneando...';

    setTimeout(() => {
        elements.fingerprintBtn.classList.remove('scanning');
        elements.fingerprintBtn.classList.add('complete');

        setTimeout(() => {
            state.isLocked = false;
            state.isScanning = false;
            elements.fingerprintBtn.classList.remove('complete');
            elements.fingerprintText.textContent = 'Toque para desbloquear';
            elements.lockScreen.classList.add('hidden');
            elements.homeScreen.classList.remove('hidden');
        }, 300);
    }, 800);
}

// ============================================
// NAVEGAÇÃO DE APPS
// ============================================

function openApp(appName) {
    state.currentApp = appName;
    elements.homeScreen.classList.add('hidden');
    elements.appContainer.classList.remove('hidden');

    switch(appName) {
        case 'whatsapp': renderWhatsApp(); break;
        case 'nubank': renderNubank(); break;
        case 'settings': renderSettings(); break;
        case 'olx': renderOLX(); break;
        case 'phone': renderPhone(); break;
        case 'double': renderDouble(); break;
        default: renderPlaceholder(appName);
    }
}

function closeApp() {
    state.currentApp = null;
    state.currentScreen = null;
    elements.appContainer.classList.add('hidden');
    elements.appContainer.innerHTML = '';
    elements.homeScreen.classList.remove('hidden');
    
    // Stop any ongoing audio/recording
    if (state.mediaRecorder && state.isRecording) {
        state.mediaRecorder.stop();
        state.isRecording = false;
    }
    if (state.callAudio) {
        state.callAudio.pause();
        state.callAudio = null;
    }
    if (state.callInterval) {
        clearInterval(state.callInterval);
        state.callInterval = null;
    }
}

// ============================================
// WHATSAPP - Com todas as funcionalidades
// ============================================

function renderWhatsApp(screen = 'list', contactId = null) {
    const currentTime = formatTime();
    
    // Combine contacts and groups for the list
    const allChats = [
        ...state.contacts.map(c => ({ ...c, isGroup: false })),
        ...state.groups.map(g => ({ ...g, isGroup: true }))
    ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    if (screen === 'list') {
        elements.appContainer.innerHTML = `
            <div class="wa-app">
                <!-- Status Bar -->
                <div class="wa-status-bar">
                    <span>${currentTime}</span>
                    <div class="wa-status-icons">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg>
                    </div>
                </div>
                
                <!-- Header -->
                <div class="wa-header">
                    <div class="wa-header-left">
                        <button class="wa-back-btn" onclick="closeApp()">‹</button>
                        <h1 class="wa-title">WhatsApp</h1>
                    </div>
                    <div class="wa-header-icons">
                        <button class="wa-icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button>
                        <button class="wa-icon-btn" onclick="showWhatsAppMenu()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button>
                    </div>
                </div>
                
                <!-- Contacts List -->
                <div class="wa-contacts-list">
                    ${allChats.map(chat => `
                        <div class="wa-contact-item" onclick="renderWhatsApp('chat', '${chat.id}')">
                            <div class="wa-avatar-container">
                                <div class="wa-avatar ${chat.isGroup ? 'group' : ''}">${chat.avatar && chat.avatar.length > 0 ? `<img src="${chat.avatar}" alt="" onerror="this.style.display='none';this.parentElement.innerHTML='${getInitials(chat.name)}'">` : getInitials(chat.name)}</div>
                                ${!chat.isGroup && chat.online ? '<div class="wa-online-dot"></div>' : ''}
                            </div>
                            <div class="wa-contact-info">
                                <div class="wa-contact-row">
                                    <span class="wa-contact-name">${chat.name}</span>
                                    <span class="wa-contact-time ${chat.unread > 0 ? 'unread' : ''}">${chat.time || ''}</span>
                                </div>
                                <div class="wa-contact-row">
                                    <span class="wa-last-message">${chat.lastMessage || ''}</span>
                                    ${chat.unread > 0 ? `<span class="wa-unread-badge">${chat.unread}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Home Indicator -->
                <div class="home-indicator"><div class="home-indicator-bar"></div></div>
            </div>
        `;
    } else if (screen === 'chat') {
        // Find in contacts or groups
        let chat = state.contacts.find(c => c.id === contactId);
        let isGroup = false;
        
        if (!chat) {
            chat = state.groups.find(g => g.id === contactId);
            isGroup = true;
        }
        
        if (!chat) return renderWhatsApp('list');
        
        const messages = state.conversations[contactId] || [];
        
        // Mark as read
        chat.unread = 0;
        
        elements.appContainer.innerHTML = `
            <div class="wa-chat">
                <!-- Status Bar -->
                <div class="wa-status-bar chat">
                    <span>${currentTime}</span>
                    <div class="wa-status-icons">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg>
                    </div>
                </div>
                
                <!-- Chat Header -->
                <div class="wa-chat-header">
                    <button class="wa-back-btn" onclick="renderWhatsApp('list')">‹</button>
                    <div class="wa-chat-avatar-container" ${isGroup ? `onclick="showGroupOptions('${contactId}')"` : ''}>
                        <div class="wa-chat-avatar ${isGroup ? 'group' : ''}">${chat.avatar ? `<img src="${chat.avatar}" alt="">` : getInitials(chat.name)}</div>
                        ${!isGroup && chat.online ? '<div class="wa-online-dot small"></div>' : ''}
                    </div>
                    <div class="wa-chat-info">
                        <span class="wa-chat-name">${chat.name}</span>
                        <span class="wa-chat-phone">${isGroup ? `${chat.members?.length || 0} participantes` : chat.phone}</span>
                    </div>
                    <div class="wa-chat-actions">
                        ${!isGroup ? `
                            <button class="wa-icon-btn" onclick="startWhatsAppCall('${contactId}', 'video')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg></button>
                            <button class="wa-icon-btn" onclick="startWhatsAppCall('${contactId}', 'voice')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Messages -->
                <div class="wa-messages" id="waMessages">
                    ${messages.map(msg => `
                        <div class="wa-message ${msg.sent ? 'sent' : 'received'}">
                            ${msg.senderName && !msg.sent && isGroup ? `<span class="wa-msg-sender">${msg.senderName}</span>` : ''}
                            ${msg.type === 'image' && msg.imageUrl ? `<img src="${msg.imageUrl}" alt="" class="wa-msg-image">` : ''}
                            ${msg.type === 'location' ? '<div class="wa-location">📍 Localização compartilhada</div>' : ''}
                            ${msg.type === 'audio' ? `
                                <div class="wa-audio-message">
                                    <button class="wa-audio-play-btn" onclick="playAudioMessage(this, '${msg.audioUrl}')">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </button>
                                    <div class="wa-audio-waveform"></div>
                                    <span class="wa-audio-duration">${msg.duration || '0:00'}</span>
                                </div>
                            ` : ''}
                            ${msg.type === 'receipt' ? `
                                <div class="wa-receipt-message">
                                    <div class="wa-receipt-header">🧾 Comprovante de Transferência</div>
                                    <div class="wa-receipt-body">
                                        <p><strong>Valor:</strong> R$ ${msg.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                                        <p><strong>Para:</strong> ${msg.recipientName || 'Destinatário'}</p>
                                        <p><strong>Data:</strong> ${msg.time}</p>
                                    </div>
                                </div>
                            ` : ''}
                            ${(!msg.type || msg.type === 'text') ? `<p class="wa-msg-text">${msg.text}</p>` : ''}
                            <div class="wa-msg-meta">
                                <span class="wa-msg-time">${msg.time}</span>
                                ${msg.sent ? '<span class="wa-msg-check">✓✓</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Input Area -->
                <div class="wa-input-area">
                    <button class="wa-attach-btn" onclick="showAttachMenu('${contactId}')">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path></svg>
                    </button>
                    <input type="text" class="wa-text-input" id="waMessageInput" placeholder="Mensagem">
                    <button class="wa-mic-btn" id="waMicBtn" onmousedown="startRecording('${contactId}')" onmouseup="stopRecording('${contactId}')" ontouchstart="startRecording('${contactId}')" ontouchend="stopRecording('${contactId}')">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path></svg>
                    </button>
                    <button class="wa-send-btn" onclick="sendWhatsAppMessage('${contactId}')">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                    </button>
                </div>
                
                <!-- Recording indicator -->
                <div class="wa-recording-indicator hidden" id="waRecordingIndicator">
                    <div class="wa-recording-dot"></div>
                    <span id="waRecordingTime">0:00</span>
                    <span>Gravando...</span>
                </div>
                
                <!-- Home Indicator -->
                <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
            </div>
        `;
        
        // Scroll to bottom
        const messagesEl = document.getElementById('waMessages');
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
        
        // Enter to send
        document.getElementById('waMessageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendWhatsAppMessage(contactId);
        });
    }
}

// WhatsApp Menu
window.showWhatsAppMenu = function() {
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'wa-menu-overlay';
    menuOverlay.onclick = (e) => { if (e.target === menuOverlay) menuOverlay.remove(); };
    menuOverlay.innerHTML = `
        <div class="wa-dropdown-menu">
            <button class="wa-menu-item" onclick="showCreateGroupModal(); this.closest('.wa-menu-overlay').remove();">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Criar grupo
            </button>
            <button class="wa-menu-item" onclick="showChangeAvatarModal(); this.closest('.wa-menu-overlay').remove();">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Alterar foto de perfil
            </button>
        </div>
    `;
    elements.appContainer.appendChild(menuOverlay);
};

// Change Avatar Modal
window.showChangeAvatarModal = function() {
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.innerHTML = `
        <div class="wa-modal">
            <h3>Alterar Foto de Perfil</h3>
            <div class="wa-modal-field">
                <label>URL da imagem</label>
                <input type="text" id="avatarUrlInput" placeholder="https://exemplo.com/foto.jpg">
            </div>
            <div class="wa-modal-preview" id="avatarPreview">
                ${state.myAvatar ? `<img src="${state.myAvatar}" alt="">` : getInitials('Eu')}
            </div>
            <div class="wa-modal-buttons">
                <button class="wa-modal-cancel" onclick="this.closest('.wa-modal-overlay').remove()">Cancelar</button>
                <button class="wa-modal-confirm" onclick="saveMyAvatar()">Salvar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
    
    document.getElementById('avatarUrlInput').addEventListener('input', (e) => {
        const preview = document.getElementById('avatarPreview');
        if (e.target.value) {
            preview.innerHTML = `<img src="${e.target.value}" alt="" onerror="this.parentElement.innerHTML='${getInitials('Eu')}'">`;
        } else {
            preview.innerHTML = getInitials('Eu');
        }
    });
};

window.saveMyAvatar = function() {
    const url = document.getElementById('avatarUrlInput').value.trim();
    state.myAvatar = url;
    document.querySelector('.wa-modal-overlay').remove();
    renderWhatsApp('list');
};

// Create Group Modal
window.showCreateGroupModal = function() {
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.innerHTML = `
        <div class="wa-modal group-modal">
            <h3>Criar Grupo</h3>
            <div class="wa-modal-field">
                <label>Nome do grupo</label>
                <input type="text" id="groupNameInput" placeholder="Nome do grupo">
            </div>
            <div class="wa-modal-field">
                <label>Foto do grupo (URL, opcional)</label>
                <input type="text" id="groupAvatarInput" placeholder="https://exemplo.com/foto.jpg">
            </div>
            <div class="wa-modal-field">
                <label>Adicionar participantes</label>
                <div class="wa-contact-select" id="contactSelect">
                    ${state.contacts.filter(c => !c.isGroup).map(c => `
                        <label class="wa-contact-checkbox">
                            <input type="checkbox" value="${c.id}" data-name="${c.name}">
                            <div class="wa-contact-checkbox-avatar">${c.avatar ? `<img src="${c.avatar}" alt="">` : getInitials(c.name)}</div>
                            <span>${c.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="wa-modal-buttons">
                <button class="wa-modal-cancel" onclick="this.closest('.wa-modal-overlay').remove()">Cancelar</button>
                <button class="wa-modal-confirm" onclick="createGroup()">Criar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
};

window.createGroup = function() {
    const name = document.getElementById('groupNameInput').value.trim();
    if (!name) return alert('Digite um nome para o grupo');
    
    const avatar = document.getElementById('groupAvatarInput').value.trim();
    const checkboxes = document.querySelectorAll('#contactSelect input[type="checkbox"]:checked');
    const members = Array.from(checkboxes).map(cb => ({
        id: cb.value,
        name: cb.dataset.name
    }));
    
    // Add myself as creator
    members.push({ id: state.myPhone, name: 'Você', isAdmin: true });
    
    const groupId = generateGroupId();
    const newGroup = {
        id: groupId,
        name: name,
        avatar: avatar,
        members: members,
        creatorId: state.myPhone,
        lastMessage: 'Grupo criado',
        time: formatTime(),
        timestamp: Date.now(),
        unread: 0,
        isGroup: true
    };
    
    state.groups.push(newGroup);
    state.conversations[groupId] = [
        { text: 'Grupo criado', sent: true, time: formatTime(), type: 'text' }
    ];
    
    document.querySelector('.wa-modal-overlay').remove();
    renderWhatsApp('list');
};

// Group Options
window.showGroupOptions = function(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const isAdmin = group.creatorId === state.myPhone;
    
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.innerHTML = `
        <div class="wa-modal group-options-modal">
            <div class="wa-group-header">
                <div class="wa-group-avatar-large">${group.avatar && group.avatar.length > 0 ? `<img src="${group.avatar}" alt="" onerror="this.style.display='none';this.parentElement.innerHTML='${getInitials(group.name)}'">` : getInitials(group.name)}</div>
                <h3>${group.name}</h3>
                <p class="wa-group-info">${group.members?.length || 0} participantes</p>
            </div>
            
            <div class="wa-group-members">
                <h4>Participantes</h4>
                ${group.members?.map(m => `
                    <div class="wa-group-member">
                        <div class="wa-member-avatar">${getInitials(m.name)}</div>
                        <span class="wa-member-name">${m.name}</span>
                        ${m.isAdmin ? '<span class="wa-admin-badge">Admin</span>' : ''}
                        ${isAdmin && m.id !== state.myPhone ? `<button class="wa-remove-member" onclick="removeMemberFromGroup('${groupId}', '${m.id}')">✕</button>` : ''}
                    </div>
                `).join('')}
            </div>
            
            ${isAdmin ? `
                <button class="wa-group-action-btn add" onclick="showAddMemberModal('${groupId}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Adicionar participante
                </button>
            ` : ''}
            
            <button class="wa-group-action-btn leave" onclick="leaveGroup('${groupId}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sair do grupo
            </button>
            
            <div class="wa-modal-buttons">
                <button class="wa-modal-cancel" onclick="this.closest('.wa-modal-overlay').remove()">Fechar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
};

window.showAddMemberModal = function(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const memberIds = group.members.map(m => m.id);
    const availableContacts = state.contacts.filter(c => !memberIds.includes(c.id) && !c.isGroup);
    
    if (availableContacts.length === 0) {
        alert('Não há mais contatos para adicionar');
        return;
    }
    
    // Remove previous modal
    document.querySelector('.wa-modal-overlay')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.innerHTML = `
        <div class="wa-modal">
            <h3>Adicionar Participante</h3>
            <div class="wa-contact-select" id="addMemberSelect">
                ${availableContacts.map(c => `
                    <label class="wa-contact-checkbox">
                        <input type="checkbox" value="${c.id}" data-name="${c.name}">
                        <div class="wa-contact-checkbox-avatar">${c.avatar ? `<img src="${c.avatar}" alt="">` : getInitials(c.name)}</div>
                        <span>${c.name}</span>
                    </label>
                `).join('')}
            </div>
            <div class="wa-modal-buttons">
                <button class="wa-modal-cancel" onclick="this.closest('.wa-modal-overlay').remove(); showGroupOptions('${groupId}');">Cancelar</button>
                <button class="wa-modal-confirm" onclick="addMembersToGroup('${groupId}')">Adicionar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
};

window.addMembersToGroup = function(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const checkboxes = document.querySelectorAll('#addMemberSelect input[type="checkbox"]:checked');
    Array.from(checkboxes).forEach(cb => {
        group.members.push({
            id: cb.value,
            name: cb.dataset.name
        });
    });
    
    document.querySelector('.wa-modal-overlay').remove();
    showGroupOptions(groupId);
};

window.removeMemberFromGroup = function(groupId, memberId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    group.members = group.members.filter(m => m.id !== memberId);
    document.querySelector('.wa-modal-overlay').remove();
    showGroupOptions(groupId);
};

window.leaveGroup = function(groupId) {
    if (!confirm('Deseja sair do grupo?')) return;
    
    state.groups = state.groups.filter(g => g.id !== groupId);
    delete state.conversations[groupId];
    
    document.querySelector('.wa-modal-overlay').remove();
    renderWhatsApp('list');
};

// Audio Recording
let recordingInterval = null;

window.startRecording = async function(contactId) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];
        state.isRecording = true;
        state.recordingStartTime = Date.now();
        
        state.mediaRecorder.ondataavailable = (e) => {
            state.audioChunks.push(e.data);
        };
        
        state.mediaRecorder.start();
        
        // Show recording indicator
        const indicator = document.getElementById('waRecordingIndicator');
        if (indicator) indicator.classList.remove('hidden');
        
        // Update recording time
        recordingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.recordingStartTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            const timeEl = document.getElementById('waRecordingTime');
            if (timeEl) timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
        
        // Update mic button
        const micBtn = document.getElementById('waMicBtn');
        if (micBtn) micBtn.classList.add('recording');
        
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Não foi possível acessar o microfone');
    }
};

window.stopRecording = function(contactId) {
    if (!state.mediaRecorder || !state.isRecording) return;
    
    state.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const elapsed = Math.floor((Date.now() - state.recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        // Add audio message
        if (!state.conversations[contactId]) state.conversations[contactId] = [];
        state.conversations[contactId].push({
            type: 'audio',
            audioUrl: audioUrl,
            duration: duration,
            sent: true,
            time: formatTime()
        });
        
        // Update contact
        const contact = state.contacts.find(c => c.id === contactId) || state.groups.find(g => g.id === contactId);
        if (contact) {
            contact.lastMessage = '🎤 Áudio';
            contact.time = formatTime();
            contact.timestamp = Date.now();
        }
        
        // Stop stream tracks
        state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        renderWhatsApp('chat', contactId);
    };
    
    state.mediaRecorder.stop();
    state.isRecording = false;
    
    clearInterval(recordingInterval);
    
    // Hide recording indicator
    const indicator = document.getElementById('waRecordingIndicator');
    if (indicator) indicator.classList.add('hidden');
    
    const micBtn = document.getElementById('waMicBtn');
    if (micBtn) micBtn.classList.remove('recording');
};

// Audio Playback
window.playAudioMessage = function(button, audioUrl) {
    const audio = new Audio(audioUrl);
    const svgPlay = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const svgPause = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    
    if (button.classList.contains('playing')) {
        button.audioElement?.pause();
        button.innerHTML = svgPlay;
        button.classList.remove('playing');
    } else {
        // Stop any other playing audio
        document.querySelectorAll('.wa-audio-play-btn.playing').forEach(btn => {
            btn.audioElement?.pause();
            btn.innerHTML = svgPlay;
            btn.classList.remove('playing');
        });
        
        button.audioElement = audio;
        audio.play();
        button.innerHTML = svgPause;
        button.classList.add('playing');
        
        audio.onended = () => {
            button.innerHTML = svgPlay;
            button.classList.remove('playing');
        };
    }
};

// WhatsApp Calls with Audio
window.startWhatsAppCall = function(contactId, type) {
    const contact = state.contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    state.callDuration = 0;
    
    // Create ringtone audio
    const ringtone = new Audio('https://www.soundjay.com/phone/phone-calling-1.mp3');
    ringtone.loop = true;
    
    elements.appContainer.innerHTML = `
        <div class="wa-call-screen">
            <div class="wa-call-avatar-large">${contact.avatar ? `<img src="${contact.avatar}" alt="">` : getInitials(contact.name)}</div>
            <h2 class="wa-call-name">${contact.name}</h2>
            <p class="wa-call-status" id="waCallStatus">Chamando...</p>
            <p class="wa-call-duration" id="waCallDuration"></p>
            <div class="wa-call-controls">
                <button class="wa-call-control-btn" id="waMuteBtn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                </button>
                <button class="wa-end-call-btn" onclick="endWhatsAppCall('${contactId}')">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>
                <button class="wa-call-control-btn" id="waSpeakerBtn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                </button>
            </div>
        </div>
    `;
    
    // Try to play ringtone
    ringtone.play().catch(() => {});
    state.callAudio = ringtone;
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
        ringtone.pause();
        document.getElementById('waCallStatus').textContent = type === 'video' ? 'Vídeo chamada' : 'Em ligação';
        
        // Create in-call audio (simulated ambient sound)
        const callSound = new Audio('https://www.soundjay.com/ambient/sounds/birds-singing-01.mp3');
        callSound.loop = true;
        callSound.volume = 0.3;
        callSound.play().catch(() => {});
        state.callAudio = callSound;
        
        state.callInterval = setInterval(() => {
            state.callDuration++;
            const mins = Math.floor(state.callDuration / 60).toString().padStart(2, '0');
            const secs = (state.callDuration % 60).toString().padStart(2, '0');
            const durationEl = document.getElementById('waCallDuration');
            if (durationEl) durationEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }, 2000);
};

window.endWhatsAppCall = function(contactId) {
    if (state.callAudio) {
        state.callAudio.pause();
        state.callAudio = null;
    }
    if (state.callInterval) {
        clearInterval(state.callInterval);
        state.callInterval = null;
    }
    renderWhatsApp('chat', contactId);
};

// Attach Menu
window.showAttachMenu = function(contactId) {
    const menu = document.createElement('div');
    menu.className = 'wa-attach-overlay';
    menu.onclick = (e) => { if (e.target === menu) menu.remove(); };
    menu.innerHTML = `
        <div class="wa-attach-menu">
            <button class="wa-attach-option" onclick="showSendImageModal('${contactId}'); this.closest('.wa-attach-overlay').remove();">
                <div class="wa-attach-icon purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <span>Foto (URL)</span>
            </button>
            <button class="wa-attach-option" onclick="sendLocation('${contactId}'); this.closest('.wa-attach-overlay').remove();">
                <div class="wa-attach-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span>Localização</span>
            </button>
        </div>
    `;
    elements.appContainer.appendChild(menu);
};

window.showSendImageModal = function(contactId) {
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.innerHTML = `
        <div class="wa-modal">
            <h3>Enviar Foto</h3>
            <div class="wa-modal-field">
                <label>URL da imagem</label>
                <input type="text" id="waImageUrl" placeholder="https://exemplo.com/foto.jpg">
            </div>
            <div class="wa-image-preview" id="waImagePreview"></div>
            <div class="wa-modal-buttons">
                <button class="wa-modal-cancel" onclick="this.closest('.wa-modal-overlay').remove()">Cancelar</button>
                <button class="wa-modal-confirm" onclick="sendImageMessage('${contactId}')">Enviar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
    
    document.getElementById('waImageUrl').addEventListener('input', (e) => {
        const preview = document.getElementById('waImagePreview');
        if (e.target.value) {
            preview.innerHTML = `<img src="${e.target.value}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Imagem inválida</span>'">`;
        } else {
            preview.innerHTML = '';
        }
    });
};

window.sendImageMessage = function(contactId) {
    const url = document.getElementById('waImageUrl').value.trim();
    if (!url) return alert('Digite uma URL');
    
    const time = formatTime();
    
    if (!state.conversations[contactId]) state.conversations[contactId] = [];
    state.conversations[contactId].push({
        type: 'image',
        imageUrl: url,
        sent: true,
        time: time
    });
    
    let chat = state.contacts.find(c => c.id === contactId) || state.groups.find(g => g.id === contactId);
    if (chat) {
        chat.lastMessage = '📷 Foto';
        chat.time = time;
        chat.timestamp = Date.now();
    }
    
    document.querySelector('.wa-modal-overlay').remove();
    renderWhatsApp('chat', contactId);
};

window.sendLocation = function(contactId) {
    const time = formatTime();
    
    if (!state.conversations[contactId]) state.conversations[contactId] = [];
    state.conversations[contactId].push({
        type: 'location',
        sent: true,
        time: time
    });
    
    let chat = state.contacts.find(c => c.id === contactId) || state.groups.find(g => g.id === contactId);
    if (chat) {
        chat.lastMessage = '📍 Localização';
        chat.time = time;
        chat.timestamp = Date.now();
    }
    
    renderWhatsApp('chat', contactId);
};

function sendWhatsAppMessage(contactId) {
    const input = document.getElementById('waMessageInput');
    const text = input.value.trim();
    if (!text) return;

    const time = formatTime();
    
    if (!state.conversations[contactId]) state.conversations[contactId] = [];
    state.conversations[contactId].push({ text, sent: true, time, type: 'text' });
    
    // Update contact or group
    let chat = state.contacts.find(c => c.id === contactId);
    if (!chat) chat = state.groups.find(g => g.id === contactId);
    
    if (chat) {
        chat.lastMessage = `Você: ${text}`;
        chat.time = time;
        chat.timestamp = Date.now();
    }
    
    renderWhatsApp('chat', contactId);
}

// ============================================
// NUBANK - Com envio de comprovante
// ============================================

function renderNubank(screen = 'home') {
    const currentTime = formatTime();
    
    if (screen === 'home') {
        elements.appContainer.innerHTML = `
            <div class="nubank-app">
                <!-- Purple Header -->
                <div class="nubank-header">
                    <div class="nubank-status-bar">
                        <span>${currentTime}</span>
                        <div class="nubank-status-icons">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg>
                        </div>
                    </div>
                    <div class="nubank-top-row">
                        <div class="nubank-avatar"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                        <div class="nubank-header-actions">
                            <button class="nubank-header-btn" onclick="state.balanceVisible=!state.balanceVisible;renderNubank();">${state.balanceVisible ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'}</button>
                            <button class="nubank-header-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
                            <button class="nubank-header-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></button>
                        </div>
                    </div>
                    <p class="nubank-greeting">Olá, <span class="font-semibold">Jogador</span></p>
                </div>
                
                <!-- Content -->
                <div class="nubank-content">
                    <!-- Conta Section -->
                    <div class="nubank-section">
                        <div class="nubank-section-header">
                            <span class="nubank-section-title">Conta</span>
                            <span class="nubank-chevron">›</span>
                        </div>
                        <p class="nubank-balance">${state.balanceVisible ? formatCurrency(state.nubankBalance) : '••••••'}</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="nubank-actions">
                        <button class="nubank-action" onclick="renderNubank('transfer-search')">
                            <div class="nubank-action-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                            <span class="nubank-action-label">Transferir</span>
                        </button>
                        <button class="nubank-action" onclick="renderNubank('extrato')">
                            <div class="nubank-action-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></div>
                            <span class="nubank-action-label">Extrato</span>
                        </button>
                    </div>
                </div>
                
                <!-- Close Button -->
                <div class="nubank-footer">
                    <button class="nubank-close-btn" onclick="closeApp()">Fechar</button>
                </div>
                
                <div class="home-indicator"><div class="home-indicator-bar"></div></div>
            </div>
        `;
    } else if (screen === 'transfer-search') {
        elements.appContainer.innerHTML = `
            <div class="nubank-dark">
                <div class="nubank-status-bar dark">
                    <span>${currentTime}</span>
                    <div class="nubank-status-icons"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg></div>
                </div>
                <div class="nubank-nav">
                    <button class="nubank-back" onclick="renderNubank()">✕</button>
                </div>
                <div class="nubank-transfer-content">
                    <h1 class="nubank-transfer-title">Para quem você quer<br>transferir?</h1>
                    <p class="nubank-transfer-label">Insira o passaporte de quem vai receber</p>
                    <input type="text" id="nubankRecipient" class="nubank-transfer-input" placeholder="000000" maxlength="6" inputmode="numeric">
                    <p class="nubank-transfer-hint">Para transferir, insira o passaporte de 6 dígitos do jogador.</p>
                </div>
                <button class="nubank-arrow-btn" id="nubankNextBtn" onclick="handleNubankSearchRecipient()">→</button>
                <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
            </div>
        `;
        
        document.getElementById('nubankRecipient').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
        });
    } else if (screen === 'transfer-confirm') {
        elements.appContainer.innerHTML = `
            <div class="nubank-dark">
                <div class="nubank-status-bar dark"><span>${currentTime}</span></div>
                <div class="nubank-nav">
                    <button class="nubank-back" onclick="renderNubank('transfer-search')">‹</button>
                </div>
                <div class="nubank-transfer-content">
                    <h1 class="nubank-transfer-title">Confirme quem vai receber</h1>
                    <div class="nubank-recipient-card">
                        <div class="nubank-recipient-avatar">${getInitials(state.transferRecipientName || 'JG')}</div>
                        <p class="nubank-recipient-name">${(state.transferRecipientName || 'Jogador').replace('_', ' ')}</p>
                    </div>
                    <div class="nubank-bank-info">
                        <div class="nubank-bank-icon">nu</div>
                        <span>NU PAGAMENTOS - IP</span>
                    </div>
                </div>
                <div class="nubank-confirm-footer">
                    <button class="nubank-confirm-btn" onclick="renderNubank('transfer-amount')">Confirmar</button>
                </div>
                <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
            </div>
        `;
    } else if (screen === 'transfer-amount') {
        elements.appContainer.innerHTML = `
            <div class="nubank-dark amount">
                <div class="nubank-status-bar dark"><span>${currentTime}</span></div>
                <div class="nubank-nav">
                    <button class="nubank-back" onclick="renderNubank('transfer-confirm')">‹</button>
                </div>
                <div class="nubank-transfer-content">
                    <h1 class="nubank-transfer-title">Qual é o valor da<br>transferência?</h1>
                    <div class="nubank-amount-input-row">
                        <span class="nubank-currency">R$</span>
                        <input type="text" id="nubankAmount" class="nubank-amount-input" placeholder="0" inputmode="numeric">
                    </div>
                    <p class="nubank-available">Saldo disponível: ${formatCurrency(state.nubankBalance)}</p>
                    <p class="nubank-error" id="nubankError"></p>
                </div>
                <div class="nubank-confirm-footer">
                    <button class="nubank-confirm-btn" onclick="executeNubankTransfer()">Confirmar</button>
                </div>
                <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
            </div>
        `;
        
        document.getElementById('nubankAmount').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    } else if (screen === 'receipt') {
        const value = state.transferAmount || 0;
        elements.appContainer.innerHTML = `
            <div class="nubank-receipt">
                <div class="nubank-status-bar purple"><span>${currentTime}</span></div>
                <div class="nubank-nav purple">
                    <button class="nubank-back" onclick="renderNubank()">‹</button>
                </div>
                <div class="nubank-receipt-content">
                    <div class="nubank-receipt-icon">🚀</div>
                    <h2 class="nubank-receipt-title">Pronto, enviamos sua<br>transferência.</h2>
                    <div class="nubank-receipt-card">
                        <p class="nubank-receipt-value">R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p class="nubank-receipt-to">para <span>${(state.transferRecipientName || 'JOGADOR').replace('_', ' ').toUpperCase()}</span></p>
                        <p class="nubank-receipt-time">Agora mesmo • ${formatTime()}</p>
                    </div>
                    <button class="nubank-send-receipt-btn" onclick="showSendReceiptModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                        Enviar comprovante
                    </button>
                </div>
                <div class="home-indicator"><div class="home-indicator-bar"></div></div>
            </div>
        `;
    } else if (screen === 'extrato') {
        elements.appContainer.innerHTML = `
            <div class="nubank-dark">
                <div class="nubank-status-bar dark"><span>${currentTime}</span></div>
                <div class="nubank-nav">
                    <button class="nubank-back" onclick="renderNubank()">‹</button>
                    <span class="nubank-nav-title">Extrato</span>
                </div>
                <div class="nubank-extrato-content">
                    <p class="nubank-extrato-label">Últimas transferências recebidas</p>
                    <div class="nubank-transactions">
                        ${state.transactions.map(tx => `
                            <div class="nubank-transaction">
                                <div class="nubank-tx-icon">↙</div>
                                <div class="nubank-tx-info">
                                    <span class="nubank-tx-name">${tx.senderName.replace('_', ' ')}</span>
                                    <span class="nubank-tx-time">${tx.time}</span>
                                </div>
                                <span class="nubank-tx-value">+ ${formatCurrency(tx.value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
            </div>
        `;
    }
}

window.handleNubankSearchRecipient = function() {
    const input = document.getElementById('nubankRecipient');
    const recipientId = input.value;
    
    if (recipientId.length !== 6) {
        alert('Passaporte deve ter 6 dígitos');
        return;
    }
    
    state.transferRecipientId = recipientId;
    state.transferRecipientName = `Jogador_${recipientId}`;
    renderNubank('transfer-confirm');
};

window.executeNubankTransfer = function() {
    const input = document.getElementById('nubankAmount');
    const value = Math.round(Number(input.value));
    
    if (value <= 0) {
        document.getElementById('nubankError').textContent = 'Valor inválido';
        return;
    }
    if (value > state.nubankBalance) {
        document.getElementById('nubankError').textContent = 'Saldo insuficiente';
        return;
    }
    
    state.nubankBalance -= value;
    state.transferAmount = value;
    renderNubank('receipt');
};

window.showSendReceiptModal = function() {
    const allChats = [
        ...state.contacts.filter(c => !c.isGroup),
        ...state.groups
    ];
    
    const modal = document.createElement('div');
    modal.className = 'nubank-modal-overlay';
    modal.innerHTML = `
        <div class="nubank-modal">
            <h3>Enviar comprovante para</h3>
            <div class="nubank-contact-list">
                ${allChats.map(c => `
                    <button class="nubank-contact-item" onclick="sendReceiptToContact('${c.id}')">
                        <div class="nubank-contact-avatar">${c.avatar ? `<img src="${c.avatar}" alt="">` : getInitials(c.name)}</div>
                        <span>${c.name}</span>
                    </button>
                `).join('')}
            </div>
            <button class="nubank-modal-close" onclick="this.closest('.nubank-modal-overlay').remove()">Cancelar</button>
        </div>
    `;
    elements.appContainer.appendChild(modal);
};

window.sendReceiptToContact = function(contactId) {
    const time = formatTime();
    
    if (!state.conversations[contactId]) state.conversations[contactId] = [];
    state.conversations[contactId].push({
        type: 'receipt',
        value: state.transferAmount,
        recipientName: state.transferRecipientName,
        sent: true,
        time: time
    });
    
    // Update contact
    let chat = state.contacts.find(c => c.id === contactId);
    if (!chat) chat = state.groups.find(g => g.id === contactId);
    
    if (chat) {
        chat.lastMessage = '🧾 Comprovante enviado';
        chat.time = time;
        chat.timestamp = Date.now();
    }
    
    document.querySelector('.nubank-modal-overlay').remove();
    alert('Comprovante enviado!');
    renderNubank();
};

// ============================================
// SETTINGS - Idêntico ao React
// ============================================

function renderSettings(screen = 'main') {
    if (screen === 'main') {
        elements.appContainer.innerHTML = `
            <div class="settings-app">
                <div class="settings-header">
                    <button class="settings-back" onclick="closeApp()">‹ Voltar</button>
                    <h1 class="settings-title">Ajustes</h1>
                </div>
                
                <!-- User Section -->
                <div class="settings-group">
                    <button class="settings-item">
                        <div class="settings-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                        <div class="settings-item-content">
                            <span class="settings-item-label">Usuário</span>
                            <span class="settings-item-value">Apple ID, iCloud+</span>
                        </div>
                        <span class="settings-chevron">›</span>
                    </button>
                </div>
                
                <!-- Settings Group 1 -->
                <div class="settings-group">
                    <button class="settings-item" onclick="renderSettings('wallpaper')">
                        <div class="settings-icon cyan"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
                        <span class="settings-item-label">Wallpaper</span>
                        <span class="settings-chevron">›</span>
                    </button>
                    <button class="settings-item" onclick="renderSettings('screen-size')">
                        <div class="settings-icon purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></div>
                        <span class="settings-item-label">Tamanho da Tela</span>
                        <span class="settings-item-value">${state.scale}%</span>
                        <span class="settings-chevron">›</span>
                    </button>
                    <button class="settings-item">
                        <div class="settings-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                        <span class="settings-item-label">Face ID e Código</span>
                        <span class="settings-item-value">Desativado</span>
                        <span class="settings-chevron">›</span>
                    </button>
                </div>
                
                <!-- Settings Group 2 -->
                <div class="settings-group">
                    <button class="settings-item">
                        <div class="settings-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg></div>
                        <span class="settings-item-label">Wi-Fi</span>
                        <span class="settings-item-value">Casa_5G</span>
                        <span class="settings-chevron">›</span>
                    </button>
                    <button class="settings-item">
                        <div class="settings-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="m7 7 10 10M6.2 6.2c-2.2 2.2-2.8 5.5-1.5 8.3M9 9c-1.2 1.2-1.5 3-.7 4.5M16.8 17.8c2.2-2.2 2.8-5.5 1.5-8.3M15 15c1.2-1.2 1.5-3 .7-4.5"/></svg></div>
                        <span class="settings-item-label">Bluetooth</span>
                        <span class="settings-item-value">Ligado</span>
                        <span class="settings-chevron">›</span>
                    </button>
                </div>
                
                <div class="home-indicator"><div class="home-indicator-bar dark"></div></div>
            </div>
        `;
    } else if (screen === 'wallpaper') {
        elements.appContainer.innerHTML = `
            <div class="settings-app">
                <div class="settings-header">
                    <button class="settings-back" onclick="renderSettings('main')">‹ Ajustes</button>
                    <h1 class="settings-title">Wallpaper</h1>
                </div>
                
                <div class="wallpaper-grid">
                    ${state.wallpapers.map(wp => `
                        <button class="wallpaper-item ${state.wallpaper === wp.file ? 'selected' : ''}" onclick="selectWallpaper('${wp.file}')">
                            <img src="${wp.file}" alt="${wp.name}">
                            <span>${wp.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <div class="home-indicator"><div class="home-indicator-bar dark"></div></div>
            </div>
        `;
    } else if (screen === 'screen-size') {
        const scales = [
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' }
        ];
        
        elements.appContainer.innerHTML = `
            <div class="settings-app">
                <div class="settings-header">
                    <button class="settings-back" onclick="renderSettings('main')">‹ Ajustes</button>
                    <h1 class="settings-title">Tamanho da Tela</h1>
                </div>
                
                <div class="settings-list">
                    ${scales.map(s => `
                        <button class="settings-item scale-option ${state.scale === s.value ? 'selected' : ''}" onclick="updateScale(${s.value})">
                            <span class="settings-item-label">${s.label}</span>
                            ${state.scale === s.value ? '<span class="scale-check"><svg viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="3" width="20" height="20"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : ''}
                        </button>
                    `).join('')}
                </div>
                
                <div class="home-indicator"><div class="home-indicator-bar dark"></div></div>
            </div>
        `;
    }
}

window.selectWallpaper = function(file) {
    state.wallpaper = file;
    applyWallpaper();
    renderSettings('wallpaper');
};

window.updateScale = function(value) {
    state.scale = parseInt(value);
    
    // Apply scale to phone container
    const scaleValue = state.scale / 100;
    if (elements.phoneContainer) {
        elements.phoneContainer.style.transform = `scale(${scaleValue})`;
        elements.phoneContainer.style.transformOrigin = 'center center';
    }
    
    // Re-render to update selected state
    renderSettings('screen-size');
};

// ============================================
// OLX - Idêntico ao React
// ============================================

function renderOLX() {
    const currentTime = formatTime();
    
    elements.appContainer.innerHTML = `
        <div class="olx-app">
            <!-- Status Bar -->
            <div class="olx-status-bar">
                <span>${currentTime}</span>
                <div class="olx-status-icons">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg>
                </div>
            </div>
            
            <!-- Header -->
            <div class="olx-header">
                <div class="olx-header-row">
                    <button class="olx-back-btn" onclick="closeApp()">‹</button>
                    <span class="olx-title">OLX</span>
                    <button class="olx-add-btn" onclick="showOLXCreateModal()">+</button>
                </div>
                <div class="olx-search">
                    <div class="olx-search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                    <input type="text" class="olx-search-input" placeholder="Buscar no OLX">
                </div>
            </div>
            
            <!-- Listings -->
            <div class="olx-listings">
                ${state.olxListings.map(item => `
                    <div class="olx-listing">
                        <div class="olx-listing-image">
                            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200?text=Sem+Imagem'">
                            <div class="olx-listing-category">${getCategoryIcon(item.category)}</div>
                        </div>
                        <div class="olx-listing-info">
                            <div class="olx-listing-price">${formatCurrency(item.price)}</div>
                            <div class="olx-listing-title">${item.title}</div>
                            <div class="olx-listing-meta">ID: ${item.playerId}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Home Indicator -->
            <div class="home-indicator"><div class="home-indicator-bar dark"></div></div>
        </div>
    `;
}

function getCategoryIcon(category) {
    const icons = {
        'carros': '🚗',
        'motos': '🏍️',
        'casas': '🏠',
        'imoveis': '🏢',
        'eletronicos': '📱',
        'outros': '📦'
    };
    return icons[category] || '📦';
}

window.showOLXCreateModal = function() {
    const modal = document.createElement('div');
    modal.className = 'olx-modal-overlay';
    modal.innerHTML = `
        <div class="olx-modal">
            <h3>Criar Anúncio</h3>
            <div class="olx-form">
                <div class="olx-form-group">
                    <label>Título</label>
                    <input type="text" id="olxTitle" placeholder="Ex: Honda Civic 2020">
                </div>
                <div class="olx-form-group">
                    <label>Preço (R$)</label>
                    <input type="number" id="olxPrice" placeholder="Ex: 50000">
                </div>
                <div class="olx-form-group">
                    <label>URL da Imagem</label>
                    <input type="text" id="olxImage" placeholder="https://exemplo.com/foto.jpg">
                </div>
                <div class="olx-form-group">
                    <label>Categoria</label>
                    <div class="olx-categories">
                        <button class="olx-category selected" data-cat="carros">🚗 Carros</button>
                        <button class="olx-category" data-cat="motos">🏍️ Motos</button>
                        <button class="olx-category" data-cat="casas">🏠 Casas</button>
                        <button class="olx-category" data-cat="eletronicos">📱 Eletrônicos</button>
                    </div>
                </div>
            </div>
            <div class="olx-modal-buttons">
                <button class="olx-modal-cancel" onclick="this.closest('.olx-modal-overlay').remove()">Cancelar</button>
                <button class="olx-modal-confirm" onclick="createOLXListing()">Publicar</button>
            </div>
        </div>
    `;
    elements.appContainer.appendChild(modal);
    
    // Category selection
    modal.querySelectorAll('.olx-category').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.olx-category').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
};

window.createOLXListing = function() {
    const title = document.getElementById('olxTitle').value.trim();
    const price = parseInt(document.getElementById('olxPrice').value) || 0;
    const imageUrl = document.getElementById('olxImage').value.trim() || 'https://via.placeholder.com/200?text=Sem+Imagem';
    const category = document.querySelector('.olx-category.selected')?.dataset.cat || 'outros';
    
    if (!title) return alert('Digite um título');
    if (price <= 0) return alert('Digite um preço válido');
    
    state.olxListings.unshift({
        id: Date.now().toString(),
        title: title,
        price: price,
        imageUrl: imageUrl,
        category: category,
        playerId: state.myPhone
    });
    
    document.querySelector('.olx-modal-overlay').remove();
    renderOLX();
};

// ============================================
// PHONE - Idêntico ao React
// ============================================

function renderPhone() {
    elements.appContainer.innerHTML = `
        <div class="phone-app">
            <!-- Status Bar -->
            <div class="phone-status-bar">
                <span>${formatTime()}</span>
                <div class="phone-status-icons">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg>
                </div>
            </div>
            
            <!-- Header -->
            <div class="phone-header">
                <button class="phone-back" onclick="closeApp()">‹</button>
                <h1 class="phone-title">Telefone</h1>
                <div style="width:24px"></div>
            </div>
            
            <!-- Number Display -->
            <div class="phone-display">
                <span class="phone-number" id="phoneNumber"></span>
            </div>
            
            <!-- Save Contact Button -->
            <div class="phone-save-container" id="phoneSaveContainer" style="display:none">
                <button class="phone-save-btn" onclick="showSaveContactModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Salvar contato
                </button>
            </div>
            
            <!-- Keypad -->
            <div class="phone-keypad">
                <div class="keypad-row">
                    <button class="keypad-btn" onclick="pressPhoneKey('1')">1</button>
                    <button class="keypad-btn" onclick="pressPhoneKey('2')">2<span class="keypad-letters">ABC</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('3')">3<span class="keypad-letters">DEF</span></button>
                </div>
                <div class="keypad-row">
                    <button class="keypad-btn" onclick="pressPhoneKey('4')">4<span class="keypad-letters">GHI</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('5')">5<span class="keypad-letters">JKL</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('6')">6<span class="keypad-letters">MNO</span></button>
                </div>
                <div class="keypad-row">
                    <button class="keypad-btn" onclick="pressPhoneKey('7')">7<span class="keypad-letters">PQRS</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('8')">8<span class="keypad-letters">TUV</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('9')">9<span class="keypad-letters">WXYZ</span></button>
                </div>
                <div class="keypad-row">
                    <button class="keypad-btn clear" onclick="clearPhoneNumber()">Limpar</button>
                    <button class="keypad-btn" onclick="pressPhoneKey('0')">0<span class="keypad-letters">+</span></button>
                    <button class="keypad-btn" onclick="pressPhoneKey('#')">#</button>
                </div>
            </div>
            
            <!-- Delete Row -->
            <div class="phone-delete-row">
                <button class="phone-delete-btn" id="phoneDeleteBtn" style="visibility:hidden" onclick="deletePhoneDigit()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg></button>
            </div>
            
            <div class="home-indicator"><div class="home-indicator-bar light"></div></div>
        </div>
    `;
    
    window.currentPhoneNumber = '';
    
    window.pressPhoneKey = function(key) {
        if (window.currentPhoneNumber.length < 6) {
            window.currentPhoneNumber += key;
            document.getElementById('phoneNumber').textContent = window.currentPhoneNumber;
            document.getElementById('phoneDeleteBtn').style.visibility = 'visible';
            
            if (window.currentPhoneNumber.length === 6) {
                document.getElementById('phoneSaveContainer').style.display = 'flex';
            }
        }
    };
    
    window.deletePhoneDigit = function() {
        window.currentPhoneNumber = window.currentPhoneNumber.slice(0, -1);
        document.getElementById('phoneNumber').textContent = window.currentPhoneNumber;
        document.getElementById('phoneSaveContainer').style.display = 'none';
        
        if (window.currentPhoneNumber.length === 0) {
            document.getElementById('phoneDeleteBtn').style.visibility = 'hidden';
        }
    };
    
    window.clearPhoneNumber = function() {
        window.currentPhoneNumber = '';
        document.getElementById('phoneNumber').textContent = '';
        document.getElementById('phoneDeleteBtn').style.visibility = 'hidden';
        document.getElementById('phoneSaveContainer').style.display = 'none';
    };
    
    window.showSaveContactModal = function() {
        const modal = document.createElement('div');
        modal.className = 'phone-modal-overlay';
        modal.innerHTML = `
            <div class="phone-modal">
                <h3>Salvar Contato</h3>
                <div class="phone-modal-field">
                    <label>Nome</label>
                    <input type="text" id="contactNameInput" placeholder="Digite o nome...">
                </div>
                <div class="phone-modal-field">
                    <label>Número</label>
                    <div class="phone-modal-number">${window.currentPhoneNumber}</div>
                </div>
                <div class="phone-modal-buttons">
                    <button class="phone-modal-cancel" onclick="this.closest('.phone-modal-overlay').remove()">Cancelar</button>
                    <button class="phone-modal-save" onclick="savePhoneContact()">Salvar</button>
                </div>
            </div>
        `;
        elements.appContainer.appendChild(modal);
    };
    
    window.savePhoneContact = function() {
        const name = document.getElementById('contactNameInput').value.trim();
        if (!name) return;
        
        state.contacts.push({
            id: window.currentPhoneNumber,
            name: name,
            phone: window.currentPhoneNumber,
            avatar: '',
            lastMessage: '',
            time: formatTime(),
            timestamp: Date.now(),
            unread: 0,
            online: false,
            isGroup: false
        });
        
        document.querySelector('.phone-modal-overlay').remove();
        window.clearPhoneNumber();
    };
}

// ============================================
// DOUBLE GAME - Sem emoji de estatísticas
// ============================================

function renderDouble() {
    let selectedColor = null;
    let hasBet = false;
    let isSpinning = false;
    let mode = 'normal';
    let timeLeft = 15;
    let timerInterval = null;
    let betAmount = 24;
    let modalType = null;
    let spinPosition = 0;
    
    if (state.doubleHistory.length === 0) {
        state.doubleHistory = [
            { number: 5, color: 'red' },
            { number: 8, color: 'black' },
            { number: 4, color: 'red' },
            { number: 1, color: 'red' },
            { number: 12, color: 'black' },
            { number: 9, color: 'black' },
            { number: 13, color: 'black' }
        ];
    }
    
    let currentDice = [
        getRandomDoubleResult(),
        getRandomDoubleResult(),
        getRandomDoubleResult(),
        getRandomDoubleResult(),
        getRandomDoubleResult()
    ];
    
    function getRandomDoubleResult() {
        const number = Math.floor(Math.random() * 15);
        let color;
        if (number === 0) color = 'white';
        else if (number <= 7) color = 'red';
        else color = 'black';
        return { number, color };
    }
    
    function formatTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function getDiceColorStyle(color) {
        if (color === 'red') return 'background:#FF0032;color:white;';
        if (color === 'black') return 'background:#0D0D0D;border:1px solid #333;color:white;';
        return 'background:white;color:#0D0D0D;';
    }
    
    function render() {
        elements.appContainer.innerHTML = `
            <div class="double-game-app">
                <button class="double-close-btn" onclick="closeApp()">✕</button>
                
                ${modalType ? `
                    <div class="double-modal-overlay">
                        <div class="double-modal">
                            <h3 class="double-modal-title">${modalType === 'deposit' ? 'Depositar' : 'Sacar'}</h3>
                            <div class="double-modal-input-group">
                                <span class="double-modal-label">Valor (R$)</span>
                                <input type="text" inputmode="decimal" id="modalInput" class="double-modal-input" placeholder="0.00" autofocus>
                            </div>
                            ${modalType === 'withdraw' ? `<p class="double-modal-hint">Saldo disponível: R$ ${state.doubleBalance.toFixed(2)}</p>` : ''}
                            <div class="double-modal-buttons">
                                <button class="double-modal-btn cancel" onclick="closeDoubleModal()">Cancelar</button>
                                <button class="double-modal-btn confirm" onclick="confirmDoubleModal()">Confirmar</button>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="double-header-bar">
                    <button class="double-wallet-btn" onclick="openDoubleModal('withdraw')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                    </button>
                    <div class="double-balance-pill">
                        <span class="double-balance-text">R$ ${state.doubleBalance.toFixed(2)}</span>
                        <div class="double-balance-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                    </div>
                    <button class="double-deposit-btn" onclick="openDoubleModal('deposit')">Depositar</button>
                </div>
                
                <div class="double-history-bar">
                    <div class="double-history-items">
                        ${state.doubleHistory.slice(0, 7).map(item => `
                            <div class="double-dice-item small" style="${getDiceColorStyle(item.color)}">${item.number}</div>
                        `).join('')}
                    </div>
                    <button class="double-stats-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </button>
                </div>
                
                <div class="double-timer-bar">
                    <span class="double-timer-text">${isSpinning ? 'Girando...' : `Girando Em ${formatTimer(timeLeft)}`}</span>
                </div>
                
                <div class="double-carousel-container">
                    <div class="double-carousel" id="doubleCarousel" style="transform:translateX(${isSpinning ? -spinPosition * 16 : 0}px);">
                        ${currentDice.map((dice, index) => {
                            const isCenter = index === 2;
                            return `<div class="double-dice-item ${isCenter ? 'large center' : 'medium'}" style="${getDiceColorStyle(dice.color)}${isCenter ? '' : 'opacity:0.5;'}">${dice.number}</div>`;
                        }).join('')}
                    </div>
                    <div class="double-selector-frame">
                        <div class="double-selector-arrow top"></div>
                        <div class="double-selector-arrow bottom"></div>
                    </div>
                </div>
                
                <div class="double-controls-panel">
                    <div class="double-mode-tabs">
                        <button class="double-mode-tab ${mode === 'normal' ? 'active' : ''}" onclick="setDoubleMode('normal')">Normal</button>
                        <button class="double-mode-tab ${mode === 'auto' ? 'active' : ''}" onclick="setDoubleMode('auto')">Auto</button>
                    </div>
                    
                    <div class="double-bet-row">
                        <div class="double-bet-input-group">
                            <span class="double-bet-label">Quantia</span>
                            <input type="text" inputmode="decimal" id="doubleBetInput" class="double-bet-input" value="${betAmount}">
                        </div>
                        <span class="double-currency">R$</span>
                        <button class="double-bet-action" onclick="halveDoubleBet()">½</button>
                        <button class="double-bet-action" onclick="doubleDoubleBet()">2x</button>
                    </div>
                    
                    <div class="double-color-selection">
                        <span class="double-color-label">Selecionar Cor</span>
                        <div class="double-color-buttons">
                            <button class="double-color-btn red ${selectedColor === 'red' ? 'selected' : ''} ${hasBet ? 'disabled' : ''}" onclick="selectDoubleColor('red')">x2</button>
                            <button class="double-color-btn white ${selectedColor === 'white' ? 'selected' : ''} ${hasBet ? 'disabled' : ''}" onclick="selectDoubleColor('white')">x14</button>
                            <button class="double-color-btn black ${selectedColor === 'black' ? 'selected' : ''} ${hasBet ? 'disabled' : ''}" onclick="selectDoubleColor('black')">x2</button>
                        </div>
                    </div>
                    
                    <button class="double-start-btn ${canStartGame() ? '' : 'disabled'}" onclick="startDoubleGame()" ${canStartGame() ? '' : 'disabled'}>
                        ${hasBet ? 'Aposta feita' : 'Começar o jogo'}
                    </button>
                </div>
            </div>
        `;
        
        const betInput = document.getElementById('doubleBetInput');
        if (betInput) {
            betInput.addEventListener('input', (e) => {
                betAmount = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
            });
        }
    }
    
    function canStartGame() {
        return selectedColor && betAmount > 0 && betAmount <= state.doubleBalance && !isSpinning && !hasBet;
    }
    
    window.openDoubleModal = (type) => { modalType = type; render(); };
    window.closeDoubleModal = () => { modalType = null; render(); };
    
    window.confirmDoubleModal = () => {
        const input = document.getElementById('modalInput');
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) return;
        
        if (modalType === 'deposit') state.doubleBalance += value;
        else if (modalType === 'withdraw') {
            if (value > state.doubleBalance) return;
            state.doubleBalance -= value;
        }
        
        modalType = null;
        render();
    };
    
    window.setDoubleMode = (m) => { mode = m; render(); };
    window.halveDoubleBet = () => { betAmount = Math.max(betAmount / 2, 1); render(); };
    window.doubleDoubleBet = () => { betAmount = Math.min(betAmount * 2, state.doubleBalance); render(); };
    window.selectDoubleColor = (color) => { if (!hasBet) { selectedColor = color; render(); } };
    window.startDoubleGame = () => { if (canStartGame()) { state.doubleBalance -= betAmount; hasBet = true; render(); } };
    
    function handleSpin() {
        if (isSpinning) return;
        
        isSpinning = true;
        spinPosition = 0;
        
        const newDice = [];
        for (let i = 0; i < 20; i++) newDice.push(getRandomDoubleResult());
        currentDice = newDice;
        render();
        
        let pos = 0;
        const spinInterval = setInterval(() => {
            pos += 1;
            spinPosition = pos;
            
            const carousel = document.getElementById('doubleCarousel');
            if (carousel) carousel.style.transform = `translateX(${-pos * 16}px)`;
            
            if (pos >= 15) {
                clearInterval(spinInterval);
                
                const result = newDice[10];
                
                if (selectedColor === result.color) {
                    const multiplier = result.color === 'white' ? 14 : 2;
                    state.doubleBalance += (betAmount * multiplier);
                }
                
                state.doubleHistory.unshift(result);
                state.doubleHistory = state.doubleHistory.slice(0, 20);
                
                setTimeout(() => {
                    isSpinning = false;
                    timeLeft = 15;
                    selectedColor = null;
                    hasBet = false;
                    currentDice = [getRandomDoubleResult(), getRandomDoubleResult(), result, getRandomDoubleResult(), getRandomDoubleResult()];
                    render();
                }, 1000);
            }
        }, 100);
    }
    
    timerInterval = setInterval(() => {
        if (!isSpinning && timeLeft > 0) {
            timeLeft--;
            const timerText = document.querySelector('.double-timer-text');
            if (timerText) timerText.textContent = `Girando Em ${formatTimer(timeLeft)}`;
            if (timeLeft === 0) handleSpin();
        }
    }, 1000);
    
    render();
}

// ============================================
// PLACEHOLDER APPS
// ============================================

function renderPlaceholder(appName) {
    elements.appContainer.innerHTML = `
        <div class="placeholder-app">
            <button class="placeholder-close" onclick="closeApp()">✕</button>
            <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
            <p>Em desenvolvimento...</p>
        </div>
    `;
}

console.log('[Celular2] Script carregado!');

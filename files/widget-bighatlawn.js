(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  var CONFIG = {
    tenantId:    '1d7a261e-5e86-4037-b28a-8b7d7e583c8f',
    apiBase:     'https://512ai-backend-production.up.railway.app/api/v1',
    apiKey:      '512ai_713664dd917ee4ee35dfc569e109703f',
    brandColor:  '#2E7D32',
    brandHover:  '#1B5E20',
    brandName:   'Big Hat Lawn',
    greeting:    "Hi! I'm the Big Hat Lawn assistant. I can help you get an estimate or schedule a service. What can I help you with today?",
    widgetId:    'bighatlawn-widget'
  };

  // ─── Session ID ────────────────────────────────────────────────────────────
  function getSessionId() {
    var key = 'bighatlawn_session_id';
    var id = sessionStorage.getItem(key);
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  var SESSION_ID = getSessionId();

  // ─── Conversation context (for booking extraction) ─────────────────────────
  var conversationHistory = [];

  // ─── CSS ───────────────────────────────────────────────────────────────────
  var CSS = [
    '#bhl-launcher {',
    '  position: fixed; bottom: 24px; right: 24px; z-index: 99998;',
    '  width: 56px; height: 56px; border-radius: 50%;',
    '  background: ' + CONFIG.brandColor + '; color: #fff;',
    '  border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.28);',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: background .2s, transform .2s;',
    '  font-family: inherit;',
    '}',
    '#bhl-launcher:hover { background: ' + CONFIG.brandHover + '; transform: scale(1.08); }',
    '#bhl-launcher svg { width: 28px; height: 28px; }',

    '#bhl-panel {',
    '  position: fixed; bottom: 92px; right: 24px; z-index: 99999;',
    '  width: 380px; max-height: 580px;',
    '  background: #fff; border-radius: 16px;',
    '  box-shadow: 0 8px 40px rgba(0,0,0,.22);',
    '  display: flex; flex-direction: column;',
    '  overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
    '  transition: opacity .25s, transform .25s;',
    '  opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none;',
    '}',
    '#bhl-panel.bhl-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }',

    '#bhl-header {',
    '  background: ' + CONFIG.brandColor + '; color: #fff;',
    '  padding: 14px 16px; display: flex; align-items: center; gap: 10px;',
    '  flex-shrink: 0;',
    '}',
    '#bhl-header svg { width: 32px; height: 32px; flex-shrink: 0; }',
    '#bhl-header-text { flex: 1; }',
    '#bhl-header-title { font-size: 15px; font-weight: 700; margin: 0; line-height: 1.2; }',
    '#bhl-header-sub { font-size: 11px; opacity: .85; margin: 2px 0 0; }',
    '#bhl-close-btn {',
    '  background: none; border: none; color: #fff; cursor: pointer;',
    '  padding: 4px; border-radius: 50%; line-height: 0;',
    '  transition: background .15s;',
    '}',
    '#bhl-close-btn:hover { background: rgba(255,255,255,.2); }',
    '#bhl-close-btn svg { width: 18px; height: 18px; }',

    '#bhl-messages {',
    '  flex: 1; overflow-y: auto; padding: 16px; display: flex;',
    '  flex-direction: column; gap: 10px;',
    '  scroll-behavior: smooth;',
    '}',
    '#bhl-messages::-webkit-scrollbar { width: 4px; }',
    '#bhl-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }',

    '.bhl-msg { max-width: 82%; word-wrap: break-word; animation: bhlFadeIn .2s ease; }',
    '.bhl-msg-bot { align-self: flex-start; }',
    '.bhl-msg-user { align-self: flex-end; }',
    '.bhl-bubble {',
    '  padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.45;',
    '}',
    '.bhl-msg-bot .bhl-bubble {',
    '  background: #f0f4f0; color: #1a1a1a;',
    '  border-bottom-left-radius: 4px;',
    '}',
    '.bhl-msg-user .bhl-bubble {',
    '  background: ' + CONFIG.brandColor + '; color: #fff;',
    '  border-bottom-right-radius: 4px;',
    '}',

    '.bhl-booking-card {',
    '  background: #e8f5e9; border: 1px solid #a5d6a7;',
    '  border-radius: 12px; padding: 12px 14px; font-size: 13px; color: #1b5e20;',
    '  margin-top: 4px;',
    '}',
    '.bhl-booking-card strong { display: block; margin-bottom: 4px; font-size: 14px; }',

    '.bhl-typing {',
    '  align-self: flex-start; display: flex; align-items: center;',
    '  gap: 4px; padding: 10px 14px;',
    '  background: #f0f4f0; border-radius: 18px; border-bottom-left-radius: 4px;',
    '}',
    '.bhl-dot {',
    '  width: 7px; height: 7px; border-radius: 50%; background: #888;',
    '  animation: bhlBounce 1.2s infinite;',
    '}',
    '.bhl-dot:nth-child(2) { animation-delay: .2s; }',
    '.bhl-dot:nth-child(3) { animation-delay: .4s; }',

    '#bhl-footer {',
    '  padding: 10px 12px; border-top: 1px solid #e8e8e8;',
    '  display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;',
    '}',
    '#bhl-input {',
    '  flex: 1; border: 1px solid #d0d0d0; border-radius: 20px;',
    '  padding: 9px 14px; font-size: 14px; outline: none; resize: none;',
    '  line-height: 1.4; max-height: 100px; overflow-y: auto;',
    '  transition: border-color .15s; font-family: inherit;',
    '}',
    '#bhl-input:focus { border-color: ' + CONFIG.brandColor + '; }',
    '#bhl-send {',
    '  width: 38px; height: 38px; border-radius: 50%; border: none;',
    '  background: ' + CONFIG.brandColor + '; color: #fff; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
    '  transition: background .2s, transform .15s;',
    '}',
    '#bhl-send:hover:not(:disabled) { background: ' + CONFIG.brandHover + '; transform: scale(1.08); }',
    '#bhl-send:disabled { opacity: .5; cursor: not-allowed; }',
    '#bhl-send svg { width: 18px; height: 18px; }',

    '@keyframes bhlBounce {',
    '  0%,60%,100% { transform: translateY(0); }',
    '  30% { transform: translateY(-5px); }',
    '}',
    '@keyframes bhlFadeIn {',
    '  from { opacity: 0; transform: translateY(4px); }',
    '  to   { opacity: 1; transform: translateY(0); }',
    '}',

    '@media (max-width: 479px) {',
    '  #bhl-launcher { bottom: 16px; right: 16px; }',
    '  #bhl-panel {',
    '    bottom: 0; right: 0; left: 0;',
    '    width: 100%; max-height: 85vh;',
    '    border-radius: 20px 20px 0 0;',
    '  }',
    '}'
  ].join('\n');

  // ─── SVG icons ─────────────────────────────────────────────────────────────
  var LAWN_ICON = '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.15)"/>' +
    '<circle cx="18" cy="11" r="4" fill="#FFF176"/>' +
    '<line x1="18" y1="4" x2="18" y2="6" stroke="#FFF176" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="18" y1="16" x2="18" y2="18" stroke="#FFF176" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="11" y1="11" x2="13" y2="11" stroke="#FFF176" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="23" y1="11" x2="25" y2="11" stroke="#FFF176" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M9 28 Q10 22 11 28" stroke="#A5D6A7" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M12 28 Q13.5 20 15 28" stroke="#81C784" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M16 28 Q18 19 20 28" stroke="#66BB6A" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M21 28 Q22.5 20 24 28" stroke="#81C784" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M25 28 Q26 22 27 28" stroke="#A5D6A7" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<rect x="7" y="28" width="22" height="2.5" rx="1.25" fill="#4CAF50"/>' +
    '</svg>';

  var CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  var CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  var SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
    '</svg>';

  // ─── DOM helpers ───────────────────────────────────────────────────────────
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ─── Inject styles ─────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('bhl-styles')) return;
    var style = el('style', { id: 'bhl-styles' }, CSS);
    document.head.appendChild(style);
  }

  // ─── Build DOM ─────────────────────────────────────────────────────────────
  var panel, messagesEl, inputEl, sendBtn, typingEl;
  var isOpen = false;
  var isBusy = false;

  function buildWidget() {
    // Launcher button
    var launcher = el('button', { id: 'bhl-launcher', 'aria-label': 'Open Big Hat Lawn chat' }, CHAT_ICON);
    document.body.appendChild(launcher);

    // Panel
    panel = el('div', { id: 'bhl-panel', role: 'dialog', 'aria-label': CONFIG.brandName + ' Chat' });

    // Header
    var header = el('div', { id: 'bhl-header' });
    header.innerHTML =
      LAWN_ICON +
      '<div id="bhl-header-text">' +
        '<p id="bhl-header-title">' + CONFIG.brandName + '</p>' +
        '<p id="bhl-header-sub">&#127807; Lawn Care Assistant &bull; Online now</p>' +
      '</div>';
    var closeBtn = el('button', { id: 'bhl-close-btn', 'aria-label': 'Close chat' }, CLOSE_ICON);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Messages
    messagesEl = el('div', { id: 'bhl-messages', 'aria-live': 'polite' });
    panel.appendChild(messagesEl);

    // Footer
    var footer = el('div', { id: 'bhl-footer' });
    inputEl = el('textarea', { id: 'bhl-input', placeholder: 'Type your message\u2026', rows: '1', 'aria-label': 'Chat message input' });
    sendBtn = el('button', { id: 'bhl-send', 'aria-label': 'Send message' }, SEND_ICON);
    footer.appendChild(inputEl);
    footer.appendChild(sendBtn);
    panel.appendChild(footer);

    document.body.appendChild(panel);

    // Events
    launcher.addEventListener('click', function () { togglePanel(true); });
    closeBtn.addEventListener('click', function () { togglePanel(false); });
    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  // ─── Panel open/close ──────────────────────────────────────────────────────
  var greetingShown = false;

  function togglePanel(open) {
    isOpen = open;
    if (open) {
      panel.classList.add('bhl-open');
      setTimeout(function () { inputEl.focus(); }, 50);
      if (!greetingShown) {
        greetingShown = true;
        addMessage('bot', CONFIG.greeting);
        conversationHistory.push({ role: 'assistant', content: CONFIG.greeting });
      }
    } else {
      panel.classList.remove('bhl-open');
    }
    notifyDebug();
  }

  // ─── Message rendering ─────────────────────────────────────────────────────
  function addMessage(role, text) {
    var wrapper = el('div', { class: 'bhl-msg bhl-msg-' + (role === 'bot' ? 'bot' : 'user') });
    var bubble = el('div', { class: 'bhl-bubble' });
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollBottom();
    return wrapper;
  }

  function addBookingCard(info) {
    var card = el('div', { class: 'bhl-booking-card' });
    card.innerHTML =
      '<strong>&#10003; Booking Confirmed!</strong>' +
      (info.customerName   ? '<span>Name: '    + escHtml(info.customerName)   + '</span><br>' : '') +
      (info.serviceType    ? '<span>Service: ' + escHtml(info.serviceType)    + '</span><br>' : '') +
      (info.preferredDate  ? '<span>Date: '    + escHtml(info.preferredDate)  + '</span><br>' : '') +
      (info.preferredTime  ? '<span>Time: '    + escHtml(info.preferredTime)  + '</span><br>' : '') +
      (info.address        ? '<span>Address: ' + escHtml(info.address)        + '</span><br>' : '');
    messagesEl.appendChild(card);
    scrollBottom();
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showTyping() {
    typingEl = el('div', { class: 'bhl-typing' });
    typingEl.innerHTML = '<div class="bhl-dot"></div><div class="bhl-dot"></div><div class="bhl-dot"></div>';
    messagesEl.appendChild(typingEl);
    scrollBottom();
  }

  function hideTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── API call ──────────────────────────────────────────────────────────────
  function sendToAPI(message) {
    isBusy = true;
    sendBtn.disabled = true;
    showTyping();

    var body = JSON.stringify({
      tenantId:  CONFIG.tenantId,
      sessionId: SESSION_ID,
      message:   message
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/chat', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', CONFIG.apiKey);
    xhr.timeout = 30000;

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      hideTyping();
      isBusy = false;
      sendBtn.disabled = false;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var reply = data.reply || '(No reply received)';
          notifyDebug(reply);

          var displayReply = reply.replace(/\[BOOKING_CONFIRMED\]/g, '').trim();
          addMessage('bot', displayReply);
          conversationHistory.push({ role: 'assistant', content: reply });

          if (reply.indexOf('[BOOKING_CONFIRMED]') !== -1) {
            var bookingInfo = extractBookingInfo();
            if (bookingInfo) {
              addBookingCard(bookingInfo);
              fireBookingAPI(bookingInfo);
            }
          }
        } catch (e) {
          addMessage('bot', 'Sorry, I had trouble reading the response. Please try again.');
          notifyDebug('Parse error: ' + e.message);
        }
      } else {
        addMessage('bot', 'Sorry, something went wrong (Error ' + xhr.status + '). Please try again.');
        notifyDebug('HTTP ' + xhr.status + ': ' + xhr.responseText);
      }
    };

    xhr.ontimeout = function () {
      hideTyping();
      isBusy = false;
      sendBtn.disabled = false;
      addMessage('bot', 'Request timed out. Please check your connection and try again.');
      notifyDebug('Request timed out');
    };

    xhr.onerror = function () {
      hideTyping();
      isBusy = false;
      sendBtn.disabled = false;
      addMessage('bot', 'Network error. Please check your connection and try again.');
      notifyDebug('Network error');
    };

    xhr.send(body);
  }

  // ─── Booking extraction ────────────────────────────────────────────────────
  function extractBookingInfo() {
    var fullText = conversationHistory.map(function (m) { return m.content; }).join('\n');

    function match(patterns) {
      for (var i = 0; i < patterns.length; i++) {
        var m = fullText.match(patterns[i]);
        if (m) return m[1].trim();
      }
      return '';
    }

    var name = match([
      /(?:my name is|name:|customer[:\s]+|i am|i'm)\s+([A-Za-z]+(?: [A-Za-z]+)+)/i,
      /([A-Z][a-z]+ [A-Z][a-z]+) (?:here|calling|speaking)/i
    ]);
    var phone = match([
      /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/,
      /phone[:\s]+(\d[\d\s.\-()]+)/i
    ]);
    var service = match([
      /(?:service[:\s]+|need|want|schedule|book)\s+(lawn mow(?:ing)?|mow(?:ing)?|trim(?:ming)?|fertiliz(?:ation|e|ing)?|aerat(?:ion|e|ing)?|sod(?:ding)?|landscap(?:ing|e)?|clean[- ]?up|leaf removal|overseeding|sprinkler|irrigation|edging)[a-z]*/i
    ]) || extractServiceFromHistory(fullText);
    var date = match([
      /(?:on|for|date[:\s]+)\s*((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[^\n,]{1,30})/i,
      /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/
    ]);
    var time = match([
      /(?:at|time[:\s]+)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
    ]);
    var address = match([
      /(?:address[:\s]+|at |located at |live at )\s*(\d+[^,\n]{5,60})/i
    ]);

    return {
      customerName:  name,
      customerPhone: phone,
      serviceType:   service,
      preferredDate: date,
      preferredTime: time,
      address:       address
    };
  }

  function extractServiceFromHistory(fullText) {
    var services = ['mowing', 'mow', 'trim', 'fertiliz', 'aerat', 'sodding', 'landscaping', 'clean-up', 'cleanup', 'leaf removal', 'overseeding', 'sprinkler', 'irrigation', 'edging'];
    var lc = fullText.toLowerCase();
    for (var i = 0; i < services.length; i++) {
      if (lc.indexOf(services[i]) !== -1) return services[i];
    }
    return 'Lawn Service';
  }

  // ─── Booking API ───────────────────────────────────────────────────────────
  function fireBookingAPI(info) {
    var body = JSON.stringify({
      tenantId:      CONFIG.tenantId,
      customerName:  info.customerName,
      customerPhone: info.customerPhone,
      serviceType:   info.serviceType,
      preferredDate: info.preferredDate,
      preferredTime: info.preferredTime,
      address:       info.address
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/bookings', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', CONFIG.apiKey);
    xhr.timeout = 15000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('[BigHatLawn] Booking API success:', xhr.responseText);
      } else {
        console.warn('[BigHatLawn] Booking API error:', xhr.status, xhr.responseText);
      }
    };
    xhr.onerror = function () { console.warn('[BigHatLawn] Booking network error'); };
    xhr.send(body);
  }

  // ─── Send handler ──────────────────────────────────────────────────────────
  function handleSend() {
    var text = inputEl.value.trim();
    if (!text || isBusy) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    addMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });
    sendToAPI(text);
  }

  // ─── Debug bridge ─────────────────────────────────────────────────────────
  function notifyDebug(lastReply) {
    try {
      window.dispatchEvent(new CustomEvent('bhl-debug', {
        detail: { sessionId: SESSION_ID, lastReply: lastReply || '', isOpen: isOpen }
      }));
    } catch (e) {}
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('bhl-initialized')) return;
    document.body.appendChild(el('div', { id: 'bhl-initialized', style: 'display:none' }));
    injectStyles();
    buildWidget();
    window.BHL_SESSION_ID = SESSION_ID;
    notifyDebug();
    console.log('[BigHatLawn] Widget initialized. Session:', SESSION_ID);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

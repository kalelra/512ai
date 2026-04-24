/**
 * Big Hat Lawn — Embeddable Chat Widget v1.1
 * Drop-in script. Zero dependencies. Works on any website.
 * CDN: https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js
 */
(function () {
  'use strict';

  // ─── Config (edit these to customise) ────────────────────────────────────────
  var CONFIG = {
    tenantId:         '1d7a261e-5e86-4037-b28a-8b7d7e583c8f',
    apiBase:          'https://512ai-backend-production.up.railway.app/api/v1',
    apiKey:           '512ai_db1fa21876bb6de02e7e6e3198d6c21e8f41a319',
    brandColor:       '#2E7D32',
    brandHover:       '#1B5E20',
    brandName:        'Big Hat Lawn',
    brandTagline:     '\uD83C\uDF3F Lawn Care Assistant \u2022 Online now',
    greeting:         "Hi! I\u2019m the Big Hat Lawn assistant \uD83C\uDF3F We serve Austin\u2019s southeast side (78742, 78617, 78719, 78747, 78744, 78748, 78652, 78745 \u0026 more). I can give you a quick price estimate or help you schedule a visit. What can I help you with today?",
    proactiveMsgDelay: 8000,   // ms before proactive tooltip appears (0 = disabled)
    proactiveMsg:     "Serving SE Austin Mon\u2013Fri 8\u20135. Get a lawn quote in 2 minutes! \uD83D\uDC4B",
    sessionKey:       'bhl_sid',
    storageType:      'local'  // 'local' = persists across tabs | 'session' = tab-only
  };

  // ─── Session ID (localStorage so it persists across page reloads) ─────────────
  function getSessionId() {
    var store = CONFIG.storageType === 'local' ? localStorage : sessionStorage;
    var id = null;
    try { id = store.getItem(CONFIG.sessionKey); } catch (e) {}
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      try { store.setItem(CONFIG.sessionKey, id); } catch (e) {}
    }
    return id;
  }
  var SESSION_ID = getSessionId();

  // ─── State ────────────────────────────────────────────────────────────────────
  var conversationHistory = [];
  var panel, messagesEl, inputEl, sendBtn, typingEl, badge, proactiveEl;
  var isOpen = false;
  var isBusy = false;
  var greetingShown = false;
  var unreadCount = 0;
  var proactiveShown = false;

  // ─── CSS ─────────────────────────────────────────────────────────────────────
  var CSS = [
    /* Launcher */
    '#bhl-launcher{position:fixed;bottom:24px;right:24px;z-index:2147483646;',
    '  width:60px;height:60px;border-radius:50%;',
    '  background:' + CONFIG.brandColor + ';color:#fff;',
    '  border:none;cursor:pointer;',
    '  box-shadow:0 4px 20px rgba(0,0,0,.32);',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:background .2s,transform .2s,box-shadow .2s;',
    '  font-family:inherit;outline:none;}',
    '#bhl-launcher:hover{background:' + CONFIG.brandHover + ';transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.38);}',
    '#bhl-launcher svg{width:28px;height:28px;transition:transform .3s;}',
    '#bhl-launcher.bhl-is-open svg{transform:rotate(90deg);}',

    /* Unread badge */
    '#bhl-badge{position:absolute;top:-4px;right:-4px;',
    '  background:#E53935;color:#fff;',
    '  border-radius:50%;min-width:20px;height:20px;',
    '  font-size:11px;font-weight:700;line-height:20px;text-align:center;',
    '  padding:0 4px;border:2px solid #fff;',
    '  display:none;animation:bhlPop .2s ease;}',
    '#bhl-badge.bhl-show{display:block;}',

    /* Proactive tooltip */
    '#bhl-proactive{position:fixed;bottom:96px;right:24px;z-index:2147483645;',
    '  background:#fff;border-radius:12px;padding:12px 14px;',
    '  box-shadow:0 4px 20px rgba(0,0,0,.18);',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    '  font-size:14px;color:#1a1a1a;max-width:240px;line-height:1.4;',
    '  animation:bhlSlideUp .3s ease;cursor:pointer;}',
    '#bhl-proactive::after{content:"";position:absolute;bottom:-8px;right:24px;',
    '  border:8px solid transparent;border-top:8px solid #fff;border-bottom:0;',
    '  filter:drop-shadow(0 2px 2px rgba(0,0,0,.12));}',
    '#bhl-proactive-close{float:right;margin-left:8px;cursor:pointer;',
    '  color:#aaa;font-size:16px;line-height:1;background:none;border:none;padding:0;}',
    '#bhl-proactive-close:hover{color:#555;}',

    /* Panel */
    '#bhl-panel{position:fixed;bottom:96px;right:24px;z-index:2147483647;',
    '  width:380px;max-height:600px;',
    '  background:#fff;border-radius:20px;',
    '  box-shadow:0 10px 48px rgba(0,0,0,.24);',
    '  display:flex;flex-direction:column;',
    '  overflow:hidden;',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    '  transition:opacity .25s,transform .25s;',
    '  opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;}',
    '#bhl-panel.bhl-open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}',

    /* Header */
    '#bhl-header{background:' + CONFIG.brandColor + ';color:#fff;',
    '  padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#bhl-header-icon{width:38px;height:38px;flex-shrink:0;border-radius:50%;',
    '  background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;}',
    '#bhl-header-icon svg{width:26px;height:26px;}',
    '#bhl-header-text{flex:1;min-width:0;}',
    '#bhl-header-title{font-size:15px;font-weight:700;margin:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#bhl-header-sub{font-size:11px;opacity:.85;margin:2px 0 0;}',
    '#bhl-header-actions{display:flex;gap:4px;flex-shrink:0;}',
    '.bhl-hbtn{background:none;border:none;color:#fff;cursor:pointer;',
    '  padding:5px;border-radius:50%;line-height:0;transition:background .15s;}',
    '.bhl-hbtn:hover{background:rgba(255,255,255,.2);}',
    '.bhl-hbtn svg{width:16px;height:16px;}',

    /* Online dot */
    '#bhl-header-sub::before{content:"";display:inline-block;',
    '  width:7px;height:7px;border-radius:50%;',
    '  background:#69f542;margin-right:5px;vertical-align:middle;',
    '  box-shadow:0 0 0 2px rgba(105,245,66,.3);',
    '  animation:bhlPulse 2s infinite;}',

    /* Messages */
    '#bhl-messages{flex:1;overflow-y:auto;padding:16px;',
    '  display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
    '#bhl-messages::-webkit-scrollbar{width:4px;}',
    '#bhl-messages::-webkit-scrollbar-thumb{background:#d0d0d0;border-radius:4px;}',

    /* Message bubbles */
    '.bhl-msg{max-width:85%;word-wrap:break-word;animation:bhlFadeIn .2s ease;}',
    '.bhl-msg-bot{align-self:flex-start;}',
    '.bhl-msg-user{align-self:flex-end;}',
    '.bhl-bubble{padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;}',
    '.bhl-msg-bot .bhl-bubble{background:#f0f5f0;color:#1a1a1a;border-bottom-left-radius:4px;}',
    '.bhl-msg-user .bhl-bubble{background:' + CONFIG.brandColor + ';color:#fff;border-bottom-right-radius:4px;}',
    '.bhl-timestamp{font-size:10px;color:#aaa;margin-top:3px;text-align:right;}',
    '.bhl-msg-bot .bhl-timestamp{text-align:left;}',

    /* Booking confirmation card */
    '.bhl-booking-card{background:#e8f5e9;border:1.5px solid #a5d6a7;',
    '  border-radius:14px;padding:14px 16px;font-size:13px;color:#1b5e20;',
    '  margin-top:4px;animation:bhlFadeIn .3s ease;}',
    '.bhl-booking-card strong{display:block;margin-bottom:6px;font-size:14px;font-weight:700;}',
    '.bhl-booking-row{display:flex;gap:6px;margin:2px 0;font-size:13px;}',
    '.bhl-booking-label{opacity:.7;min-width:60px;}',

    /* Typing indicator */
    '.bhl-typing{align-self:flex-start;display:flex;align-items:center;',
    '  gap:5px;padding:12px 16px;',
    '  background:#f0f5f0;border-radius:18px;border-bottom-left-radius:4px;}',
    '.bhl-dot{width:7px;height:7px;border-radius:50%;background:#999;',
    '  animation:bhlBounce 1.2s infinite;}',
    '.bhl-dot:nth-child(2){animation-delay:.2s;}',
    '.bhl-dot:nth-child(3){animation-delay:.4s;}',

    /* Powered-by bar */
    '#bhl-powered{text-align:center;padding:6px;font-size:10px;color:#bbb;',
    '  flex-shrink:0;border-top:1px solid #f0f0f0;}',
    '#bhl-powered a{color:#bbb;text-decoration:none;}',
    '#bhl-powered a:hover{color:#888;}',

    /* Footer input area */
    '#bhl-footer{padding:10px 12px;border-top:1px solid #ebebeb;',
    '  display:flex;gap:8px;align-items:flex-end;flex-shrink:0;background:#fff;}',
    '#bhl-input{flex:1;border:1.5px solid #ddd;border-radius:22px;',
    '  padding:10px 16px;font-size:14px;outline:none;resize:none;',
    '  line-height:1.4;max-height:100px;overflow-y:auto;',
    '  transition:border-color .15s;font-family:inherit;background:#fafafa;}',
    '#bhl-input:focus{border-color:' + CONFIG.brandColor + ';background:#fff;}',
    '#bhl-input::placeholder{color:#bbb;}',
    '#bhl-send{width:40px;height:40px;border-radius:50%;border:none;',
    '  background:' + CONFIG.brandColor + ';color:#fff;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    '  transition:background .2s,transform .15s,opacity .2s;}',
    '#bhl-send:hover:not(:disabled){background:' + CONFIG.brandHover + ';transform:scale(1.1);}',
    '#bhl-send:disabled{opacity:.4;cursor:not-allowed;}',
    '#bhl-send svg{width:18px;height:18px;}',

    /* Keyframes */
    '@keyframes bhlBounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}',
    '@keyframes bhlFadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}',
    '@keyframes bhlPop{0%{transform:scale(0);}60%{transform:scale(1.2);}100%{transform:scale(1);}}',
    '@keyframes bhlSlideUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}',
    '@keyframes bhlPulse{0%,100%{opacity:1;}50%{opacity:.5;}}',

    /* Mobile: full-screen bottom sheet */
    '@media(max-width:479px){',
    '  #bhl-launcher{bottom:16px;right:16px;width:54px;height:54px;}',
    '  #bhl-panel{bottom:0;right:0;left:0;top:auto;',
    '    width:100%;max-height:88dvh;border-radius:24px 24px 0 0;}',
    '  #bhl-proactive{right:16px;bottom:84px;max-width:220px;}',
    '  #bhl-badge{top:-3px;right:-3px;}',
    '}'
  ].join('');

  // ─── SVG icons ────────────────────────────────────────────────────────────────
  var ICON = {
    lawn: '<svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="9" r="4" fill="#FFF176"/>' +
      '<path d="M7 24Q8 18 9 24" stroke="#A5D6A7" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M10 24Q11.5 17 13 24" stroke="#81C784" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M14 24Q16 16 18 24" stroke="#66BB6A" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M19 24Q20.5 17 22 24" stroke="#81C784" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<rect x="6" y="24" width="16" height="2" rx="1" fill="#4CAF50"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="5" y1="12" x2="19" y2="12"/></svg>'
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function timeLabel() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  // ─── Inject CSS ──────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('bhl-styles')) return;
    document.head.appendChild(el('style', { id: 'bhl-styles' }, CSS));
  }

  // ─── Build Widget DOM ────────────────────────────────────────────────────────
  function buildWidget() {
    // Launcher wrapper (needed for badge positioning)
    var wrap = el('div', { id: 'bhl-wrap', style: 'position:fixed;bottom:24px;right:24px;z-index:2147483646' });

    var launcher = el('button', { id: 'bhl-launcher', 'aria-label': 'Open Big Hat Lawn chat' }, ICON.chat);
    badge = el('span', { id: 'bhl-badge', 'aria-hidden': 'true' }, '1');
    wrap.appendChild(launcher);
    wrap.appendChild(badge);
    document.body.appendChild(wrap);

    // Panel
    panel = el('div', { id: 'bhl-panel', role: 'dialog', 'aria-label': CONFIG.brandName + ' Chat', 'aria-modal': 'true' });

    // Header
    var header = el('div', { id: 'bhl-header' });
    var iconBox = el('div', { id: 'bhl-header-icon' }, ICON.lawn);
    var textBox = el('div', { id: 'bhl-header-text' });
    textBox.innerHTML = '<p id="bhl-header-title">' + esc(CONFIG.brandName) + '</p>' +
                        '<p id="bhl-header-sub">' + CONFIG.brandTagline + '</p>';
    var actions = el('div', { id: 'bhl-header-actions' });
    var minBtn = el('button', { class: 'bhl-hbtn', 'aria-label': 'Minimize chat', id: 'bhl-min-btn' }, ICON.minimize);
    var closeBtn = el('button', { class: 'bhl-hbtn', 'aria-label': 'Close chat', id: 'bhl-close-btn' }, ICON.close);
    actions.appendChild(minBtn);
    actions.appendChild(closeBtn);
    header.appendChild(iconBox);
    header.appendChild(textBox);
    header.appendChild(actions);
    panel.appendChild(header);

    // Messages
    messagesEl = el('div', { id: 'bhl-messages', 'aria-live': 'polite' });
    panel.appendChild(messagesEl);

    // Powered-by
    var powered = el('div', { id: 'bhl-powered' });
    powered.innerHTML = 'Powered by <a href="https://512ai.co" target="_blank" rel="noopener">512ai.co</a>';
    panel.appendChild(powered);

    // Footer
    var footer = el('div', { id: 'bhl-footer' });
    inputEl = el('textarea', {
      id: 'bhl-input',
      placeholder: 'Message Big Hat Lawn\u2026',
      rows: '1',
      'aria-label': 'Chat message'
    });
    sendBtn = el('button', { id: 'bhl-send', 'aria-label': 'Send', disabled: 'disabled' }, ICON.send);
    footer.appendChild(inputEl);
    footer.appendChild(sendBtn);
    panel.appendChild(footer);

    document.body.appendChild(panel);

    // ── Events ────────────────────────────────────────────────────────────────
    launcher.addEventListener('click', function () { togglePanel(!isOpen); });
    minBtn.addEventListener('click', function () { togglePanel(false); });
    closeBtn.addEventListener('click', function () { togglePanel(false); });
    sendBtn.addEventListener('click', handleSend);

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
      sendBtn.disabled = !this.value.trim();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !wrap.contains(e.target)) {
        togglePanel(false);
      }
    });

    // Keyboard: Escape to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) togglePanel(false);
    });

    // Proactive trigger
    if (CONFIG.proactiveMsgDelay > 0) {
      setTimeout(showProactive, CONFIG.proactiveMsgDelay);
    }

    // Show unread badge immediately (greeting pending)
    setBadge(1);
  }

  // ─── Proactive bubble ────────────────────────────────────────────────────────
  function showProactive() {
    if (isOpen || proactiveShown) return;
    proactiveShown = true;
    proactiveEl = el('div', { id: 'bhl-proactive' });
    var closeBtn = el('button', { id: 'bhl-proactive-close', 'aria-label': 'Dismiss' }, '\u00D7');
    proactiveEl.appendChild(closeBtn);
    proactiveEl.appendChild(document.createTextNode(CONFIG.proactiveMsg));
    document.body.appendChild(proactiveEl);

    proactiveEl.addEventListener('click', function (e) {
      if (e.target !== closeBtn) togglePanel(true);
      dismissProactive();
    });
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dismissProactive();
    });

    // Auto-dismiss after 12s
    setTimeout(dismissProactive, 12000);
  }

  function dismissProactive() {
    if (proactiveEl && proactiveEl.parentNode) {
      proactiveEl.style.opacity = '0';
      proactiveEl.style.transition = 'opacity .2s';
      setTimeout(function () {
        if (proactiveEl && proactiveEl.parentNode) proactiveEl.parentNode.removeChild(proactiveEl);
      }, 200);
    }
  }

  // ─── Badge ────────────────────────────────────────────────────────────────────
  function setBadge(n) {
    unreadCount = n;
    if (n > 0 && !isOpen) {
      badge.textContent = n > 9 ? '9+' : String(n);
      badge.classList.add('bhl-show');
    } else {
      badge.classList.remove('bhl-show');
    }
  }

  // ─── Panel toggle ─────────────────────────────────────────────────────────────
  function togglePanel(open) {
    isOpen = open;
    var launcher = document.getElementById('bhl-launcher');
    if (open) {
      panel.classList.add('bhl-open');
      launcher.classList.add('bhl-is-open');
      launcher.innerHTML = ICON.close;
      setBadge(0);
      dismissProactive();
      setTimeout(function () { inputEl.focus(); }, 80);
      if (!greetingShown) {
        greetingShown = true;
        addMessage('bot', CONFIG.greeting);
        conversationHistory.push({ role: 'assistant', content: CONFIG.greeting });
      }
    } else {
      panel.classList.remove('bhl-open');
      launcher.classList.remove('bhl-is-open');
      launcher.innerHTML = ICON.chat;
    }
    notifyDebug();
  }

  // ─── Render messages ──────────────────────────────────────────────────────────
  function addMessage(role, text) {
    var isBot = role === 'bot';
    var wrapper = el('div', { class: 'bhl-msg bhl-msg-' + (isBot ? 'bot' : 'user') });
    var bubble = el('div', { class: 'bhl-bubble' });
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    // Timestamp
    var ts = el('div', { class: 'bhl-timestamp' });
    ts.textContent = timeLabel();
    wrapper.appendChild(ts);
    messagesEl.appendChild(wrapper);
    scrollBottom();
    return wrapper;
  }

  function addBookingCard(info) {
    var card = el('div', { class: 'bhl-booking-card' });
    var rows = [
      ['Name', info.customerName],
      ['Phone', info.customerPhone],
      ['Service', info.serviceType],
      ['Date', info.preferredDate],
      ['Time', info.preferredTime],
      ['Address', info.address]
    ].filter(function (r) { return r[1]; });

    card.innerHTML = '<strong>\u2713 Booking Confirmed!</strong>' +
      rows.map(function (r) {
        return '<div class="bhl-booking-row"><span class="bhl-booking-label">' +
          esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>';
      }).join('');
    messagesEl.appendChild(card);
    scrollBottom();
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
  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  // ─── API: chat ────────────────────────────────────────────────────────────────
  function sendToAPI(message) {
    isBusy = true;
    sendBtn.disabled = true;
    showTyping();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/chat', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', CONFIG.apiKey);
    xhr.timeout = 30000;

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      hideTyping();
      isBusy = false;
      sendBtn.disabled = !inputEl.value.trim();

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var reply = data.reply || '(No reply received)';
          notifyDebug(reply);

          var display = reply.replace(/\[BOOKING_CONFIRMED\]/g, '').trim();
          addMessage('bot', display);
          conversationHistory.push({ role: 'assistant', content: reply });

          // Show badge if panel is closed
          if (!isOpen) setBadge(unreadCount + 1);

          if (reply.indexOf('[BOOKING_CONFIRMED]') !== -1) {
            var info = extractBookingInfo();
            addBookingCard(info);
            fireBookingAPI(info);
          }
        } catch (e) {
          addMessage('bot', 'Sorry, I had trouble reading the response. Please try again.');
          notifyDebug('Parse error: ' + e.message);
        }
      } else {
        addMessage('bot', 'Something went wrong (Error ' + xhr.status + '). Please try again.');
        notifyDebug('HTTP ' + xhr.status + ': ' + xhr.responseText);
      }
    };
    xhr.ontimeout = function () {
      hideTyping(); isBusy = false; sendBtn.disabled = !inputEl.value.trim();
      addMessage('bot', 'Request timed out. Please try again.');
      notifyDebug('Request timed out');
    };
    xhr.onerror = function () {
      hideTyping(); isBusy = false; sendBtn.disabled = !inputEl.value.trim();
      addMessage('bot', 'Connection issue. Please check your internet and try again.');
      notifyDebug('Network error');
    };
    xhr.send(JSON.stringify({ tenantId: CONFIG.tenantId, sessionId: SESSION_ID, message: message }));
  }

  // ─── Booking info extraction ──────────────────────────────────────────────────
  function extractBookingInfo() {
    var text = conversationHistory.map(function (m) { return m.content; }).join('\n');
    function match(patterns) {
      for (var i = 0; i < patterns.length; i++) {
        var m = text.match(patterns[i]);
        if (m) return m[1].trim();
      }
      return '';
    }
    var serviceKeywords = ['mowing','mow','trim','fertiliz','aerat','sodding',
      'landscaping','cleanup','clean-up','leaf removal','overseeding',
      'sprinkler','irrigation','edging','pruning','power wash'];
    var service = match([
      /(?:service[:\s]+|need|want|schedule|book)\s+(lawn mow\w*|mow\w*|trim\w*|fertiliz\w*|aerat\w*|sod\w*|landscap\w*|clean[-\s]?up|leaf removal|overseeding|sprinkler|irrigation|edging|pruning|power\s?wash\w*)/i
    ]);
    if (!service) {
      var lc = text.toLowerCase();
      for (var i = 0; i < serviceKeywords.length; i++) {
        if (lc.indexOf(serviceKeywords[i]) !== -1) { service = serviceKeywords[i]; break; }
      }
    }
    return {
      customerName:  match([/(?:my name is|name[:\s]+|i am|i'm)\s+([A-Za-z]+(?: [A-Za-z]+)+)/i]),
      customerPhone: match([/(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/, /phone[:\s]+(\d[\d\s.\-()]+)/i]),
      serviceType:   service || 'Lawn Service',
      preferredDate: match([
        /(?:on|for|date[:\s]+)\s*((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[^\n,]{1,30})/i,
        /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/
      ]),
      preferredTime: match([/(?:at|time[:\s]+)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i]),
      address:       match([/(?:address[:\s]+|at |located at |live at )\s*(\d+[^,\n]{5,60})/i])
    };
  }

  // ─── API: bookings ────────────────────────────────────────────────────────────
  function fireBookingAPI(info) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/bookings', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', CONFIG.apiKey);
    xhr.timeout = 15000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('[BigHatLawn] Booking confirmed:', xhr.responseText);
      } else {
        console.warn('[BigHatLawn] Booking API error:', xhr.status, xhr.responseText);
      }
    };
    xhr.onerror = function () { console.warn('[BigHatLawn] Booking network error'); };
    xhr.send(JSON.stringify({
      tenantId:      CONFIG.tenantId,
      customerName:  info.customerName,
      customerPhone: info.customerPhone,
      serviceType:   info.serviceType,
      preferredDate: info.preferredDate,
      preferredTime: info.preferredTime,
      address:       info.address
    }));
  }

  // ─── Send handler ─────────────────────────────────────────────────────────────
  function handleSend() {
    var text = inputEl.value.trim();
    if (!text || isBusy) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    addMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });
    sendToAPI(text);
  }

  // ─── Debug bridge (for widget-test.html) ──────────────────────────────────────
  function notifyDebug(lastReply) {
    try {
      window.dispatchEvent(new CustomEvent('bhl-debug', {
        detail: { sessionId: SESSION_ID, lastReply: lastReply || '', isOpen: isOpen }
      }));
    } catch (e) {}
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('bhl-initialized')) return;
    document.body.appendChild(el('div', { id: 'bhl-initialized', style: 'display:none' }));
    injectStyles();
    buildWidget();
    window.BHL_SESSION_ID = SESSION_ID;
    window.BHL_OPEN = function () { togglePanel(true); };
    window.BHL_CLOSE = function () { togglePanel(false); };
    notifyDebug();
    console.log('[BigHatLawn] Widget v1.1 ready. Session:', SESSION_ID);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

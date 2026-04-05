/*!
 * Big Hat Lawn — Voice AI Widget v1.0
 * Embeddable click-to-call widget powered by 512AI + Bland.ai
 * Drop-in: <script src="voice-bighatlawn.js" defer></script>
 * Works alongside widget-bighatlawn.js (chat) — different button position
 */
(function () {
  'use strict';

  /* ─── CONFIG (update phone/apiKey when ready) ─── */
  var CONFIG = {
    apiBase:      'https://512ai-backend-production.up.railway.app/api/v1',
    apiKey:       '512ai_713664dd917ee4ee35dfc569e109703f',
    tenantId:     '1d7a261e-5e86-4037-b28a-8b7d7e583c8f',
    brandColor:   '#2E7D32',
    brandHover:   '#1B5E20',
    brandName:    'Big Hat Lawn',
    // Twilio number Bland.ai calls FROM (set when Rudy's phone is wired up)
    fromPhone:    '+15126472949',
    // Position: 'right' puts it above the chat bubble; 'left' puts it bottom-left
    position:     'right',
    // Bottom offset — stacks above chat widget (which is 24px)
    bottomOffset: '92px',
  };

  /* ─── Prevent double-init ─── */
  if (window.__BHL_VOICE_INIT__) return;
  window.__BHL_VOICE_INIT__ = true;

  /* ─── Inject CSS ─── */
  var style = document.createElement('style');
  style.textContent = [
    /* Launcher */
    '#bhl-voice-launcher{',
    '  position:fixed;',
    '  bottom:' + CONFIG.bottomOffset + ';',
    '  right:24px;',
    '  width:52px;height:52px;',
    '  border-radius:50%;',
    '  background:' + CONFIG.brandColor + ';',
    '  box-shadow:0 4px 16px rgba(0,0,0,.28);',
    '  border:none;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;',
    '  z-index:2147483645;',
    '  transition:background .2s,transform .2s;',
    '  outline:none;',
    '}',
    '#bhl-voice-launcher:hover{background:' + CONFIG.brandHover + ';transform:scale(1.08);}',
    '#bhl-voice-launcher svg{width:22px;height:22px;fill:#fff;pointer-events:none;}',
    /* Pulse ring on launcher */
    '#bhl-voice-launcher::before{',
    '  content:"";position:absolute;',
    '  width:52px;height:52px;border-radius:50%;',
    '  background:' + CONFIG.brandColor + ';opacity:.35;',
    '  animation:bhlVPulse 2.2s ease-out infinite;',
    '}',
    '@keyframes bhlVPulse{0%{transform:scale(1);opacity:.35}100%{transform:scale(1.9);opacity:0}}',
    /* Tooltip label */
    '#bhl-voice-tip{',
    '  position:fixed;bottom:calc(' + CONFIG.bottomOffset + ' + 14px);right:82px;',
    '  background:rgba(0,0,0,.75);color:#fff;',
    '  font:500 12px/1 -apple-system,sans-serif;',
    '  padding:6px 10px;border-radius:6px;',
    '  white-space:nowrap;pointer-events:none;',
    '  z-index:2147483645;',
    '  opacity:0;transition:opacity .2s;',
    '}',
    '#bhl-voice-launcher:hover + #bhl-voice-tip{opacity:1;}',
    /* Modal overlay */
    '#bhl-voice-overlay{',
    '  position:fixed;inset:0;',
    '  background:rgba(0,0,0,.45);',
    '  z-index:2147483646;',
    '  display:flex;align-items:center;justify-content:center;',
    '  opacity:0;pointer-events:none;',
    '  transition:opacity .2s;',
    '}',
    '#bhl-voice-overlay.bhl-v-open{opacity:1;pointer-events:all;}',
    /* Modal card */
    '#bhl-voice-card{',
    '  background:#fff;border-radius:16px;',
    '  padding:28px 24px 24px;',
    '  width:320px;max-width:calc(100vw - 40px);',
    '  box-shadow:0 20px 60px rgba(0,0,0,.22);',
    '  transform:translateY(12px) scale(.97);',
    '  transition:transform .25s cubic-bezier(.34,1.56,.64,1);',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    '}',
    '#bhl-voice-overlay.bhl-v-open #bhl-voice-card{transform:translateY(0) scale(1);}',
    /* Card header */
    '.bhl-v-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;}',
    '.bhl-v-icon-wrap{',
    '  width:44px;height:44px;border-radius:50%;',
    '  background:' + CONFIG.brandColor + ';',
    '  display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    '}',
    '.bhl-v-icon-wrap svg{width:20px;height:20px;fill:#fff;}',
    '.bhl-v-title{font-size:16px;font-weight:700;color:#111;margin:0;}',
    '.bhl-v-sub{font-size:12px;color:#666;margin:2px 0 0;}',
    /* Form */
    '.bhl-v-field{margin-bottom:14px;}',
    '.bhl-v-label{display:block;font-size:12px;font-weight:600;color:#444;margin-bottom:5px;}',
    '.bhl-v-input{',
    '  width:100%;box-sizing:border-box;',
    '  border:1.5px solid #ddd;border-radius:8px;',
    '  padding:10px 12px;',
    '  font-size:14px;color:#111;',
    '  outline:none;transition:border .15s;',
    '}',
    '.bhl-v-input:focus{border-color:' + CONFIG.brandColor + ';}',
    /* Call button */
    '#bhl-v-call-btn{',
    '  width:100%;padding:12px;',
    '  background:' + CONFIG.brandColor + ';color:#fff;',
    '  border:none;border-radius:10px;',
    '  font-size:15px;font-weight:600;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;gap:8px;',
    '  transition:background .15s,opacity .15s;',
    '  margin-top:4px;',
    '}',
    '#bhl-v-call-btn:hover:not(:disabled){background:' + CONFIG.brandHover + ';}',
    '#bhl-v-call-btn:disabled{opacity:.6;cursor:not-allowed;}',
    '#bhl-v-call-btn svg{width:16px;height:16px;fill:#fff;}',
    /* Close button */
    '#bhl-v-close{',
    '  position:absolute;top:14px;right:14px;',
    '  width:28px;height:28px;border:none;background:none;',
    '  cursor:pointer;border-radius:50%;',
    '  display:flex;align-items:center;justify-content:center;',
    '  color:#999;font-size:18px;line-height:1;',
    '}',
    '#bhl-v-close:hover{background:#f0f0f0;color:#333;}',
    /* Status states */
    '#bhl-v-status{',
    '  margin-top:14px;padding:12px;',
    '  border-radius:8px;font-size:13px;text-align:center;',
    '  display:none;',
    '}',
    '#bhl-v-status.bhl-v-calling{',
    '  background:#e8f5e9;color:#2E7D32;display:block;',
    '}',
    '#bhl-v-status.bhl-v-error{',
    '  background:#ffebee;color:#c62828;display:block;',
    '}',
    '#bhl-v-status.bhl-v-success{',
    '  background:#e8f5e9;color:#2E7D32;display:block;',
    '}',
    /* Dots loader */
    '.bhl-v-dots span{',
    '  display:inline-block;width:6px;height:6px;',
    '  border-radius:50%;background:currentColor;margin:0 2px;',
    '  animation:bhlVDot .8s infinite alternate;',
    '}',
    '.bhl-v-dots span:nth-child(2){animation-delay:.15s;}',
    '.bhl-v-dots span:nth-child(3){animation-delay:.3s;}',
    '@keyframes bhlVDot{0%{opacity:.3;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}',
    /* Disclaimer */
    '.bhl-v-disc{font-size:11px;color:#aaa;text-align:center;margin-top:12px;}',
    /* Relative wrapper for close btn */
    '#bhl-voice-card{position:relative;}',
    /* Mobile */
    '@media(max-width:479px){',
    '  #bhl-voice-overlay{align-items:flex-end;}',
    '  #bhl-voice-card{width:100%;border-radius:16px 16px 0 0;padding:24px 20px 32px;}',
    '  #bhl-voice-tip{display:none;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  /* ─── Build DOM ─── */
  // Launcher button
  var launcher = document.createElement('button');
  launcher.id = 'bhl-voice-launcher';
  launcher.setAttribute('aria-label', 'Call Big Hat Lawn AI Assistant');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>';
  document.body.appendChild(launcher);

  // Hover tooltip
  var tip = document.createElement('span');
  tip.id = 'bhl-voice-tip';
  tip.textContent = 'Talk to an AI assistant';
  document.body.appendChild(tip);

  // Modal overlay
  var overlay = document.createElement('div');
  overlay.id = 'bhl-voice-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'AI Voice Call');

  overlay.innerHTML = [
    '<div id="bhl-voice-card">',
    '  <button id="bhl-v-close" aria-label="Close">&times;</button>',
    '  <div class="bhl-v-header">',
    '    <div class="bhl-v-icon-wrap">',
    '      <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>',
    '    </div>',
    '    <div>',
    '      <p class="bhl-v-title">Talk to Our AI Assistant</p>',
    '      <p class="bhl-v-sub">Get a quote in 60 seconds — we call you</p>',
    '    </div>',
    '  </div>',
    '  <div class="bhl-v-field">',
    '    <label class="bhl-v-label" for="bhl-v-name">Your First Name</label>',
    '    <input class="bhl-v-input" id="bhl-v-name" type="text" placeholder="e.g. John" autocomplete="given-name" />',
    '  </div>',
    '  <div class="bhl-v-field">',
    '    <label class="bhl-v-label" for="bhl-v-phone">Your Phone Number</label>',
    '    <input class="bhl-v-input" id="bhl-v-phone" type="tel" placeholder="(512) 555-0100" autocomplete="tel" />',
    '  </div>',
    '  <button id="bhl-v-call-btn">',
    '    <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>',
    '    Call Me Now — It\'s Free',
    '  </button>',
    '  <div id="bhl-v-status"></div>',
    '  <p class="bhl-v-disc">AI-powered • Austin TX • Available 24/7</p>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  /* ─── State ─── */
  var isOpen = false;
  var isCalling = false;

  /* ─── Helpers ─── */
  function open() {
    isOpen = true;
    overlay.classList.add('bhl-v-open');
    document.getElementById('bhl-v-name').focus();
  }

  function close() {
    isOpen = false;
    overlay.classList.remove('bhl-v-open');
    resetStatus();
  }

  function resetStatus() {
    var s = document.getElementById('bhl-v-status');
    s.className = '';
    s.innerHTML = '';
    s.style.display = 'none';
    var btn = document.getElementById('bhl-v-call-btn');
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg> Call Me Now — It\'s Free';
    isCalling = false;
  }

  function setStatus(type, msg) {
    var s = document.getElementById('bhl-v-status');
    s.className = 'bhl-v-' + type;
    s.innerHTML = msg;
  }

  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits[0] === '1') return '+' + digits;
    return null;
  }

  /* ─── Voice call trigger ─── */
  function initiateCall(name, phone) {
    if (isCalling) return;
    isCalling = true;

    var btn = document.getElementById('bhl-v-call-btn');
    btn.disabled = true;
    btn.innerHTML = 'Connecting <span class="bhl-v-dots"><span></span><span></span><span></span></span>';

    setStatus('calling', '📞 Reaching out to Bland.ai — your phone will ring in 15-30 seconds…');

    var payload = JSON.stringify({
      tenantId: CONFIG.tenantId,
      phone:    phone,
      name:     name,
      source:   'bighatlawn_voice_widget',
      fromPhone: CONFIG.fromPhone
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/voice/call', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', CONFIG.apiKey);
    xhr.timeout = 30000;

    xhr.onload = function () {
      try {
        var res = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && res.success) {
          setStatus('success', '✅ Calling you now! Pick up in the next 30 seconds 📱');
          btn.innerHTML = '✅ Call Initiated';
          // Close after 5s
          setTimeout(function () { close(); }, 5000);
        } else {
          setStatus('error', '⚠️ ' + (res.error || 'Something went wrong. Please try again.'));
          btn.disabled = false;
          btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg> Try Again';
          isCalling = false;
        }
      } catch (e) {
        setStatus('error', '⚠️ Connection error. Please try the chat widget instead.');
        btn.disabled = false;
        isCalling = false;
      }
    };

    xhr.onerror = xhr.ontimeout = function () {
      setStatus('error', '⚠️ Network error. Please try the chat widget instead.');
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg> Try Again';
      isCalling = false;
    };

    xhr.send(payload);
  }

  /* ─── Event listeners ─── */
  launcher.addEventListener('click', function () {
    isOpen ? close() : open();
  });

  document.getElementById('bhl-v-close').addEventListener('click', close);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.getElementById('bhl-v-call-btn').addEventListener('click', function () {
    var name  = (document.getElementById('bhl-v-name').value || '').trim();
    var rawPhone = (document.getElementById('bhl-v-phone').value || '').trim();

    if (!name) {
      document.getElementById('bhl-v-name').focus();
      setStatus('error', '⚠️ Please enter your first name.');
      return;
    }
    var phone = formatPhone(rawPhone);
    if (!phone) {
      document.getElementById('bhl-v-phone').focus();
      setStatus('error', '⚠️ Please enter a valid 10-digit US phone number.');
      return;
    }

    initiateCall(name, phone);
  });

  // Enter key on either field
  ['bhl-v-name', 'bhl-v-phone'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('bhl-v-call-btn').click();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) close();
  });

  /* ─── Global API ─── */
  window.BHL_VOICE_OPEN  = open;
  window.BHL_VOICE_CLOSE = close;

  // Debug event
  function dbg(event, data) {
    document.dispatchEvent(new CustomEvent('bhl-voice-debug', { detail: { event: event, data: data } }));
  }

  dbg('init', { version: '1.0', apiBase: CONFIG.apiBase });

})();

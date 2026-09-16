// Parvenu Hostess Client Widget (NuNu Edition with 48h Persistence & Reset)
(function() {
  const API_ENDPOINT = 'https://parvenu-hostess-api.netlify.app/.netlify/functions/chat';
  const STORAGE_KEY = 'parvenu_nunu_session_v1';
  const STORAGE_TTL_MS = 48 * 60 * 60 * 1000; // 48 uur

  const INITIAL_MESSAGE = 'Welkom bij Parvenu 💜 Ik bewaak hier de voordeur. Vertel me: wat voor software, app of website wil je laten bouwen?';

  // HTML Structure
  const widgetHtml = `
    <button id="nunu-toggle-btn" class="nunu-toggle-btn" aria-label="Praat met NuNu">
      <img src="images/nunu-avatar.jpg" class="nunu-btn-avatar" alt="NuNu">
      <span class="nunu-dot"></span>
      <span>Praat met NuNu 💜</span>
    </button>

    <div id="nunu-chat-window" class="nunu-chat-window">
      <div class="nunu-chat-bg"></div>
      
      <div class="nunu-header">
        <div class="nunu-title-wrap">
          <img src="images/nunu-avatar.jpg" class="nunu-header-avatar" alt="NuNu">
          <div>
            <div class="nunu-title">NuNu 💜</div>
            <div class="nunu-subtitle">Parvenu Hostess · Online</div>
          </div>
        </div>
        <div class="nunu-actions">
          <button id="nunu-reset-btn" class="nunu-reset-btn" title="Nieuw gesprek beginnen">↺</button>
          <button id="nunu-close-btn" class="nunu-close-btn" aria-label="Sluit chat">✕</button>
        </div>
      </div>

      <div id="nunu-messages" class="nunu-messages"></div>

      <div class="nunu-footer">
        <form id="nunu-form" class="nunu-form" onsubmit="window.nunuSubmit(event)">
          <input type="text" id="nunu-input" class="nunu-input" placeholder="Typ je vraag aan NuNu..." autocomplete="off">
          <button type="submit" id="nunu-send-btn" class="nunu-send-btn">➔</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  const toggleBtn = document.getElementById('nunu-toggle-btn');
  const chatWindow = document.getElementById('nunu-chat-window');
  const closeBtn = document.getElementById('nunu-close-btn');
  const resetBtn = document.getElementById('nunu-reset-btn');
  const messagesBox = document.getElementById('nunu-messages');
  const inputEl = document.getElementById('nunu-input');
  const sendBtn = document.getElementById('nunu-send-btn');

  let history = [];

  // 1. Inladen of Herstellen van de Sessie (48h Persistence)
  function initSession() {
    messagesBox.innerHTML = '';
    const saved = localStorage.getItem(STORAGE_KEY);
    let restored = false;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.updatedAt && (Date.now() - parsed.updatedAt < STORAGE_TTL_MS) && Array.isArray(parsed.history)) {
          history = parsed.history;
          renderFullHistory();
          restored = true;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (!restored) {
      history = [{ role: 'assistant', content: INITIAL_MESSAGE }];
      renderInitialGreeting();
      saveSession();
    }
  }

  function saveSession() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        updatedAt: Date.now(),
        history: history
      }));
    } catch (e) {}
  }

  function renderInitialGreeting() {
    const bubble = document.createElement('div');
    bubble.className = 'nunu-bubble bot';
    bubble.innerHTML = `
      <div class="sender-label">NuNu · Hostess</div>
      ${escapeHtml(INITIAL_MESSAGE)}
      <div class="nunu-chips" id="nunu-chips">
        <button class="nunu-chip" onclick="window.nunuAsk(this)">Wat kost een zakelijke website?</button>
        <button class="nunu-chip" onclick="window.nunuAsk(this)">Kunnen jullie ook mobiele apps bouwen?</button>
        <button class="nunu-chip" onclick="window.nunuAsk(this)">Hoe werkt de familie?</button>
      </div>
    `;
    messagesBox.appendChild(bubble);
  }

  function renderFullHistory() {
    messagesBox.innerHTML = '';
    history.forEach((msg, idx) => {
      const isBot = msg.role === 'assistant';
      const sender = isBot ? 'NuNu · Hostess' : 'Jij';
      const bubble = appendBubble(isBot ? 'bot' : 'user', sender, msg.content);

      if (isBot && idx >= 3 && idx === history.length - 1) {
        attachHandoffButton(bubble);
      }
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    initSession();
    inputEl.focus();
  });

  window.nunuAsk = function(btn) {
    const text = btn.innerText;
    const chipsContainer = document.getElementById('nunu-chips');
    if (chipsContainer) chipsContainer.remove();
    inputEl.value = text;
    window.nunuSubmit(new Event('submit'));
  };

  window.nunuSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    const chipsContainer = document.getElementById('nunu-chips');
    if (chipsContainer) chipsContainer.remove();

    appendBubble('user', 'Jij', text);
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;

    history.push({ role: 'user', content: text });
    saveSession();

    const typingBubble = appendBubble('bot', 'NuNu · Hostess', 'NuNu typt een antwoord...');

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      const reply = data.reply || 'Mijn excuses, er trad een kleine verbindingsfout op. Neem gerust direct contact met ons op via WhatsApp 💜.';
      
      typingBubble.innerHTML = `<div class="sender-label">NuNu · Hostess</div>${escapeHtml(reply)}`;
      history.push({ role: 'assistant', content: reply });
      saveSession();

      if (history.length >= 4) {
        attachHandoffButton(typingBubble);
      }

    } catch (err) {
      typingBubble.innerHTML = `<div class="sender-label">NuNu · Hostess</div>Er is momenteel even geen verbinding. Stuur gerust direct een WhatsApp-bericht 💜.`;
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  };

  function attachHandoffButton(parentBubble) {
    const existing = parentBubble.querySelector('.nunu-handoff-btn');
    if (existing) existing.remove();

    const userQuotes = history
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' · ');

    const waText = encodeURIComponent(`Hoi Tiëndo, ik sprak net met NuNu op de Parvenu site.\n\n📋 Mijn aanvraag:\n"${userQuotes}"\n\nGraag ontvang ik een vast voorstel op 1 A4.`);
    
    const handoffBtn = document.createElement('a');
    handoffBtn.className = 'nunu-handoff-btn';
    handoffBtn.href = `https://wa.me/31612345678?text=${waText}`;
    handoffBtn.target = '_blank';
    handoffBtn.rel = 'noopener';
    handoffBtn.innerHTML = `💬 Verstuur je briefing via WhatsApp ➔`;
    parentBubble.appendChild(handoffBtn);
  }

  function appendBubble(role, sender, text) {
    const div = document.createElement('div');
    div.className = `nunu-bubble ${role}`;
    div.innerHTML = `<div class="sender-label">${sender}</div>${escapeHtml(text)}`;
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    return div;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  initSession();
})();

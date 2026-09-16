// Parvenu Hostess Client Widget (Baby Nu)
(function() {
  const API_ENDPOINT = 'https://parvenu-hostess-api.netlify.app/.netlify/functions/chat';
  
  // HTML Structure
  const widgetHtml = `
    <button id="nunu-toggle-btn" class="nunu-toggle-btn" aria-label="Praat met NuNu">
      <span class="nunu-dot"></span>
      <span>Praat met NuNu 💜</span>
    </button>

    <div id="nunu-chat-window" class="nunu-chat-window">
      <div class="nunu-header">
        <div class="nunu-title-wrap">
          <span class="nunu-dot"></span>
          <div>
            <div class="nunu-title">NuNu 💜</div>
            <div class="nunu-subtitle">Parvenu Hostess · Online</div>
          </div>
        </div>
        <button id="nunu-close-btn" class="nunu-close-btn" aria-label="Sluit chat">✕</button>
      </div>

      <div id="nunu-messages" class="nunu-messages">
        <div class="nunu-bubble bot">
          <div class="sender-label">NuNu · Hostess</div>
          Welkom bij Parvenu 💜 Ik bewaak hier de voordeur. Vertel me: wat voor software, app of website wil je laten bouwen?
          <div class="nunu-chips" id="nunu-chips">
            <button class="nunu-chip" onclick="window.nunuAsk(this)">Wat kost een zakelijke website?</button>
            <button class="nunu-chip" onclick="window.nunuAsk(this)">Kunnen jullie ook mobiele apps bouwen?</button>
            <button class="nunu-chip" onclick="window.nunuAsk(this)">Hoe werkt de familie?</button>
          </div>
        </div>
      </div>

      <div class="nunu-footer">
        <form id="nunu-form" class="nunu-form" onsubmit="window.nunuSubmit(event)">
          <input type="text" id="nunu-input" class="nunu-input" placeholder="Typ je vraag..." autocomplete="off">
          <button type="submit" id="nunu-send-btn" class="nunu-send-btn">➔</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  const toggleBtn = document.getElementById('nunu-toggle-btn');
  const chatWindow = document.getElementById('nunu-chat-window');
  const closeBtn = document.getElementById('nunu-close-btn');
  const messagesBox = document.getElementById('nunu-messages');
  const inputEl = document.getElementById('nunu-input');
  const sendBtn = document.getElementById('nunu-send-btn');

  let history = [
    { role: 'assistant', content: 'Welkom bij Parvenu 💜 Ik bewaak hier de voordeur. Vertel me: wat voor software, app of website wil je laten bouwen?' }
  ];

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
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

    // Remove chips if present
    const chipsContainer = document.getElementById('nunu-chips');
    if (chipsContainer) chipsContainer.remove();

    // User message
    appendBubble('user', 'Jij', text);
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;

    history.push({ role: 'user', content: text });

    // Typing bubble
    const typingBubble = appendBubble('bot', 'NuNu · Hostess', 'NuNu denkt na...');

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry schat, ik kon het even niet verstaan. Stuur ons een WhatsAppje 💜.';
      
      typingBubble.innerHTML = `<div class="sender-label">NuNu · Hostess</div>${escapeHtml(reply)}`;
      history.push({ role: 'assistant', content: reply });

      // If user has exchanged 2+ messages, offer WhatsApp handoff
      if (history.length >= 4) {
        const waText = encodeURIComponent(`Hoi Tiëndo, ik sprak net met NuNu op de site over: "${text}"`);
        const handoffBtn = document.createElement('a');
        handoffBtn.className = 'nunu-handoff-btn';
        handoffBtn.href = `https://wa.me/31633468428?text=${waText}`;
        handoffBtn.target = '_blank';
        handoffBtn.rel = 'noopener';
        handoffBtn.innerHTML = `💬 Stuur door naar WhatsApp van de Baas ➔`;
        typingBubble.appendChild(handoffBtn);
      }

    } catch (err) {
      typingBubble.innerHTML = `<div class="sender-label">NuNu · Hostess</div>Even geen verbinding schat. Stuur ons gerust direct een WhatsAppje 💜.`;
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  };

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
})();

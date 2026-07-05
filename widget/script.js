const BACKEND_URL = "PASTE_YOUR_RENDER_URL_HERE";

const ENDPOINTS = {
  chat: "/chat",
  recipes: "/recipes",
};

const GREETINGS = {
  chat: "Hi! I'm here to help with shipping, refunds, products, or anything else about Thekua Company. What can I help with?",
  recipes: "Hey there! I'm your Thekua Kitchen Companion 🍯 Ask me for chai pairings, recipes, or festive serving ideas!",
};

const toggleBtn = document.getElementById("chat-toggle");
const closeBtn = document.getElementById("chat-close");
const panel = document.getElementById("chat-panel");
const messagesEl = document.getElementById("chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const tabButtons = document.querySelectorAll(".tab-btn");

let currentMode = "chat";
const conversationHistory = { chat: [], recipes: [] };
const greeted = { chat: false, recipes: false };

function addMessage(mode, role, text) {
  conversationHistory[mode].push({ role, text });
  if (mode === currentMode) {
    renderMessage(role, text);
  }
}

function renderMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function renderCurrentMode() {
  messagesEl.innerHTML = "";
  conversationHistory[currentMode].forEach(({ role, text }) => renderMessage(role, text));
}

function ensureGreeting(mode) {
  if (!greeted[mode]) {
    greeted[mode] = true;
    addMessage(mode, "bot", GREETINGS[mode]);
  }
}

function buildApiHistory(mode) {
  if (mode !== "chat") return [];

  return conversationHistory.chat
    .filter((entry) => entry.role === "user" || entry.role === "bot")
    .map((entry) => ({
      role: entry.role === "bot" ? "assistant" : "user",
      content: entry.text,
    }));
}

const LEAD_TOKEN = "LEAD_CAPTURED:";

function captureLeadIfPresent(rawText) {
  const tokenIndex = rawText.indexOf(LEAD_TOKEN);
  if (tokenIndex === -1) return rawText;

  const visibleText = rawText.slice(0, tokenIndex).trim();
  const jsonPart = rawText.slice(tokenIndex + LEAD_TOKEN.length).trim();

  try {
    const lead = JSON.parse(jsonPart);
    if (lead && lead.name && lead.contact) {
      fetch(`${BACKEND_URL}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, contact: lead.contact }),
      }).catch(() => {});
    }
  } catch (err) {
    // Malformed token — just show the visible text, nothing to capture.
  }

  return visibleText;
}

toggleBtn.addEventListener("click", () => {
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) {
    ensureGreeting(currentMode);
    input.focus();
  }
});

closeBtn.addEventListener("click", () => {
  panel.classList.add("hidden");
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    renderCurrentMode();
    ensureGreeting(currentMode);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  const mode = currentMode;
  const historyForRequest = buildApiHistory(mode);
  addMessage(mode, "user", message);
  input.value = "";
  input.disabled = true;

  const typingBubble = renderMessage("typing", "...");

  try {
    const requestBody = mode === "chat" ? { message, history: historyForRequest } : { message };

    const response = await fetch(`${BACKEND_URL}${ENDPOINTS[mode]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    typingBubble.remove();

    if (!response.ok) {
      addMessage(mode, "error", data.error || "Something went wrong. Please try again.");
    } else {
      const displayText = mode === "chat" ? captureLeadIfPresent(data.reply) : data.reply;
      addMessage(mode, "bot", displayText);
    }
  } catch (err) {
    typingBubble.remove();
    addMessage(mode, "error", "Could not reach the server. Is the backend running?");
  } finally {
    input.disabled = false;
    input.focus();
  }
});

const BACKEND_URL = "https://ttc-chat-bot.vercel.app";

const ENDPOINTS = {
  chat: "/api/chat",
  recipes: "/api/recipes",
};

const GREETINGS = {
  chat: "Hi! I'm here to help with shipping, refunds, products, or anything else about Thekua Company. What can I help with?",
  recipes: "Hey there! I'm your Thekua Kitchen Companion 🍯 Ask me for chai pairings, recipes, or festive serving ideas!",
};

const toggleBtn = document.getElementById("chat-toggle");
const closeBtn = document.getElementById("chat-close");
const widget = document.getElementById("chat-widget");
const panel = document.getElementById("chat-panel");
const messagesEl = document.getElementById("chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const tabButtons = document.querySelectorAll(".tab-btn");

let currentMode = "chat";
const conversationHistory = { chat: [], recipes: [] };
const greeted = { chat: false, recipes: false };

function addMessage(mode, role, text, link = null) {
  conversationHistory[mode].push({ role, text, link });
  if (mode === currentMode) {
    renderMessage(role, text, link);
  }
}

function renderMessage(role, text, link = null) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;

  if (link && link.url && link.label) {
    const linkBtn = document.createElement("a");
    linkBtn.className = "msg-link-btn";
    linkBtn.href = link.url;
    linkBtn.textContent = link.label;
    linkBtn.target = "_blank";
    linkBtn.rel = "noopener noreferrer";
    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(linkBtn);
  }

  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function renderCurrentMode() {
  messagesEl.innerHTML = "";
  conversationHistory[currentMode].forEach(({ role, text, link }) => renderMessage(role, text, link));
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
      fetch(`${BACKEND_URL}/api/lead`, {
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

const PRODUCT_LINK_TOKEN = "PRODUCT_LINK:";
const PRODUCT_LINK_URL_PREFIX = "https://thekuacompany.com/product/";
const RAW_PRODUCT_URL_REGEX = /https:\/\/thekuacompany\.com\/product\/[^\s)]+/;

function extractProductLink(rawText) {
  const tokenIndex = rawText.indexOf(PRODUCT_LINK_TOKEN);

  if (tokenIndex !== -1) {
    const visibleText = rawText.slice(0, tokenIndex).trim();
    const jsonPart = rawText.slice(tokenIndex + PRODUCT_LINK_TOKEN.length).trim();

    try {
      const parsed = JSON.parse(jsonPart);
      if (parsed && parsed.label && parsed.url && parsed.url.startsWith(PRODUCT_LINK_URL_PREFIX)) {
        return { text: visibleText, link: { label: parsed.label, url: parsed.url } };
      }
    } catch (err) {
      // Malformed token — fall through to plain text below.
    }

    return { text: visibleText || rawText, link: null };
  }

  // Fallback: if Claude writes a bare product URL instead of the token, still make it clickable.
  const urlMatch = rawText.match(RAW_PRODUCT_URL_REGEX);
  if (urlMatch) {
    const url = urlMatch[0].replace(/[.,]+$/, "");
    const cleanedText = rawText.replace(urlMatch[0], "").replace(/[ \t]{2,}/g, " ").trim();
    return { text: cleanedText, link: { label: "View Product", url } };
  }

  return { text: rawText, link: null };
}

function toggleChatPanel() {
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) {
    ensureGreeting(currentMode);
    input.focus();
  }
}

document.addEventListener(
  "click",
  (event) => {
    const clickedToggle = event.target.closest("#chat-toggle");
    if (!clickedToggle || !widget.contains(clickedToggle)) return;

    event.preventDefault();
    event.stopPropagation();
    toggleChatPanel();
  },
  true
);

closeBtn.addEventListener("click", (event) => {
  event.preventDefault();
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
    } else if (mode === "chat") {
      const leadStripped = captureLeadIfPresent(data.reply);
      const { text: displayText, link } = extractProductLink(leadStripped);
      addMessage(mode, "bot", displayText, link);
    } else {
      addMessage(mode, "bot", data.reply);
    }
  } catch (err) {
    typingBubble.remove();
    addMessage(mode, "error", "Could not reach the server. Is the backend running?");
  } finally {
    input.disabled = false;
    input.focus();
  }
});

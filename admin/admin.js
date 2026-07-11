const PASSWORD_STORAGE_KEY = "ttcAdminPassword";
const SESSIONS_API_URL = "/api/admin/sessions";
const LOGS_API_URL = "/api/admin/logs";

const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logout-btn");

const sessionsView = document.getElementById("sessions-view");
const threadView = document.getElementById("thread-view");

const filterDate = document.getElementById("filter-date");
const filterMode = document.getElementById("filter-mode");
const applyFiltersBtn = document.getElementById("apply-filters-btn");
const sessionsMeta = document.getElementById("sessions-meta");
const sessionsTbody = document.getElementById("sessions-tbody");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const pageIndicator = document.getElementById("page-indicator");

const backToSessionsBtn = document.getElementById("back-to-sessions-btn");
const threadMeta = document.getElementById("thread-meta");
const threadMessages = document.getElementById("thread-messages");

let currentPage = 1;
let currentTotal = 0;
let currentPageSize = 30;

function getStoredPassword() {
  try {
    return localStorage.getItem(PASSWORD_STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

function storePassword(password) {
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, password);
  } catch (err) {}
}

function clearStoredPassword() {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch (err) {}
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  showSessionsView();
}

function showLogin(errorMessage) {
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  if (errorMessage) {
    loginError.textContent = errorMessage;
    loginError.classList.remove("hidden");
  } else {
    loginError.classList.add("hidden");
  }
}

function showSessionsView() {
  threadView.classList.add("hidden");
  sessionsView.classList.remove("hidden");
  loadSessions();
}

function showThreadView() {
  sessionsView.classList.add("hidden");
  threadView.classList.remove("hidden");
}

async function authorizedFetch(url) {
  const password = getStoredPassword();
  if (!password) throw new Error("unauthorized");

  const response = await fetch(url, {
    headers: { "x-admin-password": password },
  });

  if (response.status === 401) {
    throw new Error("unauthorized");
  }
  if (!response.ok) {
    throw new Error("request-failed");
  }

  return response.json();
}

function handleFetchError(err, metaEl) {
  if (err.message === "unauthorized") {
    clearStoredPassword();
    showLogin("Incorrect password.");
  } else if (metaEl) {
    metaEl.textContent = "Could not load data. Please try again.";
  }
}

async function loadSessions() {
  const params = new URLSearchParams();
  if (filterDate.value) params.set("date", filterDate.value);
  if (filterMode.value) params.set("mode", filterMode.value);
  params.set("page", currentPage);

  sessionsMeta.textContent = "Loading...";

  try {
    const result = await authorizedFetch(`${SESSIONS_API_URL}?${params.toString()}`);
    currentTotal = result.total || 0;
    currentPageSize = result.pageSize || 30;
    renderSessions(result.rows || []);

    const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
    sessionsMeta.textContent = `${currentTotal} session${currentTotal === 1 ? "" : "s"}`;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  } catch (err) {
    handleFetchError(err, sessionsMeta);
  }
}

function renderSessions(rows) {
  sessionsTbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.className = "session-row";
    tr.title = "Click to view full conversation";

    const startedTd = document.createElement("td");
    startedTd.textContent = new Date(row.started_at).toLocaleString();
    tr.appendChild(startedTd);

    const lastTd = document.createElement("td");
    lastTd.textContent = new Date(row.last_message_at).toLocaleString();
    tr.appendChild(lastTd);

    const countTd = document.createElement("td");
    countTd.textContent = row.message_count;
    tr.appendChild(countTd);

    const userTd = document.createElement("td");
    userTd.textContent = row.username || "—";
    tr.appendChild(userTd);

    const modeTd = document.createElement("td");
    modeTd.textContent = row.mode || "";
    tr.appendChild(modeTd);

    const locationTd = document.createElement("td");
    const locationParts = [row.city, row.region, row.country].filter(Boolean);
    locationTd.textContent = locationParts.length ? locationParts.join(", ") : "—";
    tr.appendChild(locationTd);

    tr.addEventListener("click", () => openThread(row.session_id));
    sessionsTbody.appendChild(tr);
  });
}

async function openThread(sessionId) {
  showThreadView();
  threadMeta.textContent = "Loading conversation...";
  threadMessages.innerHTML = "";

  try {
    const result = await authorizedFetch(
      `${LOGS_API_URL}?sessionId=${encodeURIComponent(sessionId)}&order=asc&page=1`
    );
    const rows = result.rows || [];

    if (!rows.length) {
      threadMeta.textContent = "No messages found for this session.";
      return;
    }

    const first = rows[0];
    const locationParts = [first.city, first.region, first.country].filter(Boolean);
    threadMeta.textContent = `${first.username || "Anonymous"} · ${
      locationParts.length ? locationParts.join(", ") : "Unknown location"
    } · ${rows.length} message${rows.length === 1 ? "" : "s"}`;

    rows.forEach((row) => {
      threadMessages.appendChild(buildThreadBubble("user", row.user_message, row.created_at));
      threadMessages.appendChild(buildThreadBubble("bot", row.bot_reply, row.created_at));
    });
  } catch (err) {
    handleFetchError(err, threadMeta);
  }
}

function buildThreadBubble(role, text, timestamp) {
  const bubble = document.createElement("div");
  bubble.className = `thread-bubble ${role}`;

  const textEl = document.createElement("div");
  textEl.className = "thread-bubble-text";
  textEl.textContent = text;
  bubble.appendChild(textEl);

  const timeEl = document.createElement("div");
  timeEl.className = "thread-bubble-time";
  timeEl.textContent = new Date(timestamp).toLocaleString();
  bubble.appendChild(timeEl);

  return bubble;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) return;

  storePassword(password);

  try {
    await authorizedFetch(`${SESSIONS_API_URL}?page=1`);
    passwordInput.value = "";
    showDashboard();
  } catch (err) {
    clearStoredPassword();
    loginError.textContent = "Incorrect password.";
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  clearStoredPassword();
  showLogin();
});

applyFiltersBtn.addEventListener("click", () => {
  currentPage = 1;
  loadSessions();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadSessions();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
  if (currentPage < totalPages) {
    currentPage += 1;
    loadSessions();
  }
});

backToSessionsBtn.addEventListener("click", () => {
  showSessionsView();
});

if (getStoredPassword()) {
  showDashboard();
} else {
  showLogin();
}

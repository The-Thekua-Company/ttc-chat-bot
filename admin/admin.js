const PASSWORD_STORAGE_KEY = "ttcAdminPassword";
const API_URL = "/api/admin/logs";

const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logout-btn");

const filterDate = document.getElementById("filter-date");
const filterMode = document.getElementById("filter-mode");
const filterSearch = document.getElementById("filter-search");
const applyFiltersBtn = document.getElementById("apply-filters-btn");
const resultsMeta = document.getElementById("results-meta");
const logsTbody = document.getElementById("logs-tbody");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const pageIndicator = document.getElementById("page-indicator");

let currentPage = 1;
let currentTotal = 0;
let currentPageSize = 50;
let highlightedSession = null;
let lastRows = [];

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
  } catch (err) {
    // Storage unavailable — session will require re-login next load.
  }
}

function clearStoredPassword() {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch (err) {}
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadLogs();
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

async function fetchLogs(password, params) {
  const query = new URLSearchParams();
  if (params.date) query.set("date", params.date);
  if (params.mode) query.set("mode", params.mode);
  if (params.sessionId) query.set("sessionId", params.sessionId);
  query.set("page", params.page || 1);

  const response = await fetch(`${API_URL}?${query.toString()}`, {
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

function renderRows(rows, searchText) {
  logsTbody.innerHTML = "";
  const lowerSearch = (searchText || "").toLowerCase();

  const filtered = lowerSearch
    ? rows.filter(
        (row) =>
          (row.user_message || "").toLowerCase().includes(lowerSearch) ||
          (row.bot_reply || "").toLowerCase().includes(lowerSearch)
      )
    : rows;

  filtered.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.session_id === highlightedSession) {
      tr.classList.add("session-highlight");
    }

    const timeTd = document.createElement("td");
    timeTd.textContent = new Date(row.created_at).toLocaleString();
    tr.appendChild(timeTd);

    const sessionTd = document.createElement("td");
    sessionTd.className = "session-cell";
    sessionTd.textContent = row.session_id || "";
    sessionTd.title = "Click to highlight this session";
    sessionTd.addEventListener("click", () => {
      highlightedSession = highlightedSession === row.session_id ? null : row.session_id;
      renderRows(rows, filterSearch.value.trim());
    });
    tr.appendChild(sessionTd);

    const modeTd = document.createElement("td");
    modeTd.textContent = row.mode || "";
    tr.appendChild(modeTd);

    const userTd = document.createElement("td");
    userTd.textContent = row.username || "—";
    tr.appendChild(userTd);

    const messageTd = document.createElement("td");
    messageTd.className = "message-cell";
    messageTd.textContent = row.user_message || "";
    tr.appendChild(messageTd);

    const replyTd = document.createElement("td");
    replyTd.className = "reply-cell";
    replyTd.textContent = row.bot_reply || "";
    tr.appendChild(replyTd);

    const locationTd = document.createElement("td");
    const locationParts = [row.city, row.region, row.country].filter(Boolean);
    locationTd.textContent = locationParts.length ? locationParts.join(", ") : "—";
    tr.appendChild(locationTd);

    logsTbody.appendChild(tr);
  });
}

async function loadLogs() {
  const password = getStoredPassword();
  if (!password) {
    showLogin();
    return;
  }

  const params = {
    date: filterDate.value,
    mode: filterMode.value,
    page: currentPage,
  };

  resultsMeta.textContent = "Loading...";

  try {
    const result = await fetchLogs(password, params);
    currentTotal = result.total || 0;
    currentPageSize = result.pageSize || 50;
    lastRows = result.rows || [];
    renderRows(lastRows, filterSearch.value.trim());

    const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
    resultsMeta.textContent = `${currentTotal} total log${currentTotal === 1 ? "" : "s"}`;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  } catch (err) {
    if (err.message === "unauthorized") {
      clearStoredPassword();
      showLogin("Incorrect password.");
    } else {
      resultsMeta.textContent = "Could not load logs. Please try again.";
    }
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) return;

  try {
    await fetchLogs(password, { page: 1 });
    storePassword(password);
    passwordInput.value = "";
    showDashboard();
  } catch (err) {
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
  loadLogs();
});

filterSearch.addEventListener("input", () => {
  renderRows(lastRows, filterSearch.value.trim());
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadLogs();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
  if (currentPage < totalPages) {
    currentPage += 1;
    loadLogs();
  }
});

if (getStoredPassword()) {
  showDashboard();
} else {
  showLogin();
}

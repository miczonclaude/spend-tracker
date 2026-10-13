const STORAGE_KEY = "expenses";

// Default the date field to today, so the user doesn't have to pick it every time.
document.getElementById("date").valueAsDate = new Date();

function loadExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function renderExpenses() {
  const expenses = loadExpenses();
  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  // Newest first.
  const sorted = [...expenses].sort((a, b) => b.id - a.id);

  for (const expense of sorted) {
    const item = document.createElement("li");

    const info = document.createElement("div");
    info.className = "expense-info";

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = `€${expense.amount.toFixed(2)} — ${expense.category}`;

    const meta = document.createElement("span");
    meta.className = "expense-meta";
    meta.textContent = `${expense.date} · ${expense.card}` + (expense.note ? ` · ${expense.note}` : "");

    info.appendChild(amount);
    info.appendChild(meta);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

    item.appendChild(info);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  }
}

// Turns a Date into text like "2026-10-13", the same format the expenses are stored in.
function formatDateAsText(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Returns the Monday of the week that contains the given date.
function getStartOfWeek(today) {
  // getDay() gives Sunday = 0, Monday = 1, ... Saturday = 6.
  // Shifting by 6 makes Monday = 0 and Sunday = 6.
  const daysSinceMonday = (today.getDay() + 6) % 7;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday);
}

// Adds up the expenses dated from startText to endText (both included).
// Dates are compared as text, which works because "YYYY-MM-DD" sorts in calendar order.
function sumExpensesBetween(expenses, startText, endText) {
  let total = 0;

  for (const expense of expenses) {
    if (expense.date >= startText && expense.date <= endText) {
      total += expense.amount;
    }
  }

  return total;
}

function renderTotals() {
  const expenses = loadExpenses();
  const today = new Date();

  const todayText = formatDateAsText(today);

  const weekStart = getStartOfWeek(today);
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);

  // Day 0 of next month is the last day of this month.
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const todayTotal = sumExpensesBetween(expenses, todayText, todayText);
  const weekTotal = sumExpensesBetween(expenses, formatDateAsText(weekStart), formatDateAsText(weekEnd));
  const monthTotal = sumExpensesBetween(expenses, formatDateAsText(monthStart), formatDateAsText(monthEnd));

  document.getElementById("total-today").textContent = `€${todayTotal.toFixed(2)}`;
  document.getElementById("total-week").textContent = `€${weekTotal.toFixed(2)}`;
  document.getElementById("total-month").textContent = `€${monthTotal.toFixed(2)}`;
}

// Redraws everything that depends on the saved expenses.
function renderPage() {
  renderExpenses();
  renderTotals();
}

function deleteExpense(id) {
  const expenses = loadExpenses().filter((expense) => expense.id !== id);
  saveExpenses(expenses);
  renderPage();
}

document.getElementById("expense-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const newExpense = {
    id: Date.now(),
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    card: document.getElementById("card").value,
    date: document.getElementById("date").value,
    note: document.getElementById("note").value.trim(),
  };

  const expenses = loadExpenses();
  expenses.push(newExpense);
  saveExpenses(expenses);

  event.target.reset();
  document.getElementById("date").valueAsDate = new Date();
  renderPage();
});

renderPage();

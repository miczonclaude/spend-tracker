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

function deleteExpense(id) {
  const expenses = loadExpenses().filter((expense) => expense.id !== id);
  saveExpenses(expenses);
  renderExpenses();
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
  renderExpenses();
});

renderExpenses();

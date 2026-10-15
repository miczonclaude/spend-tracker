const STORAGE_KEY = "expenses";

// The currencies the tracker knows about. Totals are shown separately for each one.
const CURRENCIES = ["EUR", "PLN"];

// Where the tracker remembers which currency the page is showing.
const CURRENCY_CHOICE_KEY = "selectedCurrency";

// Where the tracker remembers the categories you picked by hand for a store.
const CATEGORY_MEMORY_KEY = "categoryMemory";

// The category given to a payment when no rule matches its store name.
const DEFAULT_CATEGORY = "Other";

// The categories offered for each imported expense.
// The last four can't be guessed from a store name, so they are only ever picked by hand.
const CATEGORIES = [
  "Groceries",
  "Eating out",
  "Transport",
  "Travel",
  "Shopping",
  "Subscriptions",
  "Sports",
  "Health",
  "Entertainment",
  "Bills",
  "Other",
  "Joints",
  "Drinks",
  "Going out",
  "Online shopping",
];

// Rules for guessing a category from the store name.
// A payment gets the category of the first rule that has a keyword found in its store name,
// so the order matters: "uber eats" (Eating out) has to be checked before "uber" (Transport).
// Keywords are written in lowercase, without Polish accents ("zabka", not "Żabka").
// To teach the tracker a new store, add a keyword to the right list.
const CATEGORY_RULES = [
  // Your own specific stores come first, so a broad keyword further down (like "cafe") can't steal them.
  {
    category: "Joints",
    keywords: ["program one", "papilon", "papillon"],
  },
  {
    category: "Going out",
    keywords: ["samuels"],
  },
  {
    category: "Subscriptions",
    keywords: [
      "netflix", "spotify", "youtube", "disney", "hbo", "apple.com/bill", "icloud", "google one",
      "amazon prime", "prime video", "chatgpt", "openai", "claude", "anthropic", "patreon",
      "microsoft", "adobe", "canal+", "player.pl", "tidal",
    ],
  },
  {
    category: "Eating out",
    keywords: [
      "uber eats", "ubereats", "bolt food", "glovo", "wolt", "pyszne", "mcdonald", "kfc",
      "burger", "subway", "starbucks", "costa coffee", "pizza", "kebab", "sushi", "ramen",
      "restaura", "bistro", "cafe", "kawiarnia", "pasibus", "north fish", "lesmash", "le smash",
    ],
  },
  {
    category: "Groceries",
    keywords: [
      "lidl", "biedronka", "zabka", "kaufland", "auchan", "carrefour", "aldi", "netto", "dino",
      "stokrotka", "lewiatan", "spolem", "tesco", "intermarche", "polomarket", "freshmarket",
      "mercadona", "albert heijn", "rewe", "edeka", "delikatesy",
    ],
  },
  {
    category: "Transport",
    keywords: [
      "uber", "bolt", "freenow", "free now", "jakdojade", "mpk", "ztm", "mzk", "pkp", "intercity",
      "koleje", "polregio", "koleo", "flixbus", "orlen", "shell", "circle k", "lotos", "moya",
      "parking", "skycash", "mobilet", "taxi", "transport", "ovpay",
    ],
  },
  {
    category: "Travel",
    keywords: [
      "ryanair", "wizz", "lot polish", "lufthansa", "easyjet", "booking.com", "airbnb", "hotel",
      "hostel", "expedia", "trip.com", "skyscanner", "airport", "lotnisko",
    ],
  },
  {
    category: "Sports",
    keywords: [
      "decathlon", "gym", "fitness", "silownia", "multisport", "zdrofit", "calypso", "mcfit",
      "basen", "intersport", "martes", "go sport", "climbing", "wspinacz", "sport", "playtomic",
      "fc urban", "train more", "trainmore",
    ],
  },
  {
    category: "Health",
    keywords: [
      "apteka", "pharmacy", "super-pharm", "superpharm", "rossmann", "hebe", "medicover",
      "luxmed", "lux med", "dentist", "dentysta", "stomatolog", "przychodnia", "clinic", "optyk",
    ],
  },
  {
    category: "Entertainment",
    keywords: [
      "cinema", "kino", "helios", "steam", "epic games", "nintendo", "playstation", "xbox",
      "ticketmaster", "ebilet", "eventim", "teatr", "theatre", "museum", "muzeum", "bowling",
      "kregle", "escape room",
    ],
  },
  {
    category: "Bills",
    keywords: [
      "orange", "t-mobile", "vodafone", "pge", "tauron", "enea", "energa", "pgnig", "upc",
      "vectra", "netia", "pzu",
    ],
  },
  {
    category: "Shopping",
    keywords: [
      "allegro", "amazon", "zalando", "h&m", "zara", "reserved", "ccc", "ikea", "media expert",
      "mediamarkt", "media markt", "rtv euro", "x-kom", "empik", "pepco", "tk maxx", "sinsay",
      "cropp", "aliexpress", "temu", "shein", "vinted", "olx", "ebay", "leroy", "castorama", "bol.com",
    ],
  },
];

function loadExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Returns the currency of an expense.
// Expenses saved before currencies were added have no currency field, so they count as euros.
function getCurrency(expense) {
  return expense.currency || "EUR";
}

// Turns an amount into text like "€32.10" or "45.00 zł".
function formatMoney(amount, currency) {
  if (currency === "PLN") {
    return `${amount.toFixed(2)} zł`;
  }

  return `€${amount.toFixed(2)}`;
}

// ---------- Currency switch ----------

// Returns the currency the page is showing: the one picked last time, or euros the first time.
function getSelectedCurrency() {
  const saved = localStorage.getItem(CURRENCY_CHOICE_KEY);
  return CURRENCIES.includes(saved) ? saved : "EUR";
}

// Saves the picked currency and redraws the page, so every number switches at once.
function setSelectedCurrency(currency) {
  localStorage.setItem(CURRENCY_CHOICE_KEY, currency);
  renderPage();
}

// Highlights the button of the currency the page is showing.
function renderCurrencySwitch() {
  const selected = getSelectedCurrency();

  for (const button of document.querySelectorAll(".currency-btn")) {
    const isSelected = button.dataset.currency === selected;
    button.classList.toggle("selected", isSelected);
    // Tells screen readers which button is switched on.
    button.setAttribute("aria-pressed", isSelected);
  }
}

// Returns only the expenses made in the given currency.
function filterByCurrency(expenses, currency) {
  return expenses.filter((expense) => getCurrency(expense) === currency);
}

// Used to sort expenses with the newest date first.
// Expenses on the same date are ordered by id, the most recently added first.
function compareNewestFirst(a, b) {
  if (a.date !== b.date) {
    return a.date < b.date ? 1 : -1;
  }

  return b.id - a.id;
}

// The category clicked in "Spending by category", or null when the list shows everything.
let selectedCategory = null;

// Keeps only the expenses of the selected category, within the period picked for the breakdown.
function filterBySelectedCategory(expenses) {
  if (selectedCategory === null) {
    return expenses;
  }

  const period = document.getElementById("breakdown-period").value;
  const range = getBreakdownRange(period, new Date());

  return expenses.filter((expense) => {
    const isInRange = expense.date >= range.startText && expense.date <= range.endText;
    return isInRange && expense.category === selectedCategory;
  });
}

// Shows "Showing: Other · This month" above the list while a category is selected.
function renderCategoryFilterBar() {
  const bar = document.getElementById("category-filter");

  if (selectedCategory === null) {
    bar.hidden = true;
    return;
  }

  // The visible text of the chosen period option, like "This month".
  const periodSelect = document.getElementById("breakdown-period");
  const periodName = periodSelect.options[periodSelect.selectedIndex].text;

  document.getElementById("category-filter-text").textContent =
    `Showing: ${selectedCategory} · ${periodName}`;
  bar.hidden = false;
}

// Shows only one category in the expense list. Clicking the same category again shows everything.
function selectCategory(category) {
  if (selectedCategory === category) {
    selectedCategory = null;
  } else {
    selectedCategory = category;
  }

  renderPage();

  if (selectedCategory !== null) {
    document.querySelector(".list-card").scrollIntoView({ behavior: "smooth" });
  }
}

function clearCategoryFilter() {
  selectedCategory = null;
  renderPage();
}

function renderExpenses() {
  const expenses = loadExpenses();
  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  renderCategoryFilterBar();

  // Only the expenses in the currency the page is showing (and the clicked category, if any).
  const inCurrency = filterByCurrency(expenses, getSelectedCurrency());
  const visible = filterBySelectedCategory(inCurrency);
  const sorted = [...visible].sort(compareNewestFirst);

  if (sorted.length === 0) {
    const message = document.createElement("li");
    message.className = "no-data";

    if (selectedCategory === null) {
      message.textContent = "No expenses in this currency yet.";
    } else {
      message.textContent = `Nothing left in ${selectedCategory} for this period.`;
    }

    list.appendChild(message);
  }

  for (const expense of sorted) {
    const item = document.createElement("li");

    const info = document.createElement("div");
    info.className = "expense-info";

    // The store name is the title. Older hand-typed expenses may have no note, so they show the category.
    const title = document.createElement("span");
    title.className = "expense-title";
    title.textContent = expense.note || expense.category;

    // The grey line under the title: a category dropdown, then the date and card as plain text.
    const meta = document.createElement("span");
    meta.className = "expense-meta";
    meta.appendChild(createSavedCategorySelect(expense));
    meta.append(` · ${expense.date} · ${expense.card}`);

    info.appendChild(title);
    info.appendChild(meta);

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = formatMoney(expense.amount, getCurrency(expense));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

    item.appendChild(info);
    item.appendChild(amount);
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

// Adds up the expenses in one currency dated from startText to endText (both included).
// Dates are compared as text, which works because "YYYY-MM-DD" sorts in calendar order.
function sumExpensesBetween(expenses, startText, endText, currency) {
  let total = 0;

  for (const expense of expenses) {
    const isInRange = expense.date >= startText && expense.date <= endText;

    if (isInRange && getCurrency(expense) === currency) {
      total += expense.amount;
    }
  }

  return total;
}

// Fills one totals box with the amount spent in the selected currency, for the given date range.
function renderTotalBox(elementId, expenses, startText, endText) {
  const currency = getSelectedCurrency();
  const total = sumExpensesBetween(expenses, startText, endText, currency);

  document.getElementById(elementId).textContent = formatMoney(total, currency);
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

  renderTotalBox("total-today", expenses, todayText, todayText);
  renderTotalBox("total-week", expenses, formatDateAsText(weekStart), formatDateAsText(weekEnd));
  renderTotalBox("total-month", expenses, formatDateAsText(monthStart), formatDateAsText(monthEnd));
}

// ---------- Averages ----------

// Turns text like "2026-10-13" into a Date (at midnight).
function parseDateText(text) {
  const parts = text.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day);
}

// Returns the date of the earliest expense in the list, or null if the list is empty.
function findFirstExpenseDate(expenses) {
  let firstText = null;

  for (const expense of expenses) {
    if (firstText === null || expense.date < firstText) {
      firstText = expense.date;
    }
  }

  return firstText === null ? null : parseDateText(firstText);
}

// Counts the days from start to end, both included.
function countDaysBetween(start, end) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  // Math.round absorbs the hour that is gained or lost when the clocks change.
  return Math.round((end - start) / millisecondsPerDay) + 1;
}

// The three functions below each describe the dates an average is calculated over:
// { start, end, periods }, where periods is the number to divide by.
// They return null when there is no complete period yet.

// Every day from the first expense up to yesterday.
function getDailyRange(firstDate, today) {
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

  if (yesterday < firstDate) {
    return null;
  }

  return { start: firstDate, end: yesterday, periods: countDaysBetween(firstDate, yesterday) };
}

// Every complete Monday–Sunday week since the first expense, leaving out the current week.
function getWeeklyRange(firstDate, today) {
  // Start on the first Monday that is on or after the first expense.
  let start = getStartOfWeek(firstDate);
  if (start < firstDate) {
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  }

  // End on the Sunday just before the current week.
  const thisMonday = getStartOfWeek(today);
  const end = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - 1);

  if (end < start) {
    return null;
  }

  return { start: start, end: end, periods: countDaysBetween(start, end) / 7 };
}

// Every complete calendar month since the first expense, leaving out the current month.
function getMonthlyRange(firstDate, today) {
  // Start on the first "1st of the month" that is on or after the first expense.
  let start = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  if (start < firstDate) {
    start = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 1);
  }

  // Day 0 of this month is the last day of last month.
  const end = new Date(today.getFullYear(), today.getMonth(), 0);

  if (end < start) {
    return null;
  }

  const yearsApart = end.getFullYear() - start.getFullYear();
  const months = yearsApart * 12 + (end.getMonth() - start.getMonth()) + 1;

  return { start: start, end: end, periods: months };
}

// Fills one average box: total spent in the range divided by the number of periods,
// in the selected currency. Shows "Not enough data" when range is null.
function renderAverageBox(elementId, expenses, range) {
  const box = document.getElementById(elementId);
  box.innerHTML = "";

  if (range === null) {
    const message = document.createElement("span");
    message.className = "no-data";
    message.textContent = "Not enough data";
    box.appendChild(message);
    return;
  }

  const currency = getSelectedCurrency();
  const startText = formatDateAsText(range.start);
  const endText = formatDateAsText(range.end);
  const total = sumExpensesBetween(expenses, startText, endText, currency);

  box.textContent = formatMoney(total / range.periods, currency);
}

function renderAverages() {
  // Each currency is averaged on its own, starting from the first expense in that currency.
  const expenses = filterByCurrency(loadExpenses(), getSelectedCurrency());
  const today = new Date();
  const firstDate = findFirstExpenseDate(expenses);

  // With no expenses at all there is nothing to average.
  const dailyRange = firstDate ? getDailyRange(firstDate, today) : null;
  const weeklyRange = firstDate ? getWeeklyRange(firstDate, today) : null;
  const monthlyRange = firstDate ? getMonthlyRange(firstDate, today) : null;

  renderAverageBox("average-day", expenses, dailyRange);
  renderAverageBox("average-week", expenses, weeklyRange);
  renderAverageBox("average-month", expenses, monthlyRange);
}

// ---------- Spending by category ----------

// Returns the first and last date (as text) of the period picked in the dropdown.
function getBreakdownRange(period, today) {
  if (period === "this-month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startText: formatDateAsText(start), endText: formatDateAsText(end) };
  }

  if (period === "last-month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startText: formatDateAsText(start), endText: formatDateAsText(end) };
  }

  // "All time": a range so wide that every date falls inside it.
  return { startText: "0000-01-01", endText: "9999-12-31" };
}

// Adds up spending per category for one currency and date range.
// Returns a list like [{ category: "Groceries", total: 120.5 }, ...], biggest first.
function sumByCategory(expenses, startText, endText, currency) {
  const totals = {};

  for (const expense of expenses) {
    const isInRange = expense.date >= startText && expense.date <= endText;

    if (isInRange && getCurrency(expense) === currency) {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    }
  }

  const list = [];

  for (const category in totals) {
    list.push({ category: category, total: totals[category] });
  }

  list.sort((a, b) => b.total - a.total);
  return list;
}

// Builds one row of the breakdown: name, bar, amount and share of the whole.
function createBreakdownRow(entry, biggestTotal, grandTotal, currency) {
  const row = document.createElement("li");
  row.className = "breakdown-row";

  // The row works like a button: click it (or press Enter / Space on it) to see that category's expenses.
  // tabindex="0" lets the keyboard Tab key reach it; role and aria-pressed tell screen readers what it is.
  const isSelected = entry.category === selectedCategory;
  row.tabIndex = 0;
  row.setAttribute("role", "button");
  row.setAttribute("aria-pressed", String(isSelected));
  if (isSelected) {
    row.classList.add("selected");
  }

  row.addEventListener("click", () => selectCategory(entry.category));
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      // Stops Space from also scrolling the page.
      event.preventDefault();
      selectCategory(entry.category);
    }
  });

  const name = document.createElement("span");
  name.textContent = entry.category;

  const track = document.createElement("div");
  track.className = "bar-track";

  // The biggest category fills the whole track; the others are sized relative to it.
  const fill = document.createElement("div");
  fill.className = "bar-fill";
  fill.style.width = `${(entry.total / biggestTotal) * 100}%`;
  track.appendChild(fill);

  const amount = document.createElement("span");
  amount.className = "breakdown-amount";
  amount.textContent = formatMoney(entry.total, currency);

  const share = document.createElement("span");
  share.className = "breakdown-share";
  share.textContent = `${Math.round((entry.total / grandTotal) * 100)}%`;

  row.appendChild(name);
  row.appendChild(track);
  row.appendChild(amount);
  row.appendChild(share);
  return row;
}

function renderCategoryBreakdown() {
  const period = document.getElementById("breakdown-period").value;
  const currency = getSelectedCurrency();
  const range = getBreakdownRange(period, new Date());
  const entries = sumByCategory(loadExpenses(), range.startText, range.endText, currency);

  const list = document.getElementById("breakdown-list");
  list.innerHTML = "";

  if (entries.length === 0) {
    const message = document.createElement("li");
    message.className = "no-data";
    message.textContent = "No spending in this period.";
    list.appendChild(message);
    return;
  }

  let grandTotal = 0;
  for (const entry of entries) {
    grandTotal += entry.total;
  }

  // The list is sorted biggest first, so the first entry is the biggest.
  const biggestTotal = entries[0].total;

  for (const entry of entries) {
    list.appendChild(createBreakdownRow(entry, biggestTotal, grandTotal, currency));
  }
}

// Redraws everything that depends on the saved expenses.
function renderPage() {
  renderCurrencySwitch();
  renderExpenses();
  renderTotals();
  renderAverages();
  renderCategoryBreakdown();
}

// Builds the small dropdown that shows (and lets you change) a saved expense's category.
function createSavedCategorySelect(expense) {
  const select = document.createElement("select");
  select.className = "saved-category-select";
  select.setAttribute("aria-label", "Category");

  for (const category of CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  }

  select.value = expense.category;
  select.addEventListener("change", () => changeSavedCategory(expense, select.value));

  return select;
}

// Changes the category of a saved expense, and of every other saved expense from the same store.
// The choice is remembered, so future imports from that store get it automatically.
function changeSavedCategory(changedExpense, category) {
  const expenses = loadExpenses();
  const changed = [];

  for (const expense of expenses) {
    // Expenses without a store name can't be matched to others, so only the clicked one changes.
    const isSameExpense = expense.id === changedExpense.id;
    const isSameStore =
      changedExpense.note && expense.note && simplifyText(expense.note) === simplifyText(changedExpense.note);

    if (isSameExpense || isSameStore) {
      expense.category = category;
      changed.push(expense);
    }
  }

  saveExpenses(expenses);

  // Only expenses with a store name can be remembered (the memory is keyed by store name).
  if (changedExpense.note) {
    rememberChosenCategories([changed[0]]);
  }

  renderPage();
}

function deleteExpense(id) {
  const expenses = loadExpenses().filter((expense) => expense.id !== id);
  saveExpenses(expenses);
  renderPage();
}

// ---------- Automatic categories ----------

// Makes a store name easy to compare: lowercase, no Polish accents, no extra spaces.
// "Żabka  Kraków" -> "zabka krakow"
function simplifyText(text) {
  return text
    .toLowerCase()
    .replace(/ł/g, "l")
    // normalize("NFD") splits "ż" into "z" plus a separate accent mark; the replace removes the marks.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// The memory is an object like { "kebab king": "Eating out" }: store name -> category picked by hand.
function loadCategoryMemory() {
  const raw = localStorage.getItem(CATEGORY_MEMORY_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveCategoryMemory(memory) {
  localStorage.setItem(CATEGORY_MEMORY_KEY, JSON.stringify(memory));
}

// Guesses a category using only the keyword rules.
function detectCategoryFromRules(storeName) {
  const simpleName = simplifyText(storeName);

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (simpleName.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return DEFAULT_CATEGORY;
}

// Picks the category for a store: a category you chose for it before wins over the keyword rules.
function detectCategory(storeName) {
  const memory = loadCategoryMemory();
  const remembered = memory[simplifyText(storeName)];

  return remembered || detectCategoryFromRules(storeName);
}

// Remembers the categories that were changed by hand in the preview, for the next import.
function rememberChosenCategories(expenses) {
  const memory = loadCategoryMemory();

  for (const expense of expenses) {
    const storeKey = simplifyText(expense.note);

    if (expense.category === detectCategoryFromRules(expense.note)) {
      // The rules already give this answer, so there is nothing to remember.
      delete memory[storeKey];
    } else {
      memory[storeKey] = expense.category;
    }
  }

  saveCategoryMemory(memory);
}

// Gives saved "Other" expenses another chance: new keyword rules only work at import time,
// so expenses imported before a rule existed would otherwise stay in "Other" forever.
// Categories you picked by hand are left alone.
function recategorizeOtherExpenses() {
  const expenses = loadExpenses();
  let changedCount = 0;

  for (const expense of expenses) {
    // Older hand-typed expenses may have no store name, so there is nothing to match.
    if (expense.category !== DEFAULT_CATEGORY || !expense.note) {
      continue;
    }

    const newCategory = detectCategory(expense.note);

    if (newCategory !== DEFAULT_CATEGORY) {
      expense.category = newCategory;
      changedCount = changedCount + 1;
    }
  }

  // Only write to localStorage when something actually changed.
  if (changedCount > 0) {
    saveExpenses(expenses);
  }
}

// ---------- Revolut import ----------

// The columns of a Revolut CSV statement that the import relies on.
const REVOLUT_COLUMNS = ["Type", "Started Date", "Description", "Amount", "Currency", "State"];

// Expenses read from the chosen file, waiting for the user to press Import.
let pendingImport = [];

// Splits one line of a CSV file into its values.
// A plain line.split(",") would break values that contain a comma inside quotes, like "Uber, Trip".
function splitCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];

    if (character === '"') {
      // Two quotes in a row inside a quoted value mean one real quote character.
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

// Turns the text of a CSV file into a list of objects, one per line,
// using the first line as the names. Example: { Type: "CARD_PAYMENT", Amount: "-32.10", ... }
function parseCsv(text) {
  // Some programs put an invisible marker at the very start of a file; remove it.
  const cleanText = text.replace(/^﻿/, "");
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return [];
  }

  const columnNames = splitCsvLine(lines[0]).map((name) => name.trim());
  const rows = [];

  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);
    const row = {};

    for (let i = 0; i < columnNames.length; i++) {
      row[columnNames[i]] = (values[i] || "").trim();
    }

    rows.push(row);
  }

  return rows;
}

// Returns the names of the Revolut columns that the file does not have.
function findMissingColumns(rows) {
  return REVOLUT_COLUMNS.filter((name) => !(name in rows[0]));
}

// True for money spent with the card. False for top-ups, transfers, refunds,
// and payments that are pending, failed or declined.
function isOutgoingCardPayment(row) {
  const isCardPayment = row["Type"] === "CARD_PAYMENT";
  const isCompleted = row["State"] === "COMPLETED";
  const isMoneyOut = Number(row["Amount"]) < 0;

  return isCardPayment && isCompleted && isMoneyOut;
}

// Converts one Revolut row into the shape the tracker stores.
function rowToExpense(row) {
  return {
    // Revolut writes money going out as a negative number; the tracker stores it as positive.
    amount: Math.abs(Number(row["Amount"])),
    currency: row["Currency"],
    category: detectCategory(row["Description"]),
    card: "Revolut",
    // "2026-10-12 18:03:11" -> "2026-10-12"
    date: row["Started Date"].slice(0, 10),
    note: row["Description"],
    // Identifies this transaction, so loading the same file again doesn't import it twice.
    importKey: [row["Started Date"], row["Amount"], row["Currency"], row["Description"]].join("|"),
  };
}

// Describes how many expenses there are in each currency, like "8 in €, 1 in zł".
// After an import this tells the user which currency view to look in.
function describeCountsByCurrency(expenses) {
  const symbols = { EUR: "€", PLN: "zł" };
  const parts = [];

  for (const currency of CURRENCIES) {
    const count = filterByCurrency(expenses, currency).length;

    if (count > 0) {
      parts.push(`${count} in ${symbols[currency]}`);
    }
  }

  return parts.join(", ");
}

// Returns an id that no saved expense is using yet.
function getNextId(expenses) {
  let highest = 0;

  for (const expense of expenses) {
    if (expense.id > highest) {
      highest = expense.id;
    }
  }

  return highest + 1;
}

function showImportMessage(text) {
  document.getElementById("import-message").textContent = text;
}

// Forgets the loaded file and hides the preview.
function clearImport() {
  pendingImport = [];
  document.getElementById("import-preview").hidden = true;
  // Emptying the file field lets the user pick the same file again.
  document.getElementById("csv-file").value = "";
}

// Works out which rows of a Revolut CSV are new expenses, then shows them in the preview.
function prepareRevolutImport(text) {
  clearImport();

  const rows = parseCsv(text);

  if (rows.length === 0) {
    showImportMessage("This file has no transactions in it.");
    return;
  }

  const missingColumns = findMissingColumns(rows);

  if (missingColumns.length > 0) {
    showImportMessage(
      "This doesn't look like a Revolut statement. Missing columns: " + missingColumns.join(", ") +
      ". Columns found: " + Object.keys(rows[0]).join(", ")
    );
    return;
  }

  const expenses = rows.filter(isOutgoingCardPayment).map(rowToExpense);
  showNewExpenses(expenses, "");
}

// Used by both banks: leaves out expenses that are already saved or in a currency
// the tracker doesn't know, then shows the rest in the preview.
// extraMessage is added to the end of the summary, for things only one bank needs to say.
function showNewExpenses(expenses, extraMessage) {
  const savedKeys = loadExpenses().map((expense) => expense.importKey);
  let alreadyImported = 0;
  let otherCurrency = 0;

  for (const expense of expenses) {
    if (!CURRENCIES.includes(expense.currency)) {
      otherCurrency++;
    } else if (savedKeys.includes(expense.importKey)) {
      alreadyImported++;
    } else {
      pendingImport.push(expense);
    }
  }

  // Oldest first. The key starts with the date and time, so sorting the keys sorts by time.
  pendingImport.sort((a, b) => (a.importKey < b.importKey ? -1 : 1));

  showImportMessage(
    `Found ${pendingImport.length} new card payments. ` +
    `Skipped ${alreadyImported} already imported and ${otherCurrency} in other currencies.` +
    extraMessage
  );

  if (pendingImport.length > 0) {
    renderImportPreview();
  }
}

// ---------- VeloBank import ----------

// VeloBank only exports a PDF. The pdf.js library (loaded in index.html) pulls the text out of it.
// Its helper script runs in the background; this is where pdf.js downloads it from.
const PDF_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Every payment in the statement starts with two dates: when you paid and when the bank booked it.
// Splitting the text right before each pair of dates gives one piece of text per payment.
// The (?= ) part means "split here, but keep the dates in the piece".
const VELOBANK_ROW_START = /(?=\d{2}\.\d{2}\.\d{4} \d{2}\.\d{2}\.\d{4} )/;

// Reads one payment. Example of the text it expects:
// "01.01.2020 03.01.2020 Operacja kartą ... w Example Shop, SOMECITY, NL -12,34 EUR <balance> EUR"
// The parts in ( ) are what we keep: the payment date, the description, the amount and the currency.
// The amount must start with "-", so money coming in (refunds) is not matched.
// The last number is the balance after the payment; it is kept to tell identical payments apart.
const VELOBANK_ROW_PATTERN =
  /^(\d{2}\.\d{2}\.\d{4}) \d{2}\.\d{2}\.\d{4} (.+?) (-\d[\d ]*,\d{2}) ([A-Z]{3}) (-?\d[\d ]*,\d{2}) [A-Z]{3}/;

// Inside the description, the store comes after "<amount> <currency> w ".
// "...na kwotę 12,34 EUR w Example Shop, SOMECITY, NL" -> "Example Shop, SOMECITY, NL"
const VELOBANK_STORE_PATTERN = /\d,\d{2} [A-Z]{3} w (.+)$/;

// Gets all the text out of a PDF file as one long line.
// Each step of reading a PDF takes a moment, which is why there are so many "await"s.
async function readPdfText(file) {
  // Set here rather than at the top of the file: if pdf.js didn't download, pdfjsLib doesn't exist,
  // and using it at the top would crash the whole script instead of just this import.
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: data }).promise;
  const pieces = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    for (const item of content.items) {
      pieces.push(item.str);
    }
  }

  // Line breaks and double spaces would get in the way of the patterns, so turn them into single spaces.
  return pieces.join(" ").replace(/\s+/g, " ");
}

// Turns a Polish-style number like "-1 234,56" into 1234.56 (always positive).
function parsePolishAmount(text) {
  const plainNumber = text.replace(/ /g, "").replace(",", ".");
  return Math.abs(Number(plainNumber));
}

// "01.01.2020" -> "2020-01-01", the date format the tracker stores.
function convertPolishDate(text) {
  const [day, month, year] = text.split(".");
  return `${year}-${month}-${day}`;
}

// Gets the store from a description. If the description looks different, the whole description is used.
function findVeloBankStore(description) {
  const match = description.match(VELOBANK_STORE_PATTERN);
  return match ? match[1] : description;
}

// Card payments to your own Revolut account just move money there.
// The real spending is already counted by the Revolut import, so these must be skipped.
function isRevolutTopUp(store) {
  return simplifyText(store).startsWith("revolut");
}

// Turns one payment's text into an expense, or returns null if the text isn't a payment.
function veloBankRowToExpense(rowText) {
  const match = rowText.match(VELOBANK_ROW_PATTERN);

  if (!match) {
    return null;
  }

  const [, paymentDate, description, amount, currency, balance] = match;
  const store = findVeloBankStore(description);

  return {
    amount: parsePolishAmount(amount),
    currency: currency,
    category: detectCategory(store),
    card: "VeloBank",
    date: convertPolishDate(paymentDate),
    note: store,
    // The balance is part of the key because two coffees on the same day can have the same amount and store.
    importKey: [convertPolishDate(paymentDate), "VeloBank", amount, balance, store].join("|"),
  };
}

// Reads a VeloBank PDF statement, then shows its new payments in the preview.
async function prepareVeloBankImport(file) {
  clearImport();

  // "typeof" checks whether pdfjsLib exists without crashing when it doesn't.
  if (typeof pdfjsLib === "undefined") {
    showImportMessage("The PDF reader didn't load. Check your internet connection and refresh the page.");
    return;
  }

  showImportMessage("Reading the PDF...");

  let text;

  try {
    text = await readPdfText(file);
  } catch (error) {
    showImportMessage("Couldn't read this PDF. Is it the card history downloaded from VeloBank?");
    return;
  }

  const expenses = [];
  let topUps = 0;

  for (const rowText of text.split(VELOBANK_ROW_START)) {
    const expense = veloBankRowToExpense(rowText);

    if (expense === null) {
      continue;
    }

    if (isRevolutTopUp(expense.note)) {
      topUps++;
    } else {
      expenses.push(expense);
    }
  }

  if (expenses.length === 0 && topUps === 0) {
    showImportMessage("No card payments found. Is this the card history downloaded from VeloBank?");
    return;
  }

  showNewExpenses(expenses, ` Also skipped ${topUps} top-ups to Revolut (already counted by the Revolut import).`);
}

// Builds the dropdown used to pick the category of one previewed expense.
function createCategorySelect(expense) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Category");

  for (const category of CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  }

  select.value = expense.category;
  // Lets setCategoryForStore find every dropdown that belongs to the same store.
  select.dataset.store = simplifyText(expense.note);
  select.addEventListener("change", () => {
    setCategoryForStore(select.dataset.store, select.value);
  });

  return select;
}

// Gives every previewed payment from one store the same category.
// Changing one "Kebab King" row changes all of them, so you don't have to repeat yourself.
function setCategoryForStore(storeKey, category) {
  for (const expense of pendingImport) {
    if (simplifyText(expense.note) === storeKey) {
      expense.category = category;
    }
  }

  for (const select of document.querySelectorAll("#preview-list select")) {
    if (select.dataset.store === storeKey) {
      select.value = category;
    }
  }
}

// Lists the expenses waiting to be imported, each with a category dropdown.
function renderImportPreview() {
  const list = document.getElementById("preview-list");
  list.innerHTML = "";

  for (const expense of pendingImport) {
    const item = document.createElement("li");
    item.className = "preview-row";

    const date = document.createElement("span");
    date.className = "preview-date";
    date.textContent = expense.date;

    const description = document.createElement("span");
    description.className = "preview-description";
    description.textContent = expense.note;

    const amount = document.createElement("span");
    amount.className = "preview-amount";
    amount.textContent = formatMoney(expense.amount, expense.currency);

    item.appendChild(date);
    item.appendChild(description);
    item.appendChild(amount);
    item.appendChild(createCategorySelect(expense));
    list.appendChild(item);
  }

  document.getElementById("import-confirm").textContent = `Import ${pendingImport.length} expenses`;
  document.getElementById("import-preview").hidden = false;
}

// Saves the previewed expenses with the categories the user chose.
function confirmImport() {
  const expenses = loadExpenses();
  const importedCount = pendingImport.length;
  const countsText = describeCountsByCurrency(pendingImport);
  let nextId = getNextId(expenses);

  for (const expense of pendingImport) {
    expense.id = nextId;
    nextId++;
    expenses.push(expense);
  }

  saveExpenses(expenses);
  rememberChosenCategories(pendingImport);
  clearImport();
  showImportMessage(`Imported ${importedCount} expenses (${countsText}).`);
  renderPage();
}

// Runs when the user picks a file. A PDF is a VeloBank statement, anything else a Revolut CSV.
// ---------- Backup and restore ----------

// Marks a file as a backup from this tracker, so restore can refuse other JSON files.
const BACKUP_APP_NAME = "spending-tracker";

function showBackupMessage(text) {
  document.getElementById("backup-message").textContent = text;
}

// Gathers everything the tracker keeps in localStorage into one object.
function createBackup() {
  return {
    app: BACKUP_APP_NAME,
    createdAt: new Date().toISOString(),
    expenses: loadExpenses(),
    categoryMemory: loadCategoryMemory(),
    selectedCurrency: getSelectedCurrency(),
  };
}

// Saves the backup as a .json file in the browser's downloads.
function downloadBackup() {
  const backup = createBackup();
  // null, 2 adds line breaks and indentation, so the file is readable if you open it.
  const text = JSON.stringify(backup, null, 2);
  const file = new Blob([text], { type: "application/json" });

  // Browsers download a file when you click a link that has a "download" name.
  // So we make an invisible link to the file, click it, then clean up.
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `spending-backup-${formatDateAsText(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(link.href);

  showBackupMessage(`Backup downloaded with ${backup.expenses.length} expenses.`);
}

// Checks that a file's contents look like a backup made by downloadBackup().
function isValidBackup(data) {
  if (!data || data.app !== BACKUP_APP_NAME) {
    return false;
  }

  if (!Array.isArray(data.expenses)) {
    return false;
  }

  // Every expense needs at least an id, an amount and a date to show up correctly.
  for (const expense of data.expenses) {
    if (typeof expense.id !== "number" || typeof expense.amount !== "number" || !expense.date) {
      return false;
    }
  }

  return true;
}

// Replaces the current data with the data from a backup file (after asking first).
async function restoreBackup(file) {
  const text = await file.text();
  let data;

  // JSON.parse throws an error if the file isn't valid JSON, so we catch it instead of crashing.
  try {
    data = JSON.parse(text);
  } catch (error) {
    showBackupMessage("That file isn't a backup from this tracker.");
    return;
  }

  if (!isValidBackup(data)) {
    showBackupMessage("That file isn't a backup from this tracker.");
    return;
  }

  const currentCount = loadExpenses().length;
  const confirmed = confirm(
    `This will replace your current ${currentCount} expenses with ${data.expenses.length} from the backup. Continue?`
  );

  if (!confirmed) {
    showBackupMessage("Restore cancelled. Nothing was changed.");
    return;
  }

  saveExpenses(data.expenses);
  saveCategoryMemory(data.categoryMemory || {});

  if (CURRENCIES.includes(data.selectedCurrency)) {
    localStorage.setItem(CURRENCY_CHOICE_KEY, data.selectedCurrency);
  }

  renderPage();
  showBackupMessage(`Restored ${data.expenses.length} expenses from the backup.`);
}

async function handleBackupFileChosen(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  await restoreBackup(file);
  // Emptying the file field lets the same backup be picked again later.
  event.target.value = "";
}

// Reading a file takes a moment, so "await" pauses this function until it's ready.
async function handleFileChosen(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (file.name.toLowerCase().endsWith(".pdf")) {
    await prepareVeloBankImport(file);
  } else {
    const text = await file.text();
    prepareRevolutImport(text);
  }
}

// The period also limits the filtered expense list, so the whole page is redrawn.
document.getElementById("breakdown-period").addEventListener("change", renderPage);
document.getElementById("category-filter-clear").addEventListener("click", clearCategoryFilter);

for (const button of document.querySelectorAll(".currency-btn")) {
  button.addEventListener("click", () => setSelectedCurrency(button.dataset.currency));
}

document.getElementById("csv-file").addEventListener("change", handleFileChosen);
document.getElementById("import-confirm").addEventListener("click", confirmImport);
document.getElementById("import-cancel").addEventListener("click", () => {
  clearImport();
  showImportMessage("");
});

document.getElementById("backup-download").addEventListener("click", downloadBackup);
// The Restore button just opens the hidden file picker; picking a file starts the restore.
document.getElementById("backup-restore").addEventListener("click", () => {
  document.getElementById("backup-file").click();
});
document.getElementById("backup-file").addEventListener("change", handleBackupFileChosen);

// Re-check "Other" expenses first, so the totals and breakdown are drawn with the fixed categories.
recategorizeOtherExpenses();
renderPage();

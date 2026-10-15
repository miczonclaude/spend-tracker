# Spending Tracker

A personal spending tracker. Plain HTML, CSS, and JavaScript — no frameworks, no build step. Data is stored in the browser's `localStorage`.

## Working rules

- **Beginner-friendly code.** The user is learning to build with Claude Code. Keep functions small and named clearly. Prefer straightforward code over clever one-liners, even if slightly more verbose.
- **Explain every change.** When adding or modifying code, explain what was added and why — not just a summary of the diff, but the reasoning behind decisions (why this approach over an alternative).
- **Never copy real transaction data, balances, names or account numbers into project files.** Use made-up examples instead.
- **One feature at a time.** Don't implement multiple features in a single pass. Before writing code for a new feature, show a short plan (what files/functions change) and get approval first.

## Planned features (build in this order)

1. ~~Add an expense (amount, category, card, date, optional note)~~ — done, then removed: expenses now come only from the CSV import
2. ~~List of expenses, with delete~~ — done
3. ~~Totals per day / week / month~~ — done (the "Today" box was later removed: data only arrives with each statement import, so it was usually empty)
4. Breakdown by category — done (the Spending by category card; browse any week or month with ‹ › arrows, or all time); breakdown by card — not built yet
5. ~~Bar chart of spending~~ — done (Week / Month switch: last 12 weeks or last 12 months, hover for exact amount, click a bar to show that period in Spending by category)
6. ~~CSV import from Revolut~~ — done (EUR and PLN card payments, with preview and duplicate check)
7. ~~Average spending per day / week / month~~ — done
8. ~~Automatic categories from the store name (keyword rules + remembered corrections)~~ — done
9. ~~PDF import from VeloBank~~ — done (card history PDF read with pdf.js; Revolut top-ups skipped)
10. ~~Backup and restore (download all data as a .json file, restore replaces current data)~~ — done
11. ~~Change the category of a saved expense~~ — done (dropdown in each row; changes all expenses from that store and remembers it)
12. ~~Click a category in the breakdown to see its expenses~~ — done (filters the expense list to that category and period)

## Current files

- `index.html` — page structure (totals, averages, weekly/monthly spending chart, spending by category, import card for Revolut CSV / VeloBank PDF, backup card, expense list); loads pdf.js from cdnjs
- `style.css` — styling
- `waves.svg` — page background (slowly moving wavy lines)
- `script.js` — all logic: localStorage read/write, render, totals, averages, spending chart, Revolut CSV + VeloBank PDF import, backup/restore, delete

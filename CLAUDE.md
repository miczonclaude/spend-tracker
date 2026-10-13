# Spending Tracker

A personal spending tracker. Plain HTML, CSS, and JavaScript — no frameworks, no build step. Data is stored in the browser's `localStorage`.

## Working rules

- **Beginner-friendly code.** The user is learning to build with Claude Code. Keep functions small and named clearly. Prefer straightforward code over clever one-liners, even if slightly more verbose.
- **Explain every change.** When adding or modifying code, explain what was added and why — not just a summary of the diff, but the reasoning behind decisions (why this approach over an alternative).
- **One feature at a time.** Don't implement multiple features in a single pass. Before writing code for a new feature, show a short plan (what files/functions change) and get approval first.

## Planned features (build in this order)

1. ~~Add an expense (amount, category, card, date, optional note)~~ — done, then removed: expenses now come only from the CSV import
2. ~~List of expenses, with delete~~ — done
3. Totals per day / week / month
4. Breakdown by category — done (the Spending by category card); breakdown by card — not built yet
5. Bar chart of spending per day
6. ~~CSV import from Revolut~~ — done (EUR and PLN card payments, with preview and duplicate check)
7. ~~Average spending per day / week / month~~ — done
8. ~~Automatic categories from the store name (keyword rules + remembered corrections)~~ — done

## Current files

- `index.html` — page structure (totals, averages, spending by category, Revolut import card, expense list)
- `style.css` — styling
- `waves.svg` — page background (slowly moving wavy lines)
- `script.js` — all logic: localStorage read/write, render, totals, averages, CSV import, delete

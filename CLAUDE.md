# Spending Tracker

A personal spending tracker. Plain HTML, CSS, and JavaScript — no frameworks, no build step. Data is stored in the browser's `localStorage`.

## Working rules

- **Beginner-friendly code.** The user is learning to build with Claude Code. Keep functions small and named clearly. Prefer straightforward code over clever one-liners, even if slightly more verbose.
- **Explain every change.** When adding or modifying code, explain what was added and why — not just a summary of the diff, but the reasoning behind decisions (why this approach over an alternative).
- **One feature at a time.** Don't implement multiple features in a single pass. Before writing code for a new feature, show a short plan (what files/functions change) and get approval first.

## Planned features (build in this order)

1. ~~Add an expense (amount, category, card, date, optional note)~~ — done
2. ~~List of expenses, with delete~~ — done
3. Totals per day / week / month
4. Breakdown by category and by card
5. Bar chart of spending per day
6. CSV import from Revolut

## Current files

- `index.html` — page structure (form + expense list container)
- `style.css` — styling
- `waves.svg` — page background (slowly moving wavy lines)
- `script.js` — all logic: localStorage read/write, render, add, delete

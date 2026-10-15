# Learning log

- 9 Oct: built add + list + delete. Learned what localStorage and JSON are.

- 13 Oct: Python chapter 1 done. Added today/week/month totals to the tracker. Code still hard to read.

- 14 Oct:
  - Python ch. 2 (part): if/else, ==, not, True/False. Worked through the "Opposite Day" example line by line.
  - Tracker: added VeloBank PDF import.
  - Found real bank data (a payment + balance) copied into comments in script.js. Replaced with fake examples, deleted Claude's scratch copy of my statement, added a "never copy real data" rule to CLAUDE.md.
  - Learned: git diff shows what changed before committing.
  - Claude found a bug in its own code (pdf.js failing would blank the whole app). Fixed it and tested offline myself.
  - Next: ch. 2 self-check (3 expenses → total, no book), then ch. 3.

- 15 Oct:
  - Tracker: added keyword rules for more stores so fewer land in "Other". Saved "Other" expenses now get re-checked against the rules every time the page loads.
  - Added backup/restore: download everything as a .json file, restore replaces the current data (asks first). Backup files are in .gitignore since they hold real transactions.
  - Each saved expense now has a category dropdown. Changing it updates every expense from that store and remembers it for future imports.
  - Clicking a category in "Spending by category" filters the expense list to it, which makes cleaning up "Other" easy.
  - Built a daily bar chart (last 30 days), decided I didn't need it, and swapped it for a monthly one (last 12 months, current month paler because it isn't finished).
  - Worked one feature at a time: plan → approve → build → test → commit. Pushed everything to GitHub.

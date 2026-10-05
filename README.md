# 📺 STREAM-OS — Module 01: Subscription Plan Engine

> A secure, in-memory billing engine for a Smart TV subscription account.
> Built with **100% pure vanilla JavaScript** — zero dependencies, zero frameworks, zero UI.

[![CI](https://github.com/debjeetdhar/stream-os-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/debjeetdhar/stream-os-engine/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-35%2F35%20passing-brightgreen)](./tests/test-suite.js)
[![npm version](https://img.shields.io/npm/v/@debjeetdhar/stream-os-engine.svg)](https://www.npmjs.com/package/@debjeetdhar/stream-os-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue)](./package.json)

---

## 🎯 The Problem (Company Ticket `FIN-204`)

A Smart TV billing system needs a **private subscription wallet** where:

- The user has a **Secret PIN** and a list of **active plan prices** (in ₹).
- The PIN, the failed-attempt counter, and the plan list must be **completely private** — no code outside the engine should be able to read or modify them directly.

---

## 🔐 What This Engine Does

| Method | What it does | Success |
|--------|--------------|---------|
| `getLatestPlan()` | Returns the **most recently added** plan price | `200` |
| `addNewPlan(pin, planPrice)` | PIN-protected add of a new plan | `201 Created` |
| `getPremiumPlans(minPrice)` | Filters plans that cost `minPrice` or more | `200` |
| `applyTaxToAll(taxAmount)` | Adds flat tax to every plan (without mutating stored data) | `200` |

---

## 🛡️ Security & Engineering Rules Built In

1. **Brute-Force Lock** — After **3 wrong PINs** the engine locks permanently (`403 Forbidden`), even if the correct PIN is entered afterwards.
2. **Counter Reset** — A correct PIN resets the failed-attempt counter back to `0`.
3. **Immutability** — The stored plan list is **never mutated**. Every add uses the spread operator (`[...prices, newPlan]`) and every transform uses `.map()` / `.filter()`.
4. **Consistent Return Type** — *Every* method (success or failure) returns the exact same object shape:
   ```js
   { status: 200, ok: true,  data: ... }   // success
   { status: 400, ok: false, error: "..." } // failure
   ```
   This kills SonarLint's *"refactor this function to always return the same type"* warning.
5. **Guard Clauses First** — Every method validates input *before* doing any work.

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/<your-username>/stream-os-engine.git
cd stream-os-engine

# 2. Run the test suite (no install needed — zero dependencies!)
npm test
```

### Minimal usage

```js
const createSubscriptionEngine = require("./src/createSubscriptionEngine");

const engine = createSubscriptionEngine("7788", [199, 499, 999]);

engine.getLatestPlan();           // { status: 200, ok: true, data: 999 }
engine.addNewPlan("0000", 1499);  // { status: 401, ok: false, error: 'Wrong PIN!' }
engine.addNewPlan("7788", 1499);  // { status: 201, ok: true, data: [199, 499, 999, 1499] }
engine.getPremiumPlans(500);      // { status: 200, ok: true, data: [999, 1499] }
engine.applyTaxToAll(50);         // { status: 200, ok: true, data: [249, 549, 1049, 1549] }
engine.getLatestPlan();           // { status: 200, ok: true, data: 1499 }  <- not mutated!
```

---

## 🧪 Test Coverage — 35 Cases Across 7 Parts

| Part | Covers |
|------|--------|
| 1 | The 6 official QA acceptance tests |
| 2 | Brute-force lock (3 wrong → permanent `403`) |
| 3 | Garbage price rejection (`0`, `-100`, `"abc"`, `NaN`) |
| 4 | `getPremiumPlans` edge cases (empty result → `[]`, **not** an error) |
| 5 | `applyTaxToAll` edge cases + **immutability proof** |
| 6 | Broken input (`[]`, `"hello"`, `undefined` PIN) |
| 7 | Attempt-counter reset behaviour |

Expected output for every single line lives in [`docs/EXPECTED-OUTPUT.txt`](./docs/EXPECTED-OUTPUT.txt).

---

## 🧠 JavaScript Concepts Used (No Shortcuts)

- **Closures** — private state (`prices`, `attempts`) locked inside the factory function
- **Factory Function** returning an object of arrow-function methods
- **Guard clauses** with early returns
- **Array methods** — `.at()`, `.filter()`, `.map()`
- **Spread operator** — non-mutating add & merge
- **`Number.isFinite()`** — safe numeric validation
- **HTTP-style status codes** in a Result Object (`{ status, ok, data, error }`)

---

## 📈 Code Review Notes

Four bugs were caught during the senior review of this module:

1. `getLatestPlan` returned `{ first, last }` instead of only the last price — **always re-read the current ticket, not the old spec**.
2. `addNewPlan` never reset `attempts = 0` after a correct PIN — this silently broke the lock-reset test.
3. `getPremiumPlans` error path returned `ok: true` alongside `status: 400` — a contradictory response.
4. `applyTaxToAll` rejected `taxAmount = 0`, but **0% tax is valid** — only negatives should fail.

All four are fixed and covered by regression tests.

---

## 🗺️ Roadmap

- [x] Module 01 — Subscription Plan Engine (pure logic)
- [ ] Module 02 — Channel Loader (fetch & parse `iptv-org` channel JSON)
- [ ] Module 03 — Stream Resolver (match channels → working `.m3u8` streams)
- [ ] Module 04 — HLS.js Player Bridge (Smart TV playback)
- [ ] Module 05 — STREAM-OS Remote UI

---

## 👤 Author

**Debjeet Dhar** — Kolkata, India 🇮🇳
Learning in public. Building STREAM-OS from scratch, one pure-logic module at a time.

## 📄 License

MIT — see [LICENSE](./LICENSE).

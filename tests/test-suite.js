/* ============================================================
   STREAM-OS — Module 01 Test Suite
   Run with:  npm test      (or:  node tests/test-suite.js)
   ------------------------------------------------------------
   Compare your output with docs/EXPECTED-OUTPUT.txt
   ============================================================ */

const createSubscriptionEngine = require("../src/createSubscriptionEngine");

/* ============ PART 1 — OFFICIAL QA TESTS ============ */
console.log("===== PART 1: OFFICIAL QA TESTS =====");

const engine = createSubscriptionEngine("7788", [199, 499, 999]);

console.log("Test 1 (last plan):        ", engine.getLatestPlan());
console.log("Test 2 (wrong PIN):        ", engine.addNewPlan("0000", 1499));
console.log("Test 3 (correct PIN + add):", engine.addNewPlan("7788", 1499));
console.log("Test 4 (premium >= 500):   ", engine.getPremiumPlans(500));
console.log("Test 5 (add 50 tax):       ", engine.applyTaxToAll(50));
console.log("Test 6 (still 1499?):      ", engine.getLatestPlan());

/* ============ PART 2 — BRUTE-FORCE LOCK ============ */
console.log("\n===== PART 2: BRUTE-FORCE LOCK TEST =====");

const tv2 = createSubscriptionEngine("1111", [100, 200, 300]);

console.log("Lock A (wrong 1):   ", tv2.addNewPlan("9999", 500));
console.log("Lock B (wrong 2):   ", tv2.addNewPlan("9999", 500));
console.log("Lock C (wrong 3):   ", tv2.addNewPlan("9999", 500));
console.log("Lock D (CORRECT PIN but locked!):", tv2.addNewPlan("1111", 500));
console.log("Lock E (read still works):", tv2.getLatestPlan());

/* ============ PART 3 — INVALID PRICE ============ */
console.log("\n===== PART 3: INVALID PRICE TEST =====");

const tv3 = createSubscriptionEngine("4321", [500, 1000]);

console.log("Price 0:        ", tv3.addNewPlan("4321", 0));
console.log("Price -100:     ", tv3.addNewPlan("4321", -100));
console.log("Price 'abc':    ", tv3.addNewPlan("4321", "abc"));
console.log("Price NaN:      ", tv3.addNewPlan("4321", NaN));
console.log("Nothing added? (should be 1000):", tv3.getLatestPlan());

/* ============ PART 4 — getPremiumPlans EDGE CASES ============ */
console.log("\n===== PART 4: getPremiumPlans EDGE CASES =====");

console.log("minPrice 0:       ", tv3.getPremiumPlans(0));
console.log("minPrice -50:     ", tv3.getPremiumPlans(-50));
console.log("minPrice 'abc':   ", tv3.getPremiumPlans("abc"));
console.log("minPrice 600:     ", tv3.getPremiumPlans(600));
console.log("minPrice 99999:   ", tv3.getPremiumPlans(99999));

/* ============ PART 5 — applyTaxToAll + IMMUTABILITY ============ */
console.log("\n===== PART 5: applyTaxToAll EDGE CASES =====");

console.log("tax -10:   ", tv3.applyTaxToAll(-10));
console.log("tax 'abc': ", tv3.applyTaxToAll("abc"));
console.log("tax 0:     ", tv3.applyTaxToAll(0));
console.log("tax 100:   ", tv3.applyTaxToAll(100));
console.log("NOT mutated? (should be 1000):", tv3.getLatestPlan());

/* ============ PART 6 — BROKEN INPUT ============ */
console.log("\n===== PART 6: BROKEN INPUT TEST =====");

const tvEmpty = createSubscriptionEngine("0000", []);
console.log("Empty array engine:  ", tvEmpty.getLatestPlan());

const tvBroken = createSubscriptionEngine("1234", "hello");
console.log("Non-array 'hello':   ", tvBroken.getLatestPlan());

console.log("undefined PIN:       ", tv3.addNewPlan(undefined, 100));

/* ============ PART 7 — ATTEMPT RESET ============ */
console.log("\n===== PART 7: ATTEMPT RESET TEST =====");

const tv4 = createSubscriptionEngine("5555", [10]);

console.log("wrong 1:        ", tv4.addNewPlan("0000", 20));
console.log("wrong 2:        ", tv4.addNewPlan("0000", 20));
console.log("CORRECT (reset):", tv4.addNewPlan("5555", 20));
console.log("wrong again:    ", tv4.addNewPlan("0000", 30));
console.log("CORRECT again:  ", tv4.addNewPlan("5555", 30));

console.log("\nAll tests executed. Compare with docs/EXPECTED-OUTPUT.txt");

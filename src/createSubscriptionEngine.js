/* ============================================================
   STREAM-OS — Module 01: Subscription Plan Engine
   Company Ticket: FIN-204
   Engineer: Debjeet Dhar
   ------------------------------------------------------------
   WHAT IT DOES:
   A secure, in-memory subscription wallet for a Smart TV account.
   The PIN, the failed-attempt counter and the plan list are all
   PRIVATE (locked inside a closure) — nobody outside can touch them.
   ------------------------------------------------------------
   SECURITY RULES BUILT IN:
   1. Brute-force lock  -> 3 wrong PINs = permanent lock (403)
   2. Counter reset     -> correct PIN resets failed attempts to 0
   3. Immutability      -> original plan list is NEVER mutated
   4. Consistent return -> every method returns { status, ok, data|error }
   ============================================================ */

function createSubscriptionEngine(
  secretPin = "7788",
  initialPlans = [199, 499, 999],
) {
  const MAX_ATTEMPT = 3;
  let prices = initialPlans;
  let attempts = 0;

  return {
    /* ---------- METHOD 1: getLatestPlan ---------- */
    getLatestPlan: () => {
      if (!Array.isArray(prices) || prices.length === 0) {
        return { status: 400, ok: false, error: "No plans available!" };
      }

      return { status: 200, ok: true, data: prices.at(-1) };
    },

    /* ---------- METHOD 2: addNewPlan ---------- */
    addNewPlan: (pin, planPrice) => {
      // Guard 1 — is the engine already locked?
      if (attempts >= MAX_ATTEMPT) {
        return {
          status: 403,
          ok: false,
          error: "Engine Locked! Too many wrong PINs!",
        };
      }

      // Guard 2 — is the PIN correct?
      if (pin !== secretPin) {
        attempts = attempts + 1;
        return { status: 401, ok: false, error: "Wrong PIN!" };
      }

      // Guard 3 — is the price a valid positive number?
      if (!Number.isFinite(planPrice) || planPrice <= 0) {
        return { status: 400, ok: false, error: "Invalid price!" };
      }

      // Guard 4 — is the stored list still healthy?
      if (!Array.isArray(prices)) {
        return { status: 400, ok: false, error: "Plans list is corrupted!" };
      }

      // Reset the brute-force counter after a successful entry
      attempts = 0;

      // Non-mutating add (spread operator) — original array untouched!
      prices = [...prices, planPrice];

      return { status: 201, ok: true, data: prices };
    },

    /* ---------- METHOD 3: getPremiumPlans ---------- */
    getPremiumPlans: (minPrice) => {
      if (!Array.isArray(prices)) {
        return { status: 400, ok: false, error: "Plans list is corrupted!" };
      }

      if (!Number.isFinite(minPrice) || minPrice <= 0) {
        return { status: 400, ok: false, error: "Invalid minPrice!" };
      }

      // Keep only plans that cost minPrice or more (defensive: skip garbage)
      const premiumPlans = prices.filter(
        (p) => Number.isFinite(p) && p >= minPrice,
      );

      return { status: 200, ok: true, data: premiumPlans };
    },

    /* ---------- METHOD 4: applyTaxToAll ---------- */
    applyTaxToAll: (taxAmount) => {
      if (!Array.isArray(prices)) {
        return { status: 400, ok: false, error: "Plans list is corrupted!" };
      }

      // 0% tax is VALID — only negative values are rejected
      if (!Number.isFinite(taxAmount) || taxAmount < 0) {
        return { status: 400, ok: false, error: "Invalid tax amount!" };
      }

      // .map() returns a BRAND-NEW array -> stored prices stay untouched!
      const taxedPlans = prices.map((p) => p + taxAmount);

      return { status: 200, ok: true, data: taxedPlans };
    },
  };
}

// Node.js plumbing: share this function with other files.
module.exports = createSubscriptionEngine;

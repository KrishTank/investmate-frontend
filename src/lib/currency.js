// Central currency formatting for Investmate — Indian Rupees (₹), Indian
// digit grouping (lakh/crore), everywhere in the app.

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Compact form for chart axes / tight spaces: ₹1.5L, ₹2.3Cr, etc.
export const compactCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});
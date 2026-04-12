/**
 * Parses a quantity string (e.g., "10 kg", "5.5 tonnes") into a numeric value.
 * @param {string|number} q The quantity to parse.
 * @returns {number} The numeric quantity, or 1 if parsing fails.
 */
export const parseQuantityNumber = (q) => {
  if (q === null || q === undefined) return 1;
  const str = q.toString();
  const match = str.match(/([0-9]+(\.[0-9]+)?)/);
  if (match) return parseFloat(match[1]);
  const n = Number(q);
  return isNaN(n) ? 1 : n;
};

/**
 * Formats a number as Indian Rupee (INR) currency.
 * @param {number} amount The amount to format.
 * @param {number} decimals Number of decimal places (default 2).
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

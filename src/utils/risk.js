// Calculates the number of whole days between today and the expiry date.
// Negative value = already expired.
export function daysUntil(expiryISO) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(expiryISO);
  expiryDate.setHours(0, 0, 0, 0);

  const diffMs = expiryDate - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Converts the raw day count into a traffic-light style status used around the UI.
export function getExpiryStatus(expiryISO) {
  const days = daysUntil(expiryISO);

  if (days < 0) return { label: "Overdue", tone: "danger", days };
  if (days <= 2) return { label: "Expiring soon", tone: "warning", days };
  return { label: "OK", tone: "ok", days };
}

// Optional helper if the project later needs a single urgency score for charts or ranking.
export function urgencyScore(expiryISO) {
  const status = getExpiryStatus(expiryISO);

  if (status.tone === "danger") return 1000 + Math.abs(status.days);
  if (status.tone === "warning") return 500 + (2 - status.days);
  return 0;
}

// Optional helper used to turn expiry status into a short recommendation.
export function suggestedAction(expiryISO) {
  const status = getExpiryStatus(expiryISO);

  if (status.tone === "danger") {
    return "Dispose / log waste";
  }

  if (status.tone === "warning") {
    return "Use first / apply discount";
  }

  return "Monitor";
}

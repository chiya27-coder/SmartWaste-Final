import { useMemo, useState } from "react";
import { getExpiryStatus } from "../utils/risk.js";
import { Badge, Field, Section, StatCard } from "../components/ui.jsx";

// Decision support text shown under each stock item.
function actionText(tone) {
  if (tone === "danger") {
    return "Remove this item from sale, inspect quality, and log the outcome immediately.";
  }

  if (tone === "warning") {
    return "Prioritise this item in prep, specials, or discounting before it becomes waste.";
  }

  return "No urgent action needed. Continue standard stock rotation.";
}

// Numeric score makes inventory sorting easier.
function toneScore(tone) {
  if (tone === "danger") return 3;
  if (tone === "warning") return 2;
  return 1;
}

export default function Inventory({ inventory = [], actions }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setQuantity(1);
    setUnit("pcs");
    setExpiry("");
    setError("");
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter an item name.");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (!unit.trim()) {
      setError("Please enter a unit.");
      return;
    }

    if (!expiry) {
      setError("Please select an expiry date.");
      return;
    }

    actions.addItem({
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      expiry,
    });

    resetForm();
  }

  // Pre-calculate item status and summary counts once per render.
  const { sortedInventory, overdueCount, warningCount, okCount } = useMemo(() => {
    const inventoryWithStatus = inventory.map((item) => ({
      ...item,
      status: getExpiryStatus(item.expiry),
    }));

    const sortedInventory = [...inventoryWithStatus].sort((a, b) => {
      const toneDiff = toneScore(b.status.tone) - toneScore(a.status.tone);
      if (toneDiff !== 0) return toneDiff;
      return String(a.expiry).localeCompare(String(b.expiry));
    });

    return {
      sortedInventory,
      overdueCount: inventoryWithStatus.filter((item) => item.status.tone === "danger").length,
      warningCount: inventoryWithStatus.filter((item) => item.status.tone === "warning").length,
      okCount: inventoryWithStatus.filter((item) => item.status.tone === "ok").length,
    };
  }, [inventory]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Inventory management</h2>
        <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.7 }}>
          Add stock, track expiry dates, and remove items with a logged outcome when they leave inventory.
        </p>
      </div>

      <div className="triple-grid">
        <StatCard
          title="Total items"
          value={inventory.length}
          note="All stock lines currently in the system."
        />

        <StatCard
          title="Urgent items"
          value={overdueCount + warningCount}
          note="Items needing immediate or near-term action."
          tone={overdueCount + warningCount > 0 ? "warning" : "default"}
        />

        <StatCard
          title="Healthy stock"
          value={okCount}
          note="Items currently at low expiry risk."
        />
      </div>

      <Section title="Add item" subtitle="Use consistent stock updates to keep the dashboard accurate.">
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <Field label="Item name" hint="Use a clear kitchen-friendly name.">
            <input
              placeholder="e.g. Whole milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <div className="triple-grid">
            <Field label="Quantity">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>

            <Field label="Unit">
              <input
                placeholder="pcs / L / kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </Field>

            <Field label="Expiry date">
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Field>
          </div>

          {error ? (
            <div
              style={{
                border: "1px solid #fecaca",
                background: "#fff1f2",
                color: "#b91c1c",
                padding: 14,
                borderRadius: 18,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" type="submit">
              Add item
            </button>

            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Clear form
            </button>
          </div>
        </form>
      </Section>

      <Section title="Current items" subtitle="Sorted by expiry risk so urgent stock appears first.">
        {sortedInventory.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            No items yet. Add stock lines to begin tracking inventory.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedInventory.map((item) => {
              const status = item.status;
              const label = status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

              return (
                <div key={item.id} className="item-row">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>

                    <div
                      style={{
                        marginTop: 8,
                        color: "#64748b",
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <strong>{item.quantity}</strong> {item.unit}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Expiry:</strong> {item.expiry}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Badge tone={status.tone}>{label}</Badge>
                    </div>

                    <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.6 }}>
                      {actionText(status.tone)}
                    </div>
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={() => actions.requestRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
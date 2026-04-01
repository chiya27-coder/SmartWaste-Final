import { useMemo } from "react";
import { getExpiryStatus } from "../utils/risk.js";
import { Badge, Section, StatCard } from "../components/ui.jsx";

// Short guidance text shown beside each stock item.
// This gives the prototype a more realistic "decision support" feel.
function actionText(tone) {
  if (tone === "danger") {
    return "Take this off sale, investigate storage, and log the final outcome today.";
  }

  if (tone === "warning") {
    return "Push this item into specials or prep today so it does not become waste.";
  }

  return "No urgent action needed yet. Continue monitoring stock rotation.";
}

// Sorting helper so overdue items always appear above warning and OK items.
function toneRank(tone) {
  return tone === "danger" ? 0 : tone === "warning" ? 1 : 2;
}

// Converts a waste log entry into a plain-English note.
function formatOutcomeNote(entry) {
  if (entry.notes?.trim()) {
    return entry.notes.trim();
  }

  if (entry.outcome === "wasted") {
    return `${entry.name} was discarded after expiry and recorded as waste.`;
  }

  if (entry.outcome === "donated") {
    return `${entry.name} left stock as a donation instead of being thrown away.`;
  }

  return `${entry.name} was used in service or prep, helping reduce avoidable waste.`;
}

export default function Dashboard({ inventory = [], wasteLog = [] }) {
  // All dashboard metrics are prepared in one memoised block.
  // This keeps the render section cleaner and avoids repeating calculations.
  const {
    overdue,
    expiringSoon,
    okCount,
    urgentTop,
    savedCount,
    wastedCount,
    saveRate,
    staffNotes,
  } = useMemo(() => {
    const stockWithStatus = inventory.map((item) => ({
      item,
      status: getExpiryStatus(item.expiry),
    }));

    const overdue = stockWithStatus.filter((entry) => entry.status.tone === "danger").length;
    const expiringSoon = stockWithStatus.filter((entry) => entry.status.tone === "warning").length;
    const okCount = stockWithStatus.filter((entry) => entry.status.tone === "ok").length;

    const urgentTop = [...stockWithStatus]
      .sort((a, b) => {
        const rank = toneRank(a.status.tone) - toneRank(b.status.tone);
        if (rank !== 0) return rank;
        return String(a.item.expiry).localeCompare(String(b.item.expiry));
      })
      .slice(0, 5);

    const wastedCount = wasteLog.filter((entry) => entry.outcome === "wasted").length;
    const savedCount = wasteLog.length - wastedCount;
    const saveRate = wasteLog.length === 0 ? 0 : Math.round((savedCount / wasteLog.length) * 100);

    // Show the latest two waste log entries as realistic staff notes.
    const recentLogNotes = wasteLog.slice(0, 2).map((entry, index) => {
      const authorNames = ["Maya", "Jordan"];
      const roles = ["Kitchen staff", "Shift manager"];

      return {
        id: `log-${entry.id}`,
        author: authorNames[index] || "Team member",
        role: roles[index] || "Staff",
        time: entry.atISO
          ? new Date(entry.atISO).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
            })
          : "Recently",
        text: formatOutcomeNote(entry),
      };
    });

    // Fallback notes keep the dashboard looking realistic before the user generates real logs.
    const fallbackNotes = [
      {
        id: "fallback-1",
        author: "Maya",
        role: "Kitchen staff",
        time: "08:40",
        text: "Whole milk is running low. Only 2 cartons are left in chilled storage.",
      },
      {
        id: "fallback-2",
        author: "Jordan",
        role: "Shift manager",
        time: "09:15",
        text: "Tomatoes nearing expiry were moved into soup prep to avoid waste during lunch service.",
      },
    ];

    const alertNote = {
      id: "system-alert",
      author: "System",
      role: "Auto alert",
      time: "Now",
      text:
        urgentTop.length > 0
          ? `${urgentTop[0].item.name} is marked ${
              urgentTop[0].status?.label?.toLowerCase() || "for review"
            }. Review it before the next shift.`
          : "No urgent stock alerts right now. Keep inventory updated to maintain accurate reporting.",
    };

    const staffNotes = [alertNote, ...recentLogNotes];

    while (staffNotes.length < 3) {
      staffNotes.push(fallbackNotes[staffNotes.length - 1]);
    }

    return {
      overdue,
      expiringSoon,
      okCount,
      urgentTop,
      savedCount,
      wastedCount,
      saveRate,
      staffNotes: staffNotes.slice(0, 3),
    };
  }, [inventory, wasteLog]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Operational overview</h2>
        <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.7 }}>
          Use this view to spot urgent stock, review waste outcomes, and act before food expires.
        </p>
      </div>

      <div className="metric-grid">
        <StatCard
          title="Tracked items"
          value={inventory.length}
          note="Active stock lines currently being monitored."
        />

        <StatCard
          title="Expiring soon"
          value={expiringSoon}
          note="Items due within the next 2 days."
          tone="warning"
        />

        <StatCard
          title="Overdue"
          value={overdue}
          note="Expired items requiring immediate action."
          tone="danger"
        />

        <StatCard
          title="Healthy stock"
          value={okCount}
          note="Items currently at low expiry risk."
        />
      </div>

      <div className="dual-grid">
        <Section title="Waste outcomes" subtitle="Keep an eye on whether stock is being recovered or lost.">
          <div className="dual-grid">
            <StatCard
              title="Saved"
              value={savedCount}
              note="Sold, used, or donated after removal."
            />

            <StatCard
              title="Wasted"
              value={wastedCount}
              note="Items discarded and counted as waste."
              tone={wastedCount > 0 ? "danger" : "default"}
            />
          </div>

          <div
            className="card"
            style={{
              padding: 18,
              marginTop: 16,
              background: "linear-gradient(180deg, #ffffff, #f0f9f1)",
              borderColor: "#d7e7d8",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Recovery rate
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 34,
                fontWeight: 900,
                color: saveRate >= 70 ? "#166534" : "#0f172a",
              }}
            >
              {saveRate}%
            </div>

            <div style={{ marginTop: 10, color: "#64748b", lineHeight: 1.6 }}>
              Based on all logged outcomes so far. A higher value means more food was saved rather than wasted.
            </div>
          </div>
        </Section>

        <Section title="Today’s focus" subtitle="A short operational summary for the next shift.">
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Priority checklist</div>
            <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: "#475569", lineHeight: 1.9 }}>
              <li>Review overdue items before opening service.</li>
              <li>Push expiring stock into specials, prep, or discounts.</li>
              <li>Log all removals so reporting stays accurate.</li>
              <li>Use the inventory page to keep incoming stock current.</li>
            </ul>
          </div>
        </Section>
      </div>

      <div className="dual-grid">
        <Section
          title="Top urgent items"
          subtitle="Items are ranked by expiry risk so your team can act quickly."
          action={
            <Badge tone={urgentTop.some((item) => item.status.tone === "danger") ? "danger" : "ok"}>
              {urgentTop.length} items flagged
            </Badge>
          }
        >
          {urgentTop.length === 0 ? (
            <div style={{ color: "#64748b" }}>
              No inventory yet. Add stock lines to begin tracking expiry risk.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {urgentTop.map(({ item, status }) => {
                const label = status.tone === "ok" ? "OK" : `${status.label} (${status.days}d)`;

                return (
                  <div key={item.id} className="item-row">
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
                      <div style={{ marginTop: 8, color: "#64748b", display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>
                          <strong>{item.quantity}</strong> {item.unit}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Expiry:</strong> {item.expiry}
                        </span>
                      </div>
                      <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.6 }}>
                        {actionText(status.tone)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "start" }}>
                      <Badge tone={status.tone}>{label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Recent staff notes" subtitle="Short operational notes linked to stock, waste, and daily actions.">
          <div className="comments-list">
            {staffNotes.map((note) => (
              <div key={note.id} className="comment-card">
                <div className="comment-top">
                  <div>
                    <strong>{note.author}</strong>
                    <div className="comment-meta">{note.role}</div>
                  </div>
                  <span className="comment-time">{note.time}</span>
                </div>
                <p className="comment-text">{note.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
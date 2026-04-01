import { Badge, Section, StatCard } from "../components/ui.jsx";

// Converts the raw log outcome into a display label, colour, and supporting explanation.
function outcomeMeta(outcome) {
  if (outcome === "wasted") {
    return {
      label: "Wasted",
      tone: "danger",
      summary: "Discarded and counted as waste.",
    };
  }

  if (outcome === "donated") {
    return {
      label: "Donated",
      tone: "ok",
      summary: "Recovered through donation.",
    };
  }

  return {
    label: "Sold / Used",
    tone: "ok",
    summary: "Recovered through service or preparation.",
  };
}

// Makes sure every log card still reads clearly even if the user left notes blank.
function formatNotes(entry) {
  if (entry.notes?.trim()) {
    return entry.notes.trim();
  }

  if (entry.outcome === "wasted") {
    return "No extra note added. Item was removed and recorded as waste.";
  }

  if (entry.outcome === "donated") {
    return "No extra note added. Item left stock as a donation.";
  }

  return "No extra note added. Item was recovered through use or sale.";
}

export default function Logs({ wasteLog = [] }) {
  const total = wasteLog.length;
  const wasted = wasteLog.filter((entry) => entry.outcome === "wasted").length;
  const saved = total - wasted;

  // Most recent entries appear first.
  const sortedLogs = [...wasteLog].sort((a, b) =>
    String(b.atISO).localeCompare(String(a.atISO))
  );

  const latestEntry = sortedLogs[0] || null;
  const latestMeta = latestEntry ? outcomeMeta(latestEntry.outcome) : null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Outcome logs</h2>
        <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.7 }}>
          Review what happened to removed items and use the trend to improve stock decisions.
        </p>
      </div>

      <div className="triple-grid">
        <StatCard
          title="Total logs"
          value={total}
          note="All recorded removals."
        />

        <StatCard
          title="Recovered"
          value={saved}
          note="Sold, used, or donated items."
        />

        <StatCard
          title="Lost to waste"
          value={wasted}
          note="Discarded stock items."
          tone={wasted > 0 ? "danger" : "default"}
        />
      </div>

      <div className="dual-grid">
        <Section title="Latest recorded outcome" subtitle="Most recent inventory removal summary.">
          {latestEntry ? (
            <div
              className="card"
              style={{
                padding: 18,
                background:
                  latestMeta?.tone === "danger"
                    ? "linear-gradient(180deg, #fff7f7, #fff1f2)"
                    : "linear-gradient(180deg, #ffffff, #f0f9f1)",
                borderColor:
                  latestMeta?.tone === "danger" ? "#fecaca" : "#d7e7d8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>
                    {latestEntry.name}
                  </div>

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
                      <strong>{latestEntry.quantity}</strong> {latestEntry.unit}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Expiry:</strong> {latestEntry.expiry}
                    </span>
                  </div>
                </div>

                <Badge tone={latestMeta.tone}>{latestMeta.label}</Badge>
              </div>

              <div style={{ marginTop: 14, color: "#475569", lineHeight: 1.7 }}>
                {formatNotes(latestEntry)}
              </div>

              <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
                {latestMeta.summary}
              </div>

              <div style={{ marginTop: 14, fontSize: 14, color: "#64748b" }}>
                Logged: {latestEntry.atISO ? new Date(latestEntry.atISO).toLocaleString() : "-"}
              </div>
            </div>
          ) : (
            <div style={{ color: "#64748b" }}>
              No logs yet. Remove an item from inventory to create the first entry.
            </div>
          )}
        </Section>

        <Section title="What these logs show" subtitle="Use the pattern to improve decisions over time.">
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Interpretation guide</div>
            <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: "#475569", lineHeight: 1.9 }}>
              <li>Repeated waste entries may indicate over-ordering or weak stock rotation.</li>
              <li>Recovered items suggest better use of specials, prep planning, or donations.</li>
              <li>Useful notes make it easier to explain why stock left the system.</li>
              <li>More complete logs lead to more reliable reporting in the dashboard.</li>
            </ul>
          </div>
        </Section>
      </div>

      <Section title="Log history" subtitle="Most recent first with outcome tags and notes.">
        {sortedLogs.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            No logs yet. Remove an item from inventory to create a log entry.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedLogs.map((entry) => {
              const meta = outcomeMeta(entry.outcome);
              const when = entry.atISO ? new Date(entry.atISO).toLocaleString() : "-";

              return (
                <div key={entry.id} className="item-row">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{entry.name}</div>

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
                        <strong>{entry.quantity}</strong> {entry.unit}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Expiry:</strong> {entry.expiry}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Logged:</strong> {when}
                      </span>
                    </div>

                    <div style={{ marginTop: 12, color: "#475569", lineHeight: 1.6 }}>
                      <strong>Notes:</strong> {formatNotes(entry)}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
                      {meta.summary}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "start" }}>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
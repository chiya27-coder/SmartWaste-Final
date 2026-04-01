// Reusable presentational components.
// These components keep styling and spacing consistent across the app
// while also making the UI easier to maintain.

export function Badge({ tone = "ok", children }) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.48rem 0.82rem",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid",
    whiteSpace: "nowrap",
    letterSpacing: "-0.01em",
  };

  const toneStyles =
    tone === "danger"
      ? {
          background: "#fff1f2",
          borderColor: "#fecdd3",
          color: "#be123c",
        }
      : tone === "warning"
      ? {
          background: "#fffbeb",
          borderColor: "#fde68a",
          color: "#b45309",
        }
      : {
          background: "#dcfce7",
          borderColor: "#bbf7d0",
          color: "#166534",
        };

  return <span style={{ ...baseStyle, ...toneStyles }}>{children}</span>;
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div>
        <label
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#334155",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </label>

        {hint ? (
          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

export function StatCard({ title, value, note, tone = "default" }) {
  const toneStyle =
    tone === "danger"
      ? {
          borderColor: "#fecaca",
          background: "linear-gradient(180deg, #fff7f7, #fff1f2)",
        }
      : tone === "warning"
      ? {
          borderColor: "#fde68a",
          background: "linear-gradient(180deg, #fffdf6, #fffbeb)",
        }
      : {};

  const valueColor =
    tone === "danger"
      ? "#b42318"
      : tone === "warning"
      ? "#b45309"
      : "#0f172a";

  return (
    <div className="card" style={{ padding: 18, ...toneStyle }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 34,
          fontWeight: 900,
          color: valueColor,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      {note ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function Section({ title, subtitle, children, action }) {
  return (
    <section className="section">
      <div
        className="section-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                color: "#64748b",
                lineHeight: 1.6,
                maxWidth: 620,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {action ? <div>{action}</div> : null}
      </div>

      <div className="section-body">{children}</div>
    </section>
  );
}
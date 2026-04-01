import { useEffect, useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import Logs from "./pages/Logs.jsx";

// Keys used for browser storage.
// In this prototype the app stores the current user and created accounts in localStorage
// so the login flow works without a real backend.
const AUTH_KEY = "smartwaste-user";
const USERS_KEY = "smartwaste-users";

// Seed data helps the prototype look populated on first load.
// This is useful for demos and usability testing.
const seedInventory = [
  { id: 1, name: "Milk", quantity: 8, unit: "L", expiry: "2026-01-22" },
  { id: 2, name: "Chicken breast", quantity: 12, unit: "pcs", expiry: "2026-01-20" },
  { id: 3, name: "Tomatoes", quantity: 30, unit: "pcs", expiry: "2026-01-19" },
];

// Safely read JSON data from localStorage.
// If storage is empty or invalid, the function returns the fallback value instead.
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Small helper to keep storage writes consistent across the app.
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Mobile bottom navigation button.
function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center py-3 text-sm font-semibold transition ${
        active ? "text-green-700" : "text-gray-500 hover:text-gray-700"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}

// Reusable modal wrapper used when an item is removed from inventory.
// The item is not deleted immediately. The user must first record the outcome.
function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.42)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 100%)", padding: 20 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{title}</div>
            <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
              Record what happened so the dashboard stays accurate.
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>

        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}

// Login / sign-up screen.
// This is intentionally simple because the focus of the project is inventory and waste tracking,
// not enterprise authentication.
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const users = readStorage(USERS_KEY, []);

    if (mode === "signup") {
      if (!name.trim() || !business.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      const existingUser = users.find(
        (storedUser) => storedUser.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        business: business.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      writeStorage(USERS_KEY, [...users, newUser]);
      writeStorage(AUTH_KEY, newUser);
      onLogin(newUser);
      return;
    }

    const matchedUser = users.find(
      (storedUser) =>
        storedUser.email.toLowerCase() === email.trim().toLowerCase() &&
        storedUser.password === password
    );

    if (!matchedUser) {
      setError("Invalid email or password.");
      return;
    }

    writeStorage(AUTH_KEY, matchedUser);
    onLogin(matchedUser);
  }

  return (
    <div className="auth-grid app-shell">
      <section className="auth-hero">
        <div style={{ maxWidth: 560 }}>
          <div className="logo-badge">S</div>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 4vw, 4.8rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              marginTop: 24,
            }}
          >
            Smarter stock control for less food waste.
          </h1>
          <p
            style={{
              marginTop: 18,
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(240, 253, 244, 0.88)",
            }}
          >
            SmartWaste helps small cafés and restaurants track stock, spot items at risk,
            and record what happens when food leaves inventory.
          </p>
        </div>
      </section>

      <section className="auth-form-wrap">
        <div className="glass-panel auth-card">
          <div
            style={{
              color: "#16a34a",
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Welcome to SmartWaste
          </div>

          <h2 style={{ fontSize: 30, marginTop: 8, marginBottom: 6, fontWeight: 900 }}>
            {mode === "login" ? "Log in" : "Create account"}
          </h2>

          <p style={{ color: "#64748b", margin: 0 }}>
            {mode === "login"
              ? "Access your dashboard and inventory tools."
              : "Set up a business account to start tracking food waste."}
          </p>

          <div className="auth-tabs" style={{ marginTop: 20 }}>
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "grid", gap: 14, marginTop: 22 }}>
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  type="text"
                  name="organization"
                  autoComplete="organization"
                  placeholder="Business name"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                />
              </>
            )}

            <input
              type="email"
              name="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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

            <button type="submit" className="btn btn-primary auth-submit">
              {mode === "login" ? "Enter dashboard" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Main application shell.
// Controls navigation, keeps shared state in one place, and passes data to each page.
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [inventory, setInventory] = useState(seedInventory);
  const [wasteLog, setWasteLog] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [logItem, setLogItem] = useState(null);
  const [user, setUser] = useState(null);

  // Restore the saved login on refresh.
  useEffect(() => {
    const savedUser = readStorage(AUTH_KEY, null);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Centralised actions passed down to page components.
  // Keeping these together makes the child pages simpler to read.
  const inventoryActions = useMemo(
    () => ({
      // Add a brand new inventory line.
      addItem: (item) => setInventory((prev) => [{ id: Date.now(), ...item }, ...prev]),

      // Older compatibility handler: if a page only provides an id, find the item first.
      removeItem: (id) => {
        setInventory((prev) => {
          const foundItem = prev.find((entry) => entry.id === id);
          if (foundItem) {
            setLogItem(foundItem);
            setLogOpen(true);
          }
          return prev;
        });
      },

      // Preferred remove flow: open the modal with the whole item object.
      requestRemove: (item) => {
        setLogItem(item);
        setLogOpen(true);
      },

      // Delete from inventory only after the user finishes the outcome log.
      removeItemNow: (id) => setInventory((prev) => prev.filter((entry) => entry.id !== id)),

      // Save a log entry so the dashboard and logs page can analyse outcomes later.
      addWasteLog: (entry) => setWasteLog((prev) => [{ id: Date.now(), ...entry }, ...prev]),
    }),
    []
  );

  function closeLogModal() {
    setLogOpen(false);
    setLogItem(null);
  }

  // When the waste modal is submitted, a log entry is created first, then the stock item is removed.
  function submitLog({ outcome, notes }) {
    if (!logItem) return;

    inventoryActions.addWasteLog({
      itemId: logItem.id,
      name: logItem.name,
      quantity: logItem.quantity,
      unit: logItem.unit,
      expiry: logItem.expiry,
      outcome,
      notes: notes || "",
      atISO: new Date().toISOString(),
    });

    inventoryActions.removeItemNow(logItem.id);
    closeLogModal();
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setPage("dashboard");
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto w-full max-w-5xl px-4" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="logo-badge">S</div>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>
                SmartWaste
              </h1>
            </div>

            <nav className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className={`btn ${page === "dashboard" ? "btn-primary" : "btn-ghost"}`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => setPage("inventory")}
                className={`btn ${page === "inventory" ? "btn-primary" : "btn-ghost"}`}
              >
                Inventory
              </button>

              <button
                type="button"
                onClick={() => setPage("logs")}
                className={`btn ${page === "logs" ? "btn-primary" : "btn-ghost"}`}
              >
                Logs
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div
                className="hidden md:block"
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#334155",
                  padding: "0.45rem 0.75rem",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.62)",
                  border: "1px solid #d8e3d9",
                }}
              >
                {user.name}
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4" style={{ paddingTop: 18, paddingBottom: 90 }}>
        {page === "dashboard" ? (
          <Dashboard
            inventory={inventory}
            wasteLog={wasteLog}
            user={{ fullName: user.name, businessName: user.business }}
          />
        ) : page === "inventory" ? (
          <Inventory inventory={inventory} actions={inventoryActions} />
        ) : (
          <Logs wasteLog={wasteLog} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-5xl">
          <TabButton label="Dashboard" active={page === "dashboard"} onClick={() => setPage("dashboard")} />
          <TabButton label="Inventory" active={page === "inventory"} onClick={() => setPage("inventory")} />
          <TabButton label="Logs" active={page === "logs"} onClick={() => setPage("logs")} />
        </div>
      </nav>

      <Modal open={logOpen} title="Log item outcome" onClose={closeLogModal}>
        {!logItem ? null : <WasteLogForm item={logItem} onCancel={closeLogModal} onSubmit={submitLog} />}
      </Modal>
    </div>
  );
}

// Form shown inside the modal when a stock item leaves inventory.
// This forces the user to record whether the item was saved or wasted.
function WasteLogForm({ item, onCancel, onSubmit }) {
  const [outcome, setOutcome] = useState("sold_used");
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ outcome, notes });
      }}
      style={{ display: "grid", gap: 14 }}
    >
      <div
        style={{
          padding: 14,
          borderRadius: 18,
          border: "1px solid #dbe8dc",
          background: "#f7fbf7",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
        <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
          {item.quantity} {item.unit} • Expiry: {item.expiry}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 8 }}>
          Outcome
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              type="radio"
              name="outcome"
              value="sold_used"
              checked={outcome === "sold_used"}
              onChange={() => setOutcome("sold_used")}
              style={{ width: 18, height: 18, marginTop: 3 }}
            />
            <div>
              <div style={{ fontWeight: 800 }}>Sold / Used</div>
              <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
                Item was sold, used in prep, or otherwise recovered.
              </div>
            </div>
          </label>

          <label className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              type="radio"
              name="outcome"
              value="donated"
              checked={outcome === "donated"}
              onChange={() => setOutcome("donated")}
              style={{ width: 18, height: 18, marginTop: 3 }}
            />
            <div>
              <div style={{ fontWeight: 800 }}>Donated</div>
              <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
                Item left stock but still created social value.
              </div>
            </div>
          </label>

          <label className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              type="radio"
              name="outcome"
              value="wasted"
              checked={outcome === "wasted"}
              onChange={() => setOutcome("wasted")}
              style={{ width: 18, height: 18, marginTop: 3 }}
            />
            <div>
              <div style={{ fontWeight: 800 }}>Wasted</div>
              <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
                Item was discarded and should count as waste.
              </div>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontWeight: 800, marginBottom: 8, color: "#334155" }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="For example: used in soup special, donated at closing, or spoiled in storage."
        />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          Save log
        </button>
      </div>
    </form>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeCanvas } from "qrcode.react";

// ---- Supabase config ----
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof window !== "undefined" ? window.SUPABASE_URL : "") ||
  "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" ? window.SUPABASE_ANON_KEY : "") ||
  "YOUR-PUBLISHABLE-KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
// === Week helpers (ADD this under your Supabase client code) ===
function startOfWeek(d) {
  const x = new Date(d);
  // Monday as first day of week (Mon=1 ... Sun=7)
  const day = x.getDay() || 7;
  if (day !== 1) x.setDate(x.getDate() - (day - 1));
  x.setHours(0,0,0,0);
  return x;
}
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function getThisWeek() {
  const first = startOfWeek(new Date());
  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i); // Mon..Fri
    const key = ymd(d);
    const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    return { key, label, date: d };
  });
}

const LOCATIONS = ["Gagnaver", "Verkstæði"];

// --- i18n ---
const LANGS = [
  { code: "en", label: "English" },
  { code: "is", label: "Íslenska" },
  { code: "pl", label: "Polski" },
  { code: "lt", label: "Lietuvių" },
];

const T = {
  en: {
    title: "Company Lunch Orders",
    magic: "Magic link",
    signout: "Sign out",
    yourEmail: "you@company.com",
    yourName: "Your name (if not signed in)",
    placeOrder: "Place your order",
    deadline: "Deadline",
    deliverTo: "Deliver to",
    todaysMenu: "Today's menu",
    notePlaceholder: "Note (optional) e.g. no onions",
    submitOrder: "Submit order",
    totals: "Today's totals",
    exportOrders: "Export orders CSV",
    exportTotals: "Export totals CSV",
    shareLink: "Share link",
    adminPanel: "Admin panel",
    date: "Date",
    pasteMenu: "Paste today's menu (Name | description | price)",
    publishMenu: "Publish menu",
    clearToday: "Clear today",
    manageOrders: "Manage orders",
    noItems: "No items yet.",
    noOrders: "No orders yet.",
    orderingClosed: "Ordering is closed for today.",
    language: "Language",
  },
  is: {
    title: "Fyrirtækismatur",
    magic: "Töfratengill",
    signout: "Skrá út",
    yourEmail: "þu@fyrirtaeki.is",
    yourName: "Nafn (ef ekki skráð/ur inn)",
    placeOrder: "Panta",
    deadline: "Síðasti tími",
    deliverTo: "Afhenda í",
    todaysMenu: "Matseðill dagsins",
    notePlaceholder: "Athugasemd (valfrjálst)",
    submitOrder: "Staðfesta pöntun",
    totals: "Samtölur dagsins",
    exportOrders: "Flytja út pöntunir",
    exportTotals: "Flytja út samtölur",
    shareLink: "Deila hlekk",
    adminPanel: "Stjórnborð",
    date: "Dagsetning",
    pasteMenu: "Líma matseðil (Nafn | lýsing | verð)",
    publishMenu: "Birta matseðil",
    clearToday: "Hreinsa daginn",
    manageOrders: "Sýsla með pöntanir",
    noItems: "Engir réttir enn.",
    noOrders: "Engar pöntanir.",
    orderingClosed: "Lokað fyrir pantanir í dag.",
    language: "Tungumál",
  },
  pl: {
    title: "Zamówienia obiadowe",
    magic: "Link magiczny",
    signout: "Wyloguj",
    yourEmail: "ty@firma.pl",
    yourName: "Imię (jeśli nie zalogowano)",
    placeOrder: "Złóż zamówienie",
    deadline: "Termin",
    deliverTo: "Dostarczyć do",
    todaysMenu: "Dzisiejsze menu",
    notePlaceholder: "Uwaga (opcjonalnie)",
    submitOrder: "Wyślij zamówienie",
    totals: "Dzisiejsze sumy",
    exportOrders: "Eksport zamówień CSV",
    exportTotals: "Eksport sum CSV",
    shareLink: "Udostępnij link",
    adminPanel: "Panel admina",
    date: "Data",
    pasteMenu: "Wklej menu (Nazwa | opis | cena)",
    publishMenu: "Opublikuj menu",
    clearToday: "Wyczyść dzień",
    manageOrders: "Zarządzaj zamówieniami",
    noItems: "Brak pozycji.",
    noOrders: "Brak zamówień.",
    orderingClosed: "Zamówienia zamknięte.",
    language: "Język",
  },
  lt: {
    title: "Įmonės pietų užsakymai",
    magic: "Maginė nuoroda",
    signout: "Atsijungti",
    yourEmail: "tu@imone.lt",
    yourName: "Vardas (jei neprisijungęs)",
    placeOrder: "Pateikti užsakymą",
    deadline: "Terminas",
    deliverTo: "Pristatyti į",
    todaysMenu: "Šiandienos meniu",
    notePlaceholder: "Pastaba (neprivaloma)",
    submitOrder: "Pateikti",
    totals: "Šiandienos suvestinė",
    exportOrders: "Eksportuoti užsakymus CSV",
    exportTotals: "Eksportuoti suvestinę CSV",
    shareLink: "Dalintis nuoroda",
    adminPanel: "Administratoriaus skydelis",
    date: "Data",
    pasteMenu: "Įklijuokite meniu (Pavadinimas | aprašymas | kaina)",
    publishMenu: "Paskelbti meniu",
    clearToday: "Išvalyti dieną",
    manageOrders: "Tvarkyti užsakymus",
    noItems: "Dar nėra patiekalų.",
    noOrders: "Dar nėra užsakymų.",
    orderingClosed: "Užsakymas šiandien uždarytas.",
    language: "Kalba",
  },
};

export default function App() {
  // --- State ---
  // language first (ok wherever)
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const t = T[lang];

  // WEEK STATE — must come before dateKey
  const [week, setWeek] = useState(getThisWeek());
  const [activeDay, setActiveDay] = useState(0); // 0 = Monday

  // DATE KEY that depends on week/activeDay
  const [dateKey, setDateKey] = useState(week[activeDay].key);
  useEffect(() => {
    setDateKey(week[activeDay].key);
  }, [activeDay, week]);

  // the rest of your states...
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState(null);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadline, setDeadline] = useState("12:00");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rows, setRows] = useState([{ name: "", description: "", price: "" }]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);




  // Admin editor rows
  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [session]);

  async function loadData(dk) {
    const { data: menuItems } = await supabase
      .from("menu_items").select("id, day, name, description, price").eq("day", dk).order("name");
    setMenu(menuItems || []);
    const { data: orderRows } = await supabase
      .from("orders").select("id, day, user_id, employee_name, item_id, note, location, created_at").eq("day", dk).order("created_at");
    setOrders(orderRows || []);
  }
  useEffect(() => { loadData(dateKey); }, [dateKey]);

  useEffect(() => {
    const channel = supabase
      .channel(`orders-menu-${dateKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `day=eq.${dateKey}` }, () => loadData(dateKey))
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items", filter: `day=eq.${dateKey}` }, () => loadData(dateKey))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [dateKey]);

  const totalsByLocation = useMemo(() => {
    const result = new Map();
    LOCATIONS.forEach((loc) => {
      const map = new Map();
      menu.forEach((m) => map.set(m.id, 0));
      orders.filter((o) => o.location === loc).forEach((o) => map.set(o.item_id, (map.get(o.item_id) || 0) + 1));
      result.set(loc, map);
    });
    return result;
  }, [menu, orders]);

  const deadlinePassed = useMemo(() => {
    if (!deadlineEnabled) return false;
    const now = new Date();
    const [hh, mm] = deadline.split(":").map((n) => parseInt(n, 10));
    const d = new Date(now); d.setHours(hh, mm, 0, 0);
    return now.getTime() > d.getTime();
  }, [deadlineEnabled, deadline]);

  // Actions
 async function signIn() {
  if (!email) return alert("Enter your work email");
  const redirectTo = `${window.location.origin}/`; // e.g. https://lunch-app-seven.vercel.app/
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) alert(error.message);
  else alert("Check your email for the magic link");
}

  async function signOut() { await supabase.auth.signOut(); }

async function submitOrder() {
  if (!selected) return setToast({ type: "err", text: "Select a lunch item first." });
  if (deadlinePassed) return setToast({ type: "err", text: t.orderingClosed });
  if (submitting) return;
  setSubmitting(true);

  const payload = {
    day: dateKey,
    item_id: selected,
    note: note.trim() || null,
    user_id: null,
    employee_name: null,
    location,
  };
  if (session?.user) {
    payload.user_id = session.user.id;
  } else {
    if (!name.trim()) {
      setSubmitting(false);
      return setToast({ type: "err", text: t.yourName });
    }
    payload.employee_name = name.trim();
  }

  const { error } = await supabase.from("orders").insert(payload);
  setSubmitting(false);

  if (error) {
    const msg = error.code === "23505"
      ? "You already placed an order for this day."
      : error.message;
    return setToast({ type: "err", text: msg });
  }

  setNote("");
  setSelected(null);
  setToast({ type: "ok", text: `Order placed for ${week.find(w=>w.key===dateKey)?.label || dateKey}.` });
}


  async function deleteOrder(id) { const { error } = await supabase.from("orders").delete().eq("id", id); if (error) alert(error.message); }

  function addRow() { setRows((r) => [...r, { name: "", description: "", price: "" }]); }
  function updateRow(i, key, val) { setRows((r) => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row)); }
  function removeRow(i) { setRows((r) => r.filter((_, idx) => idx !== i)); }

  async function publishMenu() {
    if (!isAdmin) return alert("Admins only");
    const items = rows
      .map((r) => ({ day: dateKey, name: r.name?.trim(), description: r.description?.trim() || null, price: r.price?.trim() || null }))
      .filter((r) => r.name);
    if (items.length === 0) return alert("Add at least one item");
    const { error } = await supabase.from("menu_items").insert(items);
    if (error) alert(error.message); else setRows([{ name: "", description: "", price: "" }]);
  }

  async function clearToday() {
    if (!isAdmin) return alert("Admins only");
    if (!confirm("Clear today's menu and orders?")) return;
    await supabase.from("orders").delete().eq("day", dateKey);
    await supabase.from("menu_items").delete().eq("day", dateKey);
    await loadData(dateKey);
  }

  function exportOrdersCSV() {
    const rows = [["Date", "Location", "Employee", "Item", "Note", "Time"]];
    orders.forEach((o) => {
      const item = menu.find((m) => m.id === o.item_id);
      rows.push([dateKey, o.location || "", o.employee_name || o.user_id || "", item ? item.name : o.item_id, o.note || "", new Date(o.created_at).toLocaleTimeString()]);
    });
    downloadCSV(`lunch-orders-${dateKey}.csv`, rows);
  }
  function exportTotalsCSV() {
    const rows = [["Date", "Location", "Item", "Qty"]];
    LOCATIONS.forEach((loc) => {
      const map = totalsByLocation.get(loc) || new Map();
      menu.forEach((m) => rows.push([dateKey, loc, m.name, map.get(m.id) || 0]));
    });
    downloadCSV(`lunch-totals-${dateKey}.csv`, rows);
  }
function downloadCSV(filename, rows) {
  const process = (v) => {
    const s = String(v ?? "").replaceAll('"', '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const csv = rows.map(r => r.map(process).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  // --- UI ---
  return (
    <div className="wrap">
      <header className="row header">
        <h1>🥗 {t.title} <small>({dateKey})</small></h1>
        {/* Week tabs (ADD under the title) */}
<div className="row wrap gap" style={{ marginTop: 6 }}>
  {week.map((d, i) => (
    <button
      key={d.key}
      className={`btn ${i === activeDay ? "primary" : ""}`}
      onClick={() => setActiveDay(i)}
      title={d.key}
    >
      {d.label}
    </button>
  ))}
  {/* Optional: next/prev week buttons */}
  <button className="btn" onClick={() => {
    const first = new Date(week[0].date);
    first.setDate(first.getDate() - 7);
    const w = Array.from({length:5}).map((_,i)=>{ const d=new Date(first); d.setDate(first.getDate()+i); return { key: ymd(d), label: d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}), date:d }; });
    setWeek(w); setActiveDay(0);
  }}>⟵</button>
  <button className="btn" onClick={() => {
    const first = new Date(week[0].date);
    first.setDate(first.getDate() + 7);
    const w = Array.from({length:5}).map((_,i)=>{ const d=new Date(first); d.setDate(first.getDate()+i); return { key: ymd(d), label: d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}), date:d }; });
    setWeek(w); setActiveDay(0);
  }}>⟶</button>
</div>
       
        <div className="row gap">
          <select className="input" value={lang} onChange={(e)=>setLang(e.target.value)}>
            {LANGS.map((l)=> <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          {session ? (
            <>
              <span className="pill">{session.user.email}</span>
              <button className="btn" onClick={signOut}>{t.signout}</button>
            </>
          ) : (
            <>
              <input className="input" placeholder={t.yourEmail} value={email} onChange={(e)=>setEmail(e.target.value)} />
              <button className="btn" onClick={signIn}>{t.magic}</button>
            </>
          )}
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>{t.placeOrder}</h2>
          <div className="row wrap gap">
            {!session && (
              <input className="input" placeholder={t.yourName} value={name} onChange={(e)=>setName(e.target.value)} />
            )}
            <label className="row gap center">
              <input type="checkbox" checked={deadlineEnabled} onChange={(e)=>setDeadlineEnabled(e.target.checked)} />
              {t.deadline}
            </label>
            <input type="time" className="input" value={deadline} onChange={(e)=>setDeadline(e.target.value)} disabled={!deadlineEnabled} style={{width:120}} />
            <div className="row gap center">
              <span>{t.deliverTo}</span>
              <select className="input" value={location} onChange={(e)=>setLocation(e.target.value)} style={{width:160}}>
                {LOCATIONS.map((loc)=> <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          {deadlineEnabled && deadlinePassed && <div className="warn">{t.orderingClosed}</div>}

          <div className="menu-grid">
            <div className="label">{t.todaysMenu}</div>
            {menu.length === 0 ? (
              <div className="muted">{t.noItems}</div>
            ) : (
              <div className="cards">
                {menu.map((m)=> (
                  <button key={m.id} onClick={()=>setSelected(m.id)} disabled={deadlineEnabled && deadlinePassed} className={`tile ${selected === m.id ? "active": ""}`}>
                    <div className="tile-title">{m.name}</div>
                    {m.description && <div className="tile-sub">{m.description}</div>}
                    {m.price && <div className="tile-meta">{m.price}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input className="input" placeholder={t.notePlaceholder} value={note} onChange={(e)=>setNote(e.target.value)} />
            <div className="row">
            <button
              className="btn primary"
              onClick={submitOrder}
              disabled={submitting || (deadlineEnabled && deadlinePassed)}
            >
              {submitting ? "Submitting..." : t.submitOrder}
            </button>

          {/* Toast (ADD near the bottom of the return) */}
{toast && (
  <div className={`toast ${toast.type === "ok" ? "ok" : "err"}`}
       onAnimationEnd={() => setToast(null)}>
    {toast.text}
  </div>
)}
</div>
        </section>

        <aside className="col">
          {LOCATIONS.map((loc)=> (
            <section key={loc} className="card">
              <h3>{t.totals} — {loc}</h3>
              {menu.length === 0 ? (
                <div className="muted">{t.noItems}</div>
              ) : (
                <ul className="list">
                  {menu.map((m)=> (
                    <li key={m.id}><span>{m.name}</span><b>{(totalsByLocation.get(loc) || new Map()).get(m.id) || 0}</b></li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="card">
            <div className="row gap wrap">
              <button className="btn" onClick={exportOrdersCSV}>{t.exportOrders}</button>
              <button className="btn" onClick={exportTotalsCSV}>{t.exportTotals}</button>
            </div>
          </section>

          <section className="card center">
            <h3>{t.shareLink}</h3>
            <QRCodeCanvas value={shareUrl} size={160} includeMargin />
            <div className="muted small">{shareUrl}</div>
          </section>

          {isAdmin && (
            <section className="card">
              <h3>{t.adminPanel}</h3>
              <label>{t.date}</label>
              <input type="date" className="input" value={dateKey} onChange={(e)=>setDateKey(e.target.value)} />

              <div className="label" style={{marginTop:8}}>{t.pasteMenu}</div>
              <div className="table">
                <div className="thead">
                  <div>Name</div><div>Description</div><div>Price</div><div></div>
                </div>
                {rows.map((r, i) => (
                  <div key={i} className="trow">
                    <input className="input" value={r.name} onChange={(e)=>updateRow(i,'name',e.target.value)} placeholder="Beef" />
                    <input className="input" value={r.description} onChange={(e)=>updateRow(i,'description',e.target.value)} placeholder="sauce, rice" />
                    <input className="input" value={r.price} onChange={(e)=>updateRow(i,'price',e.target.value)} placeholder="1890 kr" />
                    <button className="btn" onClick={()=>removeRow(i)}>✕</button>
                  </div>
                ))}
                <div className="row gap" style={{marginTop:8}}>
                  <button className="btn" onClick={addRow}>+ Add row</button>
                  <button className="btn primary" onClick={publishMenu}>{t.publishMenu}</button>
                  <button className="btn danger" onClick={clearToday}>{t.clearToday}</button>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div className="label">{t.manageOrders}</div>
                {orders.length === 0 ? (
                  <div className="muted">{t.noOrders}</div>
                ) : (
                  <div className="stack">
                    {orders.map((o)=>{
                      const item = menu.find((m)=>m.id===o.item_id);
                      return (
                        <div key={o.id} className="row space card-lite">
                          <div className="row gap wrap">
                            <span className="pill">{new Date(o.created_at).toLocaleTimeString()}</span>
                            <b>{o.employee_name || (o.user_id ? o.user_id.slice(0,8) : "")}</b>
                            <span className="muted">→ {item ? item.name : o.item_id}</span>
                            {o.note && <span className="muted italic">“{o.note}”</span>}
                            <span className="pill soft">{o.location}</span>
                          </div>
                          <button className="btn" onClick={()=>deleteOrder(o.id)}>Delete</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </aside>
      </main>

      <footer className="center muted small" style={{marginTop:24}}>
        Connected to Supabase. Set <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
      </footer>
    </div>
  );
}

/* ---- minimal styles ---- */
const style = document.createElement("style");
style.innerHTML = `
  :root { --b:#e5e7eb; --m:#6b7280; --bg:#f8fafc; --pri:#2563eb; --pri-100:#eff6ff; --danger:#b91c1c; }
  body { background: var(--bg); margin:0; }
  .wrap { max-width: 1200px; margin: 0 auto; padding: 24px; font-family: system-ui, sans-serif; color:#111827; }
  .row { display:flex; align-items:center; }
  .row.space { justify-content: space-between; }
  .row.gap > * { margin-right: 8px; }
  .row.wrap { flex-wrap: wrap; gap: 8px; }
  .col { display: grid; gap: 16px; }
  .grid { display:grid; grid-template-columns: 2fr 1fr; gap:16px; }
  .header { justify-content: space-between; margin-bottom: 8px; }
  .center { text-align:center; justify-content:center; }
  .card { background:#fff; border:1px solid var(--b); border-radius:12px; padding:16px; }
  .card-lite { background:#fff; border:1px solid var(--b); border-radius:10px; padding:8px 10px; }
  .input { padding:8px 10px; border:1px solid var(--b); border-radius:8px; background:#fff; }
  .btn { padding:8px 12px; border:1px solid var(--b); background:#fff; border-radius:10px; cursor:pointer; }
  .btn:hover { box-shadow: 0 1px 0 rgba(0,0,0,.05); }
  .btn.primary { background: var(--pri-100); border-color: var(--pri); }
  .btn.primary:hover { background:#dbeafe; }
  .btn.danger { border-color: var(--danger); color: var(--danger); }
  .pill { background:#f3f4f6; padding:4px 8px; border-radius:999px; font-size:12px; }
  .pill.soft { background:#eef2ff; }
  .muted { color: var(--m); }
  .small { font-size:12px; }
  .italic { font-style: italic; }
  .label { font-weight:600; margin: 10px 0 6px; }
  .warn { color: var(--danger); margin-top:6px; }
  .menu-grid { margin: 12px 0; }
  .cards { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:10px; }
  .tile { text-align:left; border:1px solid var(--b); border-radius:12px; padding:12px; background:#fff; }
  .tile.active { outline: 2px solid var(--pri); background: var(--pri-100); }
  .tile-title { font-weight:600; }
  .tile-sub { font-size:12px; color:var(--m); margin-top:4px; }
  .tile-meta { font-size:12px; color:var(--m); margin-top:6px; }
  .list { list-style:none; margin:0; padding:0; display:grid; gap:6px; }
  .list li { display:flex; justify-content: space-between; padding:6px 8px; border:1px solid var(--b); border-radius:8px; background:#fff; }
  .table { display:block; }
  .thead { display:grid; grid-template-columns: 1fr 2fr 120px 60px; gap:8px; font-weight:600; margin-bottom:6px; }
  .trow { display:grid; grid-template-columns: 1fr 2fr 120px 60px; gap:8px; margin-bottom:6px; align-items:center; }
  /* Toast */
.toast {
  position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%);
  padding: 10px 14px; border-radius: 10px; color: #111827; background: #fff;
  border: 1px solid var(--b); box-shadow: 0 8px 30px rgba(0,0,0,.08);
  animation: fadeout 3s forwards;
}
.toast.ok { border-color: #16a34a; }
.toast.err { border-color: var(--danger); color: #b91c1c; }
@keyframes fadeout { 0%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
`;
document.head.appendChild(style);

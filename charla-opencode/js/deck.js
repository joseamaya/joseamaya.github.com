/* Deck interactivo — José Miguel Amaya · opencode */
const D = window.DECK;

/* -------- helpers -------- */
const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), D);
const num = (n) => Number(n).toLocaleString("es-PE");
function fmt(v, f) {
  if (f === "money") return Number(v).toFixed(2);
  if (f === "m") return (Number(v) / 1e6).toFixed(0) + " M";
  if (f === "raw") return v;
  return num(v);
}

/* -------- footer por slide -------- */
document.querySelectorAll("section.pad").forEach((sec) => {
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML = "<span>opencode · José Miguel Amaya</span><span>AI for Devs · Piura</span>";
  sec.querySelector(".pad").appendChild(f);
});

/* -------- valores estáticos desde data.js -------- */
const agentsLines = get("excerpts.agents_md_lines") || {};
document.querySelectorAll("[data-agents]").forEach((el) => {
  const k = el.dataset.agents;
  if (agentsLines[k] != null) el.textContent = agentsLines[k] + " líneas";
});
const taskCalls = (D.tools.find((t) => t.tool === "task") || {}).calls || 0;
const prpSkill = (D.skills.find((s) => s.skill === "prp-manager") || {}).calls || 0;
const SKILL_MIN = 3; // solo skills que uso de verdad; fuera las de 1-2 usos
const skillsUsed = D.skills.filter((s) => s.calls >= SKILL_MIN);
const byAgent = Object.fromEntries((D.by_agent || []).map((a) => [a.agent, a.sessions]));
const extra = {
  task_calls: taskCalls,
  prp_sessions: D.prp_sessions,
  total_tool_calls: D.total_tool_calls,
  total_skill_calls: D.total_skill_calls,
  skill_count: skillsUsed.length,
  model_count: D.by_model.length,
  top_cost: D.top_sessions[0].cost,
  active_days: D.active_days,
  bash_calls: (D.tools.find((t) => t.tool === "bash") || {}).calls || 0,
  "agent.build": byAgent.build ?? 0,
  "agent.explore": byAgent.explore ?? 0,
  "agent.plan": byAgent.plan ?? 0,
  "codegraph.calls": D.codegraph.calls,
  "codegraph.sessions": D.codegraph.sessions,
  "codegraph.explore": (D.codegraph.tools.find((t) => t.tool === "explore") || {}).calls || 0,
  "codegraph.first": D.codegraph.first,
  "totals.projects": D.totals.projects,
  "totals.cost": D.totals.cost,
  "totals.sessions": D.totals.sessions,
  "totals.tokens_input": D.totals.tokens_input,
  prp_skill_calls: prpSkill,
  prp_skill_pct: Math.round((prpSkill / D.total_skill_calls) * 100),
};
const resolve = (el) => {
  const path = el.dataset.count;
  if (path in extra) return extra[path];
  const v = get(path);
  if (v == null || (typeof v === "number" && !Number.isFinite(v))) return el.textContent; // nunca NaN
  return v;
};

/* -------- contadores animados -------- */
const PRINT = /print-pdf/.test(location.search);
function setFinal(el) { el.textContent = fmt(resolve(el), el.dataset.fmt); el.dataset.done = "1"; }
function animateCounts(scope) {
  scope.querySelectorAll("[data-count]").forEach((el) => {
    if (el.dataset.done) return;
    const target = resolve(el);
    const f = el.dataset.fmt;
    if (PRINT || typeof target === "string") { setFinal(el); return; }
    if (f === "raw" || !Number.isFinite(target)) { el.dataset.done = "1"; return; } // sin NaN
    const start = performance.now(), dur = 800;
    setTimeout(() => setFinal(el), dur + 250); // red de seguridad
    const step = (t) => {
      if (el.dataset.done) return;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = target * e;
      el.textContent = f === "m" ? (v / 1e6).toFixed(0) + " M" : fmt(v, f);
      if (p < 1) requestAnimationFrame(step); else setFinal(el);
    };
    requestAnimationFrame(step);
  });
}

/* -------- Chart.js -------- */
Chart.defaults.font.family = "Inter";
Chart.defaults.color = "#5B6B85";
const NAVY = "#12245B", CYAN = "#29ABE2", GREEN = "#4FA82F", AMBER = "#D9820A", RED = "#D64545";
const M2 = { "2026-04": "Abr", "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Ago", "2026-09": "Sep" };
const charts = {};
function makeCharts() {
  const el = (n) => document.querySelector(`[data-chart="${n}"]`);
  if (el("sessionsByMonth") && !charts.sessions) {
    charts.sessions = new Chart(el("sessionsByMonth"), {
      type: "line",
      data: { labels: D.per_month.map((m) => M2[m.month]), datasets: [{ label: "Sesiones", data: D.per_month.map((m) => m.sessions), borderColor: CYAN, backgroundColor: "rgba(41,171,226,.12)", fill: true, tension: .35, pointRadius: 6, pointBackgroundColor: CYAN, borderWidth: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { display: false }, tooltip: { padding: 10 } }, scales: { y: { grid: { color: "#E6ECF5" } }, x: { grid: { display: false } } } },
    });
  }
  if (el("toolsBar") && !charts.tools) {
    const t = D.tools.filter((x) => ["read", "bash", "edit", "grep", "write", "glob", "todowrite", "task"].includes(x.tool));
    charts.tools = new Chart(el("toolsBar"), {
      type: "bar",
      data: { labels: t.map((x) => x.tool), datasets: [{ data: t.map((x) => x.calls), backgroundColor: CYAN, borderRadius: 6 }] },
      options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => num(c.raw) + " llamadas" } } }, scales: { x: { display: false }, y: { grid: { display: false }, ticks: { font: { family: "JetBrains Mono", size: 12 } } } } },
    });
  }
  if (el("agentMonth") && !charts.agent) {
    charts.agent = new Chart(el("agentMonth"), {
      type: "bar",
      data: { labels: D.agent_month.map((m) => M2[m.month]), datasets: [
        { label: "plan", data: D.agent_month.map((m) => m.plan || 0), backgroundColor: AMBER },
        { label: "build", data: D.agent_month.map((m) => m.build || 0), backgroundColor: NAVY },
        { label: "explore", data: D.agent_month.map((m) => m.explore || 0), backgroundColor: CYAN },
      ] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { position: "bottom" } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: "#E6ECF5" } } } },
    });
  }
  if (el("modelsDoughnut") && !charts.models) {
    const top = D.by_model.slice(0, 5);
    charts.models = new Chart(el("modelsDoughnut"), {
      type: "doughnut",
      data: { labels: top.map((m) => m.model), datasets: [{ data: top.map((m) => m.sessions), backgroundColor: [NAVY, CYAN, GREEN, AMBER, "#8B5CF6"], borderWidth: 2, borderColor: "#fff" }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "55%", animation: { duration: 900 }, plugins: { legend: { position: "right", labels: { font: { family: "JetBrains Mono", size: 12 } } }, tooltip: { callbacks: { label: (c) => c.label + ": " + num(c.raw) + " sesiones" } } } },
    });
  }
}

/* -------- Skills explorer -------- */
const FAMILIES = [
  { name: "Especificación", color: NAVY, test: (s) => /^prp/i.test(s) },
  { name: "Backend & Python", color: CYAN, test: (s) => /beanie|pytest|python|django|fastapi/i.test(s) },
  { name: "Testing & Browser", color: AMBER, test: (s) => /testing|playwright/i.test(s) },
  { name: "Code review", color: RED, test: (s) => /review/i.test(s) },
  { name: "IA & LangChain", color: NAVY, test: (s) => /langchain|langgraph|ecosystem/i.test(s) },
  { name: "Juegos & 3D", color: CYAN, test: (s) => /phaser|threejs/i.test(s) },
  { name: "Frontend & Diseño", color: GREEN, test: (s) => /frontend-design|web-design|accessibility|vercel-react|emil-design|design-eng/i.test(s) },
  { name: "Meta & Docencia", color: GREEN, test: (s) => /find-skills|customize-opencode|alterlab|course-creation|tutorial-design|^explore$/i.test(s) },
];
extra.skill_families = FAMILIES.length;
const famOf = (name) => (FAMILIES.find((f) => f.test(name)) || FAMILIES[FAMILIES.length - 1]).name;
const famColor = (name) => (FAMILIES.find((f) => f.name === name) || {}).color || CYAN;
const setText = (sel, v) => { const e = document.querySelector(sel); if (e) e.textContent = v; };
setText("[data-count='skill_families']", FAMILIES.length);

function skillsExplorer() {
  const host = document.getElementById("skills-explorer");
  if (!host) return;
  const filters = document.getElementById("skill-filters");
  let active = "Todas";
  const chips = ["Todas", ...FAMILIES.map((f) => f.name)].map((n) => `<span class="chip${n === active ? " active" : ""}" data-fam="${n}">${n}</span>`).join("");
  filters.innerHTML = chips;
  filters.onclick = (e) => { const c = e.target.closest(".chip"); if (!c) return; active = c.dataset.fam; [...filters.children].forEach((x) => x.classList.toggle("active", x === c)); render(); };
  function render() {
    const rows = skillsUsed.filter((s) => active === "Todas" || famOf(s.skill) === active);
    host.innerHTML = `<table><thead><tr><th>Skill</th><th>Familia</th></tr></thead><tbody>` +
      rows.map((s) => `<tr><td><strong>${s.skill}</strong></td><td><span class="badge" style="background:${famColor(famOf(s.skill))}">${famOf(s.skill)}</span></td></tr>`).join("") +
      `</tbody></table>`;
  }
  render();
}

/* -------- Sesiones caras (tabla ordenable) -------- */
function sessionsTable() {
  const host = document.getElementById("sessions-table");
  if (!host) return;
  let rows = D.top_sessions.map((t, i) => ({ title: t.title, cost: t.cost, project: (D.longest_sessions[i] && D.longest_sessions[i].project) || "—" }));
  let dir = 1;
  const draw = () => {
    host.innerHTML = `<table><thead><tr><th data-k="title">Sesión</th><th data-k="project">Proyecto</th><th data-k="cost">Costo ▾</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td><strong>${r.title}</strong></td><td class="muted">${r.project}</td><td style="color:${RED};font-weight:700">$${r.cost.toFixed(2)}</td></tr>`).join("") + `</tbody></table>`;
    host.querySelectorAll("th[data-k]").forEach((th) => th.onclick = () => { const k = th.dataset.k; dir = -dir; rows.sort((a, b) => (a[k] > b[k] ? 1 : -1) * dir); draw(); });
  };
  draw();
}

/* -------- Código real con pestañas -------- */
function codeTabs() {
  const wrap = document.querySelector(".codetabs");
  if (!wrap) return;
  const src = { agents: D.excerpts.agents_md_invesphere, prp: D.excerpts.prp_001, skill: D.excerpts.skill_prp_manager, opencode: D.excerpts.harness_json };
  wrap.querySelectorAll("code[data-src]").forEach((c) => {
    const key = c.dataset.src.replace("file:", "").toLowerCase();
    const map = { "agents.md": "agents", prp: "prp", skill: "skill", opencode: "opencode" };
    c.textContent = src[map[key]] || "";
    if (window.hljs) hljs.highlightElement(c);
  });
  wrap.querySelectorAll(".tabs button").forEach((b) => b.onclick = () => {
    wrap.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("active", x === b));
    wrap.querySelectorAll("pre[data-panel]").forEach((p) => p.style.display = p.dataset.panel === b.dataset.tab ? "" : "none");
  });
  const cb = wrap.querySelector(".copybtn");
  cb && (cb.onclick = async () => {
    const vis = [...wrap.querySelectorAll("pre")].find((p) => p.style.display !== "none");
    try { await navigator.clipboard.writeText(vis.innerText); cb.textContent = "Copiado"; cb.classList.add("done"); setTimeout(() => { cb.textContent = "Copiar"; cb.classList.remove("done"); }, 1400); } catch (e) { cb.textContent = "Error"; }
  });
}

/* -------- Terminal con tipeo -------- */
function typeTerminals() {
  document.querySelectorAll("[data-type='demo']").forEach((el) => {
    if (el.dataset.typed) return; el.dataset.typed = "1";
    let lines = [];
    try { lines = JSON.parse(el.dataset.lines).map((l) => l.replace(/&gt;/g, ">")); } catch (e) { lines = []; }
    const full = lines.join("\n");
    el.textContent = full; // visible por defecto (sin JS/timers o al exportar)
    if (PRINT) return;
    let i = 0, j = 0, out = "";
    const tick = () => {
      if (el.dataset.full) return;
      if (i >= lines.length) { el.textContent = full; return; }
      if (j <= lines[i].length) { el.textContent = out + lines[i].slice(0, j); j++; setTimeout(tick, 16); }
      else { out += lines[i] + "\n"; i++; j = 0; setTimeout(tick, 110); }
    };
    setTimeout(() => { el.textContent = ""; tick(); }, 80);
    setTimeout(() => { el.dataset.full = "1"; el.textContent = full; }, 8000); // red de seguridad
  });
}

/* -------- Reveal -------- */
Reveal.initialize({
  hash: true, width: 1280, height: 720, margin: 0.02,
  transition: "slide", backgroundTransition: "fade",
  slideNumber: "c/t", controls: true, progress: true, center: false,
  plugins: [RevealNotes, RevealHighlight, RevealSearch, RevealZoom],
  highlight: { highlightOnLoad: true },
});
Reveal.on("ready", (e) => { animateCounts(e.currentSlide); makeCharts(); skillsExplorer(); sessionsTable(); codeTabs(); typeTerminals(); });
Reveal.on("slidechanged", (e) => { animateCounts(e.currentSlide); makeCharts(); typeTerminals(); });

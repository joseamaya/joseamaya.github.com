/* Deck — Arquitecturas multitenant en Python · José Miguel Amaya */
const PRINT = /print-pdf/.test(location.search);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------- footer por slide -------- */
document.querySelectorAll("section").forEach((sec) => {
  const pad = sec.querySelector(":scope > .pad");
  if (!pad) return;
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML =
    "<span>arquitecturas multitenant en python · José Miguel Amaya</span><span>Python Piura · Piura AI</span>";
  pad.appendChild(f);
});

/* -------- resaltado de líneas: <code data-hl="3,7"> -------- */
function splitHighlightedLines(code) {
  const lines = [[]];
  const append = (arr, wrappers, textNode) => {
    let node = textNode;
    for (let i = wrappers.length - 1; i >= 0; i--) {
      const clone = wrappers[i].cloneNode(false);
      clone.appendChild(node);
      node = clone;
    }
    arr.push(node);
  };
  const walk = (node, wrappers) => {
    if (node.nodeType === 3) {
      const parts = node.nodeValue.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part !== "") append(lines[lines.length - 1], wrappers, document.createTextNode(part));
      });
      return;
    }
    if (node.nodeType !== 1) return;
    const clone = document.createElement(node.tagName);
    for (const a of node.attributes) clone.setAttribute(a.name, a.value);
    const next = wrappers.concat([clone]);
    node.childNodes.forEach((ch) => walk(ch, next));
  };
  code.childNodes.forEach((ch) => walk(ch, []));
  const selected = (code.dataset.hl || "")
    .split(",")
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
  code.innerHTML = "";
  lines.forEach((nodes, idx) => {
    const line = document.createElement("span");
    line.className = "cl" + (selected.includes(idx + 1) ? " hl" : "");
    if (!nodes.length) line.appendChild(document.createTextNode("\u200B"));
    nodes.forEach((n) => line.appendChild(n));
    code.appendChild(line);
  });
}
function highlightLines(scope) {
  (scope || document).querySelectorAll("code[data-hl]").forEach((code) => {
    if (code.dataset.hlDone) return;
    code.dataset.hlDone = "1";
    splitHighlightedLines(code);
  });
}

/* -------- Chart.js -------- */
const charts = {};
const CH = { django: "#0C4B33", djangoL: "#2E7D5B", pg: "#336791", pgL: "#4A90C2", amber: "#D9820A", red: "#C94141" };
function makeCharts() {
  if (typeof Chart === "undefined") return;
  Chart.defaults.font.family = "Inter";
  Chart.defaults.color = "#5B6B85";
  const el = (n) => document.querySelector(`[data-chart="${n}"]`);
  const vis = (n) => { const c = el(n); return c && c.offsetWidth > 0 ? c : null; };
  const anim = REDUCED || PRINT ? false : { duration: 800 };
  const c1 = vis("costeAislamiento");
  if (c1 && !charts.coste) {
    charts.coste = new Chart(c1, {
      type: "bubble",
      data: { datasets: [
        { label: "Shared schema", data: [{ x: 1, y: 1, r: 22 }], backgroundColor: "rgba(217,130,10,.75)", borderColor: CH.amber, borderWidth: 2 },
        { label: "Schema-per-tenant", data: [{ x: 2, y: 2, r: 16 }], backgroundColor: "rgba(12,75,51,.8)", borderColor: CH.django, borderWidth: 2 },
        { label: "DB-por-tenant", data: [{ x: 3, y: 3, r: 11 }], backgroundColor: "rgba(201,65,65,.75)", borderColor: CH.red, borderWidth: 2 },
      ] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: { min: 0.5, max: 3.5, ticks: { callback: (v) => ({ 1: "Bajo", 2: "Medio", 3: "Alto" }[v] || "") }, grid: { color: "#E6EFE9" }, title: { display: true, text: "Aislamiento" } },
          y: { min: 0.5, max: 3.5, ticks: { callback: (v) => ({ 1: "Bajo", 2: "Medio", 3: "Alto" }[v] || "") }, grid: { color: "#E6EFE9" }, title: { display: true, text: "Coste / operación" } },
        },
      },
    });
  }
  const c2 = vis("migracion");
  if (c2 && !charts.migracion) {
    charts.migracion = new Chart(c2, {
      type: "line",
      data: {
        labels: ["10", "50", "100", "250", "500"],
        datasets: [
          { label: "En serie (uno a uno)", data: [1, 5, 10, 25, 50], borderColor: CH.amber, backgroundColor: "rgba(217,130,10,.12)", fill: true, tension: .35, borderWidth: 3, pointRadius: 5 },
          { label: "En paralelo (8 procesos)", data: [0.5, 1.5, 3, 6, 12], borderColor: CH.django, backgroundColor: "rgba(12,75,51,.12)", fill: true, tension: .35, borderWidth: 3, pointRadius: 5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw} min` } } },
        scales: {
          y: { grid: { color: "#E6EFE9" }, title: { display: true, text: "minutos" } },
          x: { grid: { display: false }, title: { display: true, text: "nº de tenants" } },
        },
      },
    });
  }
}

/* -------- Reveal -------- */
Reveal.initialize({
  hash: true,
  width: 1280,
  height: 720,
  margin: 0.02,
  transition: REDUCED ? "none" : "slide",
  backgroundTransition: REDUCED ? "none" : "fade",
  slideNumber: "c/t",
  controls: true,
  progress: true,
  center: false,
  plugins: [RevealNotes, RevealHighlight, RevealSearch, RevealZoom],
  highlight: { highlightOnLoad: true },
});
Reveal.on("ready", () => { highlightLines(document); makeCharts(); });
Reveal.on("slidechanged", (e) => { highlightLines(e.currentSlide); makeCharts(); });

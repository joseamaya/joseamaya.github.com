/* Deck — Introducción a Django REST Framework · José Miguel Amaya */
const PRINT = /print-pdf/.test(location.search);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------- footer por slide -------- */
document.querySelectorAll("section").forEach((sec) => {
  const pad = sec.querySelector(":scope > .pad");
  if (!pad) return;
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML =
    "<span>introducción a django rest framework · José Miguel Amaya</span><span>Python Piura · Piura AI</span>";
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
const CH = { drf: "#A30000", drfL: "#D64545", django: "#0C4B33", blue: "#336791", amber: "#D9820A" };
function makeCharts() {
  if (typeof Chart === "undefined") return;
  Chart.defaults.font.family = "Inter";
  Chart.defaults.color = "#6E5B5B";
  const el = (n) => document.querySelector(`[data-chart="${n}"]`);
  const vis = (n) => { const c = el(n); return c && c.offsetWidth > 0 ? c : null; };
  const anim = REDUCED || PRINT ? false : { duration: 800 };
  const c1 = vis("loc");
  if (c1 && !charts.loc) {
    charts.loc = new Chart(c1, {
      type: "bar",
      data: {
        labels: ["Función (manual)", "APIView", "Vistas genéricas", "ModelViewSet"],
        datasets: [{
          label: "Líneas de código para el CRUD de Curso",
          data: [30, 22, 10, 6],
          backgroundColor: ["rgba(163,0,0,.75)", "rgba(217,130,10,.75)", "rgba(51,103,145,.75)", "rgba(12,75,51,.8)"],
          borderColor: [CH.drf, CH.amber, CH.blue, CH.django],
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.raw} líneas aprox.` } },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "#F0E4E4" }, title: { display: true, text: "líneas de código" } },
          x: { grid: { display: false } },
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

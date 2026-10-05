/* Deck — Arquitectura de Memoria Persistente para Chatbots en Telegram · José Miguel Amaya */
const PRINT = /print-pdf/.test(location.search);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------- footer por slide -------- */
document.querySelectorAll("section").forEach((sec) => {
  const pad = sec.querySelector(":scope > .pad");
  if (!pad) return;
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML =
    "<span>memoria persistente · José Miguel Amaya</span><span>Python Piura · Piura AI</span>";
  pad.appendChild(f);
});

/* -------- terminal con tipeo -------- */
function typeTerminals() {
  document.querySelectorAll("[data-type='demo']").forEach((el) => {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";
    let lines = [];
    try {
      lines = JSON.parse(el.dataset.lines).map((l) => l.replace(/&gt;/g, ">"));
    } catch (e) {
      lines = [];
    }
    const full = lines.join("\n");
    el.textContent = full;
    if (PRINT || REDUCED) return;
    let i = 0, j = 0, out = "";
    const tick = () => {
      if (el.dataset.full) return;
      if (i >= lines.length) { el.textContent = full; return; }
      if (j <= lines[i].length) {
        el.textContent = out + lines[i].slice(0, j);
        j++;
        setTimeout(tick, 16);
      } else {
        out += lines[i] + "\n";
        i++;
        j = 0;
        setTimeout(tick, 110);
      }
    };
    setTimeout(() => { el.textContent = ""; tick(); }, 80);
    setTimeout(() => { el.dataset.full = "1"; el.textContent = full; }, 8000);
  });
}

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
Reveal.on("ready", () => { typeTerminals(); highlightLines(document); });
Reveal.on("slidechanged", (e) => { typeTerminals(); highlightLines(e.currentSlide); });

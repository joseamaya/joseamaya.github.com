/* Deck — Introducción a LangChain · José Miguel Amaya */
const PRINT = /print-pdf/.test(location.search);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------- footer por slide -------- */
document.querySelectorAll("section").forEach((sec) => {
  const pad = sec.querySelector(":scope > .pad");
  if (!pad) return;
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML =
    "<span>introducción a langchain · José Miguel Amaya</span><span>Python Piura · Piura AI</span>";
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
Reveal.on("ready", () => { highlightLines(document); });
Reveal.on("slidechanged", (e) => { highlightLines(e.currentSlide); });

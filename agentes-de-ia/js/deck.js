/* Deck interactivo — Agentes de IA · José Miguel Amaya */
const D = window.DECK;
const PRINT = /print|export/.test(location.search);

document.querySelectorAll("section.pad").forEach((sec) => {
  const f = document.createElement("div");
  f.className = "foot";
  f.innerHTML = "<span>Agentes de IA · José Miguel Amaya</span><span>Full Day de Comunidades</span>";
  sec.querySelector(".pad").appendChild(f);
});

Reveal.initialize({
  hash: true, width: 1280, height: 720, margin: 0.02,
  transition: "slide", backgroundTransition: "fade",
  slideNumber: "c/t", controls: true, progress: true, center: false,
  plugins: [RevealNotes, RevealHighlight, RevealSearch, RevealZoom],
  highlight: { highlightOnLoad: true },
});

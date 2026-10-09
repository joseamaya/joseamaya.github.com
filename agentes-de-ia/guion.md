# Guion — "Agentes de IA: qué son, cómo funcionan y cómo construirlos"

**Subtítulo:** De un LLM que responde a un agente que actúa.
**Autor:** José Miguel Amaya Camacho · Piura AI.
**Duración:** ~27 min · 28 slides · sin demos en vivo (explicación descriptiva).
**Público:** developers (mixto). Código en Python.

> Convención: voz en off + pistas de escena + tiempo acumulado `[acum m:ss]`.

---

## ACTO 0 · INTRO (3 min)

### 1 · Portada
"Buenos días. Soy Miguel Amaya. Hoy vamos a responder tres preguntas: ¿qué es un agente de IA?, ¿cómo funciona por dentro? y ¿cómo se construye? Con código: LangChain y LangGraph, y al final un mapa del resto del ecosistema."
`[acum 0:40]`

### 2 · Quién soy
"Vengo de construir agentes conversacionales en producción: LangChain, LangGraph, RAG. Llevo tres años en esto. Hoy no hablo de mis proyectos: comparto los fundamentos, para que puedan construir su primer agente."
`[acum 1:30]`

### 3 · El recorrido
"Estos son los cuatro tramos de la charla: qué es un agente, cómo funciona, cómo empezar a construir con LangChain, y un mapa del resto del ecosistema. Todo apunta a que puedas construir el tuyo."
"Antes de arrancar: ¿cuántos de ustedes ya construyeron algo con un LLM? Levanten la mano. Esa es la base de todo lo que viene."
`[acum 2:10]`

---

## ACTO 1 · ¿QUÉ ES UN AGENTE? (5 min)

### 4 · Un LLM es una función de texto
"Empecemos abajo. Un modelo de lenguaje es, para nosotros, una función: entra texto, sale texto. No recuerda, no decide, no actúa."
"Piénsalo como un genio encerrado en una habitación: sabe muchísimo, pero no tiene acceso a nada y olvida cada frase apenas la dice. Si le pides la hora, la inventa. Es un cerebro brillante sin manos y sin memoria."
`[acum 3:00]`

### 5 · De LLM a cadena
"El primer paso es encadenarlo: un prompt fijo que alimenta al modelo. Eso es una cadena: como una receta fija, los pasos están escritos de antemano."
"Sirve para tareas repetibles —resumir, clasificar, extraer— pero el camino está escrito por ti: no hay decisiones. En el fondo, una cadena es el workflow más simple."
`[acum 3:50]`

### 6 · De cadena a agente
"Aquí está el salto: en un agente, el modelo decide el **siguiente paso**. Puede responder, o puede pedir una herramienta. Y vuelve a pensar con ese resultado. La diferencia entre una cadena y un agente es quién decide el camino: tú o el modelo."
"Regla práctica: si el camino es predecible, quédate en workflow; si el modelo debe decidir, sube a agente. Y empieza por lo más simple."
`[acum 4:50]`

### 7 · El bucle del agente (ReAct)
"Este es el corazón de la charla. El patrón clásico se llama **ReAct**, de razonar y actuar: el modelo alterna los dos hasta resolver la tarea."
"Piénsalo como un becario con acceso a herramientas: le pides algo, decide si usar la calculadora, buscar en un archivo o preguntar, y con cada resultado vuelve a pensar. Contexto → razona → ¿pide una herramienta? → tu código la ejecuta → el resultado vuelve → repite → cuando ya no pide nada, responde. Es un ciclo, no una línea."
"Aclaración: ReAct es el patrón conceptual. Los modelos modernos no escriben el 'pensamiento' en texto: devuelven la llamada ya estructurada (tool calling nativo). El ciclo es exactamente el mismo."
"Pregunta al público: ¿han visto a un modelo inventar un dato con total seguridad? De eso nos protegen las herramientas."
`[acum 5:50]`

### 8 · La anatomía mínima
"Todo agente tiene cuatro piezas: un **cerebro** (el modelo), unas **manos** (las herramientas), una **memoria** (el estado) y unos **sentidos** (el contexto que le entra en cada turno)."
"A todo eso lo llamamos el arnés, el *harness*: agente es igual a modelo más arnés. El arnés es todo lo que rodea al bucle —el prompt, las herramientas y el middleware— y su trabajo es darle al modelo el contexto correcto en el momento correcto. Cambia el proveedor, cambia la base de datos, pero estas piezas se repiten."
`[acum 6:50]`

---

## ACTO 2 · CÓMO FUNCIONA POR DENTRO (6 min)

### 9 · Tool calling: el contrato
"La herramienta se le presenta al modelo como un contrato: nombre, parámetros y para qué sirve. El modelo no toca tus sistemas: propone una llamada, algo como 'llama a execute_sql con query=...'. La ejecución vive en tu código, bajo tus reglas. Esa separación es lo que hace al agente seguro."
"El modelo no 've' tus funciones: recibe su descripción en cada llamada, junto a los mensajes, y responde con una petición estructurada (tool_calls). Por eso una descripción clara es todo."
"Pregunta: ¿a quién le ha pasado pedirle a un chatbot algo que no podía hacer?"
`[acum 8:00]`

### 10 · Los mensajes: la conversación como estado
"Por dentro, todo es una lista de mensajes. `system` (las reglas), `user` (lo que pide la persona), `assistant` (lo que dice el modelo, incluidas sus peticiones de herramientas) y `tool` (lo que devolvió la herramienta)."
"Es como un chat: cada burbuja es un mensaje, y el turno del agente es esa lista creciendo. Los mensajes solo se añaden, nunca se reemplazan: es *append-only*."
"Y como solo se añade, la lista crece en cada turno: por eso el contexto se llena, se paga, y hay que compactarlo (lo vemos enseguida)."
`[acum 8:50]`

### 11 · Un turno, narrado
"Veámoslo con un ejemplo: '¿Cuánto vendimos en marzo?'. En cuatro pasos: el modelo no sabe el dato; pide la herramienta; tu código consulta la base de datos; y solo entonces responde."
"Por debajo, el turno es una lista de mensajes que crece: system (las reglas), user (la pregunta), assistant (pide execute_sql), tool (el resultado: 42150) y assistant (la respuesta: 42.150)."
"Y no es solo para una tool: si la tarea lo pide, el agente encadena varias en el mismo turno. Como pedir '¿cuánto es 312.5 × 4.2 y cuántas palabras tiene este texto?': primero llama a una calculadora y recibe 1312.5; luego a un contador y recibe 5; y solo entonces, con ambos resultados, redacta. Dos herramientas, un solo turno, sin que el modelo ejecute nada."
"El modelo solo pidió la consulta; la ejecutó tu código, con tus permisos."
`[acum 9:50]`

### 12 · Estado y control de flujo
"Si el agente puede repetir, ¿cómo termina? Cuando el modelo ya no pide herramientas. Y hay que ponerle límites: número máximo de iteraciones, tiempo, costo. Un bucle sin freno es un error de diseño, no un bug."
`[acum 10:40]`

### 13 · Cómo recuerda un agente
"Un agente no trae memoria: hay que dársela. Y el contexto es el recurso escaso."
"Funciona como tu memoria: recuerdas la conversación de hoy (corto plazo); y también sabes cosas de una persona de siempre (largo plazo). Son dos memorias distintas."
"Y cuando el historial se hace largo, se resume: eso se llama compactación, *compaction*. Resumes lo viejo para liberar la ventana sin perder el hilo."
`[acum 11:40]`

### 14 · Contexto, estado y memoria
"Estas cuatro palabras se confunden todo el tiempo, así que fijémoslas."
"El **contexto** —o la ventana— es lo que el modelo ve en un turno: el system, el historial y las reglas. Es finito y se paga. El **estado** son los mensajes acumulados de la conversación: lo que llevamos en el hilo. La **memoria** es lo que sobrevive entre turnos: corto plazo (el hilo) y largo plazo (entre hilos). Y el **hilo** es una conversación con identidad propia, separada de las demás."
"En una frase: el contexto es lo que el modelo ve ahora; el estado, lo que llevamos; la memoria, lo que guardamos."
`[acum 12:30]`

### 15 · Human in the loop
"Y la pieza que muchos olvidan: el humano. Un agente serio puede pausar antes de una acción sensible —enviar un correo, ejecutar un pago— y esperar aprobación. Con esto cierro la teoría: ya sabes cómo funciona. Ahora, cómo se construye."
`[acum 13:10]`

---

## ACTO 3 · CÓMO CONSTRUIRLOS: LANGCHAIN + LANGGRAPH (8 min)

### 16 · El stack 2026
"Herramientas concretas. **LangChain** te da un agente listo en una función. **LangGraph** te da el control del flujo cuando lo necesitas. Y **LangSmith** observa. Dato 2026: `create_react_agent` se deprecó; el estándar ahora es `create_agent`."
"Pregunta: ¿quién ha usado LangChain o LangGraph antes?"
`[acum 14:10]`

### 17 · El agente mínimo
"Un agente completo son cuatro líneas: `create_agent(model, tools, system_prompt)`. Y nada más. La herramienta la escribes con `@tool`; LangChain se encarga del bucle."
"Y el `system_prompt` son las reglas: rol y objetivo; reglas y límites; formato y tono; y qué hacer cuando no sabe —no inventar, usar una herramienta o decirlo—."
"Por dentro, `create_agent` arma un grafo: manda el mensaje al modelo; si pide una herramienta, la ejecuta y le devuelve el resultado; y repite hasta que el modelo responde sin pedir nada."
`[acum 15:40]`

### 18 · Tools
"La herramienta: un decorador, tipos en los parámetros y un docstring claro. Eso es todo lo que necesita el modelo para usarla bien. Argumentos tipados = contrato; docstring = prompt."
"Y lo que decide cuándo se usa una tool no es su código: es su descripción. Por eso: pocas herramientas bien documentadas, nombres claros y errores útiles. La descripción de las tools es el prompt que más importa."
`[acum 16:30]`

### 19 · Modelo, middleware y salida
"Tres ideas. Una: el modelo es una pieza sustituible. `openai:gpt-5` es solo una cadena de texto; `init_chat_model` te deja cambiar de proveedor con una línea, y las *content blocks* dan un formato común a las salidas."
"Dos: el *middleware*. Hooks que se enganchan antes y después del modelo, y antes y después de cada tool: gestión de contexto, guardrails (PII), aprobación humana, resiliencia y subagentes. Corre dentro del mismo grafo."
"Tres: la salida. Estructurada con Pydantic (`response_format` → `structured_response`) para integrarla con tu sistema, y streaming para ver la respuesta en vivo. Analogía: la salida estructurada es como pedir un formulario relleno en vez de una carta libre."
`[acum 17:50]`

### 20 · Seguridad
"Como el modelo propone y tu código ejecuta, la seguridad vive en tu código. Cuatro ideas."
"Uno: **mínimo privilegio** — las herramientas corren con tus permisos y límites, nunca con los del modelo. Dos: **valida los argumentos** antes de ejecutar. Tres: **prompt injection** — el contenido externo, un documento o una web, son datos, no órdenes; no dejes que secuestren al agente. Y cuatro: **guardrails** para datos sensibles (PII) y aprobación humana en acciones críticas."
"En una frase: el modelo decide; la ejecución y el permiso viven en tu código."
"Analogía: mínimo privilegio es darle a un becario la llave de un cajón, no la del edificio."
`[acum 18:50]`

### 21 · LangGraph: control cuando lo necesitas
"`create_agent` cubre el 80%. ¿Cuándo bajas a LangGraph? Cuando necesitas control explícito: ramas condicionales, varios agentes, ciclos con reglas propias o interrupciones en puntos exactos. LangChain para arrancar; LangGraph para orquestar."
"LangGraph es un **grafo con estado**: un estado tipado, nodos (pasos) y aristas que deciden a dónde ir. Añade **memoria** (checkpointer por hilo, store entre hilos) y el **humano en el bucle** (pausa, aprueba y reanuda)."
"El detalle de cada pieza —grafo, persistencia, interrupt— merece su propio espacio; aquí quédate con la idea: es la caja de herramientas para cuando el bucle estándar no alcanza."
`[acum 20:10]`

### 22 · La recuperación (RAG)
"Falta la recuperación, el **RAG**: son las siglas de Retrieval-Augmented Generation, recuperar información y añadirla al contexto del modelo."
"Es como cuando contestas un examen con apuntes: buscas el dato que necesitas y lo usas para responder, en vez de fiarte de la memoria. Quédate con la idea: responde con tus datos, no con imaginación."
"Por dentro: tus documentos se parten en fragmentos; cada uno se convierte en un vector (*embedding*) y se guarda en un índice. Ante una pregunta, se buscan los fragmentos más parecidos y se añaden al contexto. El agente decide cuándo buscar; la profundidad de RAG merece su propio espacio."
`[acum 21:00]`

### 23 · El agente completo, de una pieza
"Recapitulemos con el plano: un agente completo es un modelo, con instrucciones, herramientas, middleware y memoria. Todo eso junto —el modelo y su arnés— es el agente."
"Lo demás —la recuperación, los canales, la observabilidad— no es el agente: se conecta alrededor."
`[acum 22:00]`

---

## ACTO 4 · ALREDEDOR Y ECOSISTEMA (3 min)

### 24 · El agente no vive solo
"Un agente no vive solo. Lo que construiste es el núcleo. A su alrededor hay cuatro piezas que hoy solo nombro para que las reconozcas."
"**Canales:** por dónde entra y sale el mensaje (WhatsApp, Telegram, web); cada canal solo traduce. **Núcleo:** la pieza que recibe, junta mensajes seguidos y arma el contexto antes de pensar. **Observabilidad:** ver cada turno por dentro —qué nodo corrió, qué herramienta se llamó, cuántos tokens—. **Evaluación:** medir si el agente acierta —¿eligió bien la herramienta?, ¿la respuesta salió de los datos?—."
"Cada una merece su propio espacio. Quédate con los nombres."
`[acum 23:20]`

### 25 · Protocolos: MCP y A2A
"Antes de cerrar, una distinción que confunde mucho: **MCP** y **A2A** no son frameworks. Un framework construye y orquesta tu agente; un protocolo es un contrato para conectarlo con el exterior. No compiten: se combinan."
"**MCP**, Model Context Protocol: cómo un agente se conecta a **herramientas y datos**. El enchufe universal: describes la tool una vez y cualquier agente la usa. **A2A**, Agent-to-Agent: cómo un agente **habla con otro** agente; un idioma y una tarjeta de presentación comunes."
"En una frase: el framework es cómo construyes tu agente; el protocolo, cómo se conecta con lo demás."
`[acum 24:20]`

### 26 · Otros frameworks
"Ya vimos LangChain y LangGraph, pero no son los únicos. El ecosistema se elige por filosofía, no por moda. ¿Equipos con roles? CrewAI. ¿Datos y RAG? LlamaIndex. ¿Tipado y validación? Pydantic AI. ¿Conversación o multi-agente? AutoGen y el Microsoft Agent Framework. ¿En tu nube? ADK, Strands u OpenAI SDK. ¿Código mínimo o TypeScript? smolagents, Mastra o Vercel."
"Y a veces la respuesta correcta no es ningún framework: el SDK del proveedor y código propio."
`[acum 25:20]`

---

## ACTO 5 · CIERRE (2 min)

### 27 · Cinco ideas
"Para llevar: un agente es modelo + herramientas + bucle con estado. El modelo propone; tu código ejecuta, bajo tus reglas. Una buena descripción decide cuándo se usa una tool. Empieza con `create_agent` y baja a LangGraph cuando necesites control. Y el contexto es el recurso escaso."
`[acum 26:20]`

### 28 · Cierre
"Gracias. Ya tienes el mapa para construir tu primer agente."
`[acum 27:10]`

---

### Presupuesto de tiempos
| Bloque | Slides | Min |
|---|---|---|
| Intro | 1–3 | 2.5 |
| ¿Qué es un agente? | 4–8 | 4.5 |
| Cómo funciona | 9–15 | 6.5 |
| LangChain + LangGraph | 16–23 | 8 |
| Alrededor y ecosistema | 24–26 | 3 |
| Cierre | 27–28 | 2 |
| **Total** | **28** | **~27** |

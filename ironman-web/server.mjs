// Servidor de Ironman-web: sin dependencias, solo Node 18+.
// Dos cerebros: Jarvis local (Ollama, sin internet) y KAN nube (Gemini).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(DIR, "public");
const MEMORIA = path.join(DIR, "memoria_jarvis.json");

// --- .env mínimo (sin dotenv) ---
try {
  for (const linea of fs.readFileSync(path.join(DIR, ".env"), "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !linea.trim().startsWith("#") && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {}

const PORT = Number(process.env.PORT) || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const PERSONALIDAD = `Eres JARVIS, un asistente personal de inteligencia artificial inspirado en el asistente de Iron Man.
Tu misión es ayudar a diseñar, programar y construir un traje tecnológico realista, empezando por prototipos seguros y asequibles.
- Habla siempre en español latino natural.
- Sé inteligente, educado, directo y ligeramente ingenioso.
- Explica la ingeniería paso a paso y adapta las explicaciones al usuario.
- Distingue las ideas de ciencia ficción de las tecnologías que existen.
- Nunca afirmes haber realizado acciones físicas que no puedes ejecutar.
- Prioriza la seguridad al trabajar con baterías, motores y mecanismos.`;

// --- memoria (mismo formato que el prototipo: [{dato, fecha}]) ---
const cargarMemoria = () => {
  try {
    const d = JSON.parse(fs.readFileSync(MEMORIA, "utf8"));
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
};
const guardarMemoria = (m) => {
  fs.writeFileSync(MEMORIA + ".tmp", JSON.stringify(m, null, 2), "utf8");
  fs.renameSync(MEMORIA + ".tmp", MEMORIA);
};
const sistema = () => {
  const datos = cargarMemoria().slice(-20).map((e) => `- ${e.dato}`).join("\n");
  return `${PERSONALIDAD}\n\nDATOS GUARDADOS EN TU MEMORIA:\n${datos || "Todavía no hay datos guardados."}`;
};

// Comandos que no necesitan IA. Devuelve texto o null.
function comando(texto) {
  const t = texto.trim();
  const l = t.toLowerCase();
  if (l === "memoria") {
    const m = cargarMemoria();
    return m.length ? "Estos son los datos guardados:\n" + m.map((e, i) => `${i + 1}. ${e.dato}`).join("\n") : "Mi memoria está vacía por ahora.";
  }
  if (l.startsWith("recuerda ")) {
    const dato = t.slice(9).trim();
    if (!dato) return "Dime qué dato debo recordar.";
    const m = cargarMemoria();
    m.push({ dato, fecha: new Date().toISOString().slice(0, 19) });
    guardarMemoria(m);
    return "Entendido. He guardado ese dato en mi memoria local.";
  }
  const olvida = l.match(/^olvida (\d+)$/);
  if (olvida) {
    const m = cargarMemoria();
    const i = Number(olvida[1]) - 1;
    if (i < 0 || i >= m.length) return "Ese número de recuerdo no existe.";
    const [q] = m.splice(i, 1);
    guardarMemoria(m);
    return `Listo, olvidé: ${q.dato}`;
  }
  return null;
}

// --- cerebros: cada uno es un generador async de trozos de texto ---
async function* ollama(historial) {
  const r = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, stream: true, messages: [{ role: "system", content: sistema() }, ...historial] }),
  });
  if (!r.ok) throw new Error(`Ollama respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  let buf = "";
  const dec = new TextDecoder();
  for await (const parte of r.body) {
    buf += dec.decode(parte, { stream: true });
    const lineas = buf.split("\n");
    buf = lineas.pop();
    for (const l of lineas) if (l.trim()) { const j = JSON.parse(l); if (j.message?.content) yield j.message.content; }
  }
}

async function* gemini(historial) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema() }] },
      contents: historial.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    }),
  });
  if (!r.ok) throw new Error(`Gemini respondió ${r.status}: ${(await r.text()).slice(0, 300)}`);
  let buf = "";
  const dec = new TextDecoder();
  for await (const parte of r.body) {
    buf += dec.decode(parte, { stream: true });
    const lineas = buf.split("\n");
    buf = lineas.pop();
    for (const l of lineas) {
      if (!l.startsWith("data:")) continue;
      const j = JSON.parse(l.slice(5));
      const t = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
      if (t) yield t;
    }
  }
}

async function estado() {
  let ollamaOk = false, modelos = [];
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (r.ok) { ollamaOk = true; modelos = (await r.json()).models?.map((m) => m.name) ?? []; }
  } catch {}
  return {
    local: { disponible: ollamaOk, modelo: OLLAMA_MODEL, instalado: modelos.includes(OLLAMA_MODEL) || modelos.includes(OLLAMA_MODEL + ":latest") },
    nube: { disponible: Boolean(GEMINI_KEY), modelo: GEMINI_MODEL },
    recuerdos: cargarMemoria().length,
  };
}

const leerJson = (req) => new Promise((ok, no) => {
  let s = "";
  req.on("data", (c) => { s += c; if (s.length > 2e6) req.destroy(); });
  req.on("end", () => { try { ok(JSON.parse(s || "{}")); } catch (e) { no(e); } });
});
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" }); res.end(JSON.stringify(obj)); };

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "GET" && url.pathname === "/api/estado") return json(res, 200, await estado());
    if (req.method === "GET" && url.pathname === "/api/memoria") return json(res, 200, cargarMemoria());

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const { mensajes } = await leerJson(req);
      if (!Array.isArray(mensajes) || !mensajes.length) return json(res, 400, { error: "Falta 'mensajes'." });
      const ultimo = mensajes[mensajes.length - 1].content ?? "";
      const cabeza = (motor) => res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no", "X-Motor": motor });
      const directo = comando(ultimo);
      if (directo !== null) { cabeza("memoria"); return res.end(directo); }

      // Un solo cerebro, dos motores: primero el local (sin internet); si falla
      // antes de dar texto, cae al de la nube. Si falla a medias, no se cambia.
      const motores = [["local", ollama], ...(GEMINI_KEY ? [["nube", gemini]] : [])];
      const errores = [];
      for (const [nombre, motor] of motores) {
        let empezo = false;
        try {
          for await (const t of motor(mensajes.slice(-20))) {
            if (!empezo) { cabeza(nombre); empezo = true; }
            res.write(t);
          }
          if (empezo) return res.end();
          errores.push(`${nombre}: respuesta vacía`);
        } catch (e) {
          if (empezo) return res.end("\n⚠ " + e.message);
          errores.push(`${nombre}: ${/fetch failed|ECONNREFUSED/.test(String(e) + String(e.cause ?? "")) ? "no disponible" : e.message}`);
        }
      }
      cabeza("ninguno");
      let ayuda = `⚠ Ningún motor pudo responder (${errores.join("; ")}).\n`;
      ayuda += "• Local: instala Ollama (https://ollama.com) y ejecuta `ollama pull " + OLLAMA_MODEL + "`.\n";
      if (!GEMINI_KEY) ayuda += "• Nube: copia .env.example a .env y pega tu GEMINI_API_KEY (gratis en https://aistudio.google.com/apikey).";
      return res.end(ayuda);
    }

    if (req.method === "GET") {
      const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const archivo = path.join(PUBLIC, rel);
      if (archivo.startsWith(PUBLIC) && fs.existsSync(archivo) && fs.statSync(archivo).isFile()) {
        res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] ?? "application/octet-stream" });
        return fs.createReadStream(archivo).pipe(res);
      }
    }
    json(res, 404, { error: "No encontrado" });
  } catch (e) {
    if (!res.headersSent) json(res, 500, { error: e.message }); else res.end();
  }
}).listen(PORT, "127.0.0.1", async () => {
  const e = await estado();
  console.log(`\n  IRONMAN-WEB listo →  http://localhost:${PORT}\n`);
  console.log(`  Local (Ollama): ${e.local.disponible ? (e.local.instalado ? "OK" : `Ollama activo pero falta: ollama pull ${e.local.modelo}`) : "Ollama no detectado"}`);
  console.log(`  Nube (Gemini):  ${e.nube.disponible ? "OK" : "sin GEMINI_API_KEY (ver .env.example)"}\n`);
});

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HardDrive, Upload } from "lucide-react";
import { PROJECT_LIST_FILES, PROJECT_READ_FILE, PROJECT_WRITE_FILE } from "@kan/plugin-sdk-ts";
import type { ProjectFileEntry } from "@kan/plugin-contract";
import { PendingConfirmationModal } from "@/components/dashboard/PendingConfirmationModal";
import type { PendingConfirmation } from "@/lib/chat/useConversation";
import type { DeviceCapabilitiesView } from "@/lib/secuencias/types";

// `next/dynamic({ ssr: false })`: el motor de Prism + los ~11 lenguajes
// registrados en `CodeBlock.tsx` solo se cargan si el usuario realmente
// abre una ventana de código.
const CodeBlock = dynamic(() => import("@/components/kan/CodeBlock").then((m) => m.CodeBlock), {
  ssr: false,
  loading: () => <p className="text-xs text-ink-faint">Cargando código…</p>,
});

// Mismo vocabulario de lenguajes que `CodeBlock.tsx` registra — no se
// importa desde ahí para no arrastrar el motor de Prism a este módulo
// (que sí entra al bundle inicial: el `<select>` de acá tiene que
// mostrarse antes de que el composer dispare la carga dinámica).
const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
];

type UploadStatus = "idle" | "uploading" | "done" | "error";

function findCapabilityRef(device: DeviceCapabilitiesView, name: string): string | undefined {
  return device.capabilities.find((c) => c.name === name)?.ref;
}

async function executeCapability(ref: string, input: Record<string, unknown>): Promise<{
  requiresConfirmation?: boolean;
  data?: { confirmationId?: string; deviceId?: string; capabilityName?: string; input?: unknown; severity?: PendingConfirmation["severity"]; steps?: Array<{ outcome: string; data?: unknown; error?: string }> };
  error?: string;
}> {
  const response = await fetch("/api/tools/kan_run_sequence/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args: { steps: [{ capabilityRef: ref, input }] } }),
  });
  return response.json();
}

/**
 * Sección "Editar código de un dispositivo" del composer manual de la
 * ventana de código — solo se monta si `CodeWindowContent` encontró algún
 * device con `project_list_files` (cualquier `ProjectDriverPort`, hoy solo
 * `MicroPythonPlugin`/Pico). Reusa el mismo patrón end-to-end que
 * `ControlClient.tsx` para ejecutar UNA capability puntual desde la UI sin
 * pasar por el chat: `POST /api/tools/kan_run_sequence/execute` con un solo
 * paso, y si la respuesta trae `requiresConfirmation`, el
 * `PendingConfirmationModal` REAL (nunca un chequeo del lado del cliente —
 * `project_write_file` es `irreversible-material`, el backend siempre exige
 * confirmarla).
 */
function ProjectDeviceSection({
  devices,
  draft,
  onFileLoaded,
}: {
  devices: DeviceCapabilitiesView[];
  draft: string;
  onFileLoaded: (content: string) => void;
}) {
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.deviceId);
  const [files, setFiles] = useState<ProjectFileEntry[] | null>(null);
  const [listing, setListing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const [resolving, setResolving] = useState(false);

  const activeDevice = devices.find((d) => d.deviceId === selectedDeviceId) ?? devices[0];
  const listRef = activeDevice && findCapabilityRef(activeDevice, PROJECT_LIST_FILES);
  const readRef = activeDevice && findCapabilityRef(activeDevice, PROJECT_READ_FILE);
  const writeRef = activeDevice && findCapabilityRef(activeDevice, PROJECT_WRITE_FILE);

  function handleDeviceChange(deviceId: string) {
    setSelectedDeviceId(deviceId);
    setFiles(null);
    setSelectedPath(null);
    setUploadStatus("idle");
  }

  async function handleListFiles() {
    if (!listRef) return;
    setListing(true);
    setListError(null);
    try {
      const data = await executeCapability(listRef, {});
      const step = data?.data?.steps?.[0];
      if (step?.outcome === "done") {
        const allFiles = ((step.data as { files?: ProjectFileEntry[] } | undefined)?.files ?? []).filter((f) =>
          f.path.endsWith(".py"),
        );
        setFiles(allFiles);
      } else {
        setListError(step?.error ?? data?.error ?? "No se pudieron listar los archivos.");
      }
    } catch {
      setListError("KAN no está disponible en este momento.");
    } finally {
      setListing(false);
    }
  }

  async function handleSelectFile(path: string) {
    if (!readRef) return;
    setSelectedPath(path);
    setReading(true);
    setReadError(null);
    setUploadStatus("idle");
    try {
      const data = await executeCapability(readRef, { path });
      const step = data?.data?.steps?.[0];
      if (step?.outcome === "done") {
        const result = step.data as { content: string };
        onFileLoaded(result.content);
      } else {
        setReadError(step?.error ?? data?.error ?? "No se pudo leer el archivo.");
      }
    } catch {
      setReadError("KAN no está disponible en este momento.");
    } finally {
      setReading(false);
    }
  }

  async function handleUpload() {
    if (!writeRef || !selectedPath) return;
    setUploadStatus("uploading");
    setUploadError(null);
    try {
      const data = await executeCapability(writeRef, { path: selectedPath, content: draft });

      if (data?.requiresConfirmation) {
        const c = data.data ?? {};
        setPending({
          type: "pending_confirmation",
          confirmationId: c.confirmationId!,
          deviceId: c.deviceId!,
          capabilityName: c.capabilityName!,
          input: c.input,
          severity: c.severity!,
        });
        setUploadStatus("idle");
        return;
      }

      const step = data?.data?.steps?.[0];
      if (step?.outcome === "done") {
        setUploadStatus("done");
      } else {
        setUploadStatus("error");
        setUploadError(step?.error ?? data?.error ?? "No se pudo subir el archivo.");
      }
    } catch {
      setUploadStatus("error");
      setUploadError("KAN no está disponible en este momento.");
    }
  }

  async function resolvePending(approved: boolean) {
    if (!pending) return;
    setResolving(true);
    try {
      const response = await fetch(`/api/confirmations/${encodeURIComponent(pending.confirmationId)}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const data = await response.json();
      if (approved) {
        if (data?.success) {
          setUploadStatus("done");
        } else {
          setUploadStatus("error");
          setUploadError(data?.error ?? "No se pudo subir el archivo.");
        }
      } else {
        setUploadStatus("idle");
      }
    } catch {
      if (approved) {
        setUploadStatus("error");
        setUploadError("KAN no está disponible en este momento.");
      }
    } finally {
      setResolving(false);
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line/60 bg-black/30 p-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
        Editar código de un dispositivo
      </div>

      {devices.length > 1 && (
        <select
          value={selectedDeviceId}
          onChange={(event) => handleDeviceChange(event.target.value)}
          className="self-start rounded-md bg-surface-3 px-2 py-1 text-xs text-ink outline-none"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.deviceName}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={() => void handleListFiles()}
        disabled={listing || !listRef}
        className="self-start rounded-full border border-line/60 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-3 disabled:opacity-40"
      >
        {listing ? "Listando…" : "Listar archivos .py"}
      </button>
      {listError && <p className="text-xs text-danger">{listError}</p>}

      {files && files.length === 0 && <p className="text-xs text-ink-faint">Sin archivos .py en este dispositivo.</p>}
      {files && files.length > 0 && (
        <ul className="hud-scroll flex max-h-28 flex-col gap-1 overflow-y-auto">
          {files.map((file) => (
            <li key={file.path}>
              <button
                type="button"
                onClick={() => void handleSelectFile(file.path)}
                disabled={reading}
                className={`w-full truncate rounded px-2 py-1 text-left font-mono text-xs transition-colors disabled:opacity-40 ${
                  selectedPath === file.path ? "bg-accent/20 text-accent" : "text-ink-muted hover:bg-surface-3"
                }`}
              >
                {file.path}
              </button>
            </li>
          ))}
        </ul>
      )}
      {reading && <p className="text-xs text-ink-faint">Leyendo archivo…</p>}
      {readError && <p className="text-xs text-danger">{readError}</p>}

      {selectedPath && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={uploadStatus === "uploading" || !writeRef}
            className="press flex items-center gap-1.5 self-start rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
          >
            <Upload className="h-3 w-3" aria-hidden="true" />
            Subir a la Pico
          </button>
          {uploadStatus === "uploading" && <span className="text-xs text-ink-faint">Subiendo…</span>}
          {uploadStatus === "done" && <span className="text-xs text-success">Listo</span>}
          {uploadStatus === "error" && <span className="text-xs text-danger">Error{uploadError ? `: ${uploadError}` : ""}</span>}
        </div>
      )}

      {pending && (
        <PendingConfirmationModal
          confirmation={pending}
          busy={resolving}
          onCancel={() => void resolvePending(false)}
          onConfirm={() => void resolvePending(true)}
        />
      )}
    </div>
  );
}

/**
 * Contenido de la ventana `kind: "code"` — con `content` (`kan_open_panel`,
 * `type: "code"`) renderiza de solo lectura. Sin `content` (abierta a mano
 * desde `NewWindowButton`), es un composer editable: selector de lenguaje +
 * textarea, con preview de syntax highlighting en vivo apenas hay algo
 * escrito, más — si hay algún dispositivo con capabilities de proyecto
 * (`project_list_files`, ver `ProjectDeviceSection`) — un browser de
 * archivos para cargar/editar/subir código real de la placa.
 */
export function CodeWindowContent({ content, language }: { content: string; language?: string }) {
  const [draft, setDraft] = useState("");
  const [lang, setLang] = useState(language ?? "javascript");
  const [projectDevices, setProjectDevices] = useState<DeviceCapabilitiesView[]>([]);

  useEffect(() => {
    // Solo tiene sentido en el composer manual — una ventana ya abierta con
    // contenido de KAN es de solo lectura, no hace falta este fetch.
    if (content) return;
    let cancelled = false;
    fetch("/api/capabilities")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const devices = (data.devices ?? []) as DeviceCapabilitiesView[];
        setProjectDevices(devices.filter((d) => d.capabilities.some((c) => c.name === PROJECT_LIST_FILES)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [content]);

  function handleFileLoaded(fileContent: string) {
    setDraft(fileContent);
    setLang("python");
  }

  if (!content) {
    return (
      <div className="flex h-full flex-col gap-2">
        {projectDevices.length > 0 && (
          <ProjectDeviceSection devices={projectDevices} draft={draft} onFileLoaded={handleFileLoaded} />
        )}
        <select
          value={lang}
          onChange={(event) => setLang(event.target.value)}
          className="self-start rounded-md bg-surface-3 px-2 py-1 text-xs text-ink outline-none"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Pegá o escribí tu código acá…"
          spellCheck={false}
          className="min-h-[5rem] flex-1 resize-none rounded-lg bg-black/40 p-2 font-mono text-xs text-ink outline-none"
        />
        {draft && (
          <div className="hud-scroll max-h-[55%] overflow-auto rounded-lg bg-black/40">
            <CodeBlock code={draft} lang={lang} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-black/40">
      <CodeBlock code={content} lang={language} />
    </div>
  );
}

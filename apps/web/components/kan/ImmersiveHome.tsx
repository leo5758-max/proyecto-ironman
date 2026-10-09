"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PendingConfirmationModal } from "@/components/dashboard/PendingConfirmationModal";
import { JARVISDisplay } from "@/components/kan/JARVISDisplay";
import { ImmersiveOrb } from "@/components/kan/ImmersiveOrb";
import { HistorySheet } from "@/components/kan/HistorySheet";
import { HamburgerMenu } from "@/components/kan/HamburgerMenu";
import { SoundToggle } from "@/components/kan/SoundToggle";
import { FullscreenToggle } from "@/components/kan/FullscreenToggle";
import { StatusBar } from "@/components/kan/StatusBar";
import { NewWindowButton } from "@/components/kan/NewWindowButton";
import { FloatingWindowLayer } from "@/components/kan/FloatingWindowLayer";
import { SectionOverlay } from "@/components/kan/SectionOverlay";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";
import { SensoresClient } from "@/components/sensores/SensoresClient";
import { SecuenciasClient } from "@/components/secuencias/SecuenciasClient";
import { RespaldosClient } from "@/components/respaldos/RespaldosClient";
import { AlertsPanel } from "@/components/kan/hud/panels/AlertsPanel";
import { DispositivosPanel } from "@/components/dispositivos/DispositivosPanel";
import { LogsPanel } from "@/components/logs/LogsPanel";
import { ConfiguracionPanel } from "@/components/configuracion/ConfiguracionPanel";
import { OverviewPanel } from "@/components/kan/OverviewPanel";
import { useConversation } from "@/lib/chat/useConversation";
import { useKANState } from "@/lib/kan/useKANState";
import { useWakeWord } from "@/lib/kan/useWakeWord";
import { useFullscreen } from "@/lib/kan/useFullscreen";
import { useLiveModeContext } from "@/lib/live/LiveModeContext";
import { useFloatingWindows, type ManualWindowKind } from "@/lib/kan/useFloatingWindows";
import { SECTIONS, type SectionKey } from "@/lib/kan/sections";
import { playWake, playListenStop, playThink, playMessageReceive, playError } from "@/lib/kan/sound";

const MANUAL_WINDOW_TITLE: Record<ManualWindowKind, string> = {
  control: "Control",
  sensor: "Sensor",
  diagram: "Diagrama",
  code: "Código",
};

const WAKE_FLARE_MS = 750;

/**
 * Pantalla principal inmersiva de /inicio (rediseño JARVIS) — reemplaza a
 * `KANHome.tsx`/`KANLayout.tsx`: fondo negro, orb de KAN al centro, sin
 * sidebar/topbar visibles. Compone la misma lógica de siempre
 * (`useConversation`/`useKANState`/`useWakeWord`, mismo criterio que
 * `KANHome`) más el menú hamburguesa (`HamburgerMenu`) que despliega cada
 * sección como overlay (`SectionOverlay` + el client component real de esa
 * sección, reusado sin cambios) en vez de navegar. `screenMode` decide qué
 * se ve: "chat" (orb + input) o una `SectionKey`. Abrir una sección cierra
 * el Modo Presentación (`kan_show_display`) si estaba activo, y viceversa
 * — mutuamente excluyentes, mismo criterio que decidió el plan.
 */
export function ImmersiveHome({
  greeting,
  homeContent,
}: {
  greeting?: string;
  homeContent?: ReactNode;
}) {
  const conv = useConversation();
  const [screenMode, setScreenMode] = useState<"chat" | SectionKey>("chat");
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wakeFlare, setWakeFlare] = useState(false);
  const hasMessages = conv.messages.length > 0;

  const { setLiveActive } = useLiveModeContext();
  useEffect(() => {
    setLiveActive(conv.live.status === "active");
  }, [conv.live.status, setLiveActive]);

  const { activity } = useKANState({
    hasMessages,
    isSending: conv.isSending,
    isSpeaking: conv.isSpeaking,
    isListening: conv.voice.status === "recording",
  });

  const wakeWordEnabled = conv.voice.status === "idle" && conv.live.status !== "active" && !conv.isSpeaking && screenMode === "chat";
  useWakeWord(() => {
    if (conv.voice.status === "idle") {
      // El momento más "JARVIS" de todos — un cue distinto del mic manual
      // (`playListenStart` genérico vive en `ImmersiveOrb`) más el anillo de
      // flare sobre el orb. `setWakeFlare` corre en el callback del wake
      // word (no en el cuerpo de un efecto propio), así que no dispara
      // react-hooks/set-state-in-effect.
      playWake();
      setWakeFlare(true);
      setTimeout(() => setWakeFlare(false), WAKE_FLARE_MS);
      conv.voice.start();
    }
  }, wakeWordEnabled);

  // Cues de personalidad ligados a transiciones de estado (no al click que
  // las origina) — así cubren tanto el envío por texto como por voz sin
  // duplicar lógica en dos lugares. Comparan contra el valor anterior vía
  // `useRef` (no dispara re-render), así que tampoco caen en
  // react-hooks/set-state-in-effect: lo único que hacen es reproducir audio.
  const prevSendingRef = useRef(false);
  useEffect(() => {
    if (!prevSendingRef.current && conv.isSending) playThink();
    if (prevSendingRef.current && !conv.isSending && !conv.error) playMessageReceive();
    prevSendingRef.current = conv.isSending;
  }, [conv.isSending, conv.error]);

  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!prevErrorRef.current && conv.error) playError();
    prevErrorRef.current = conv.error;
  }, [conv.error]);

  const prevRecordingRef = useRef(false);
  useEffect(() => {
    const isRecording = conv.voice.status === "recording";
    if (prevRecordingRef.current && !isRecording) playListenStop();
    prevRecordingRef.current = isRecording;
  }, [conv.voice.status]);

  // Ventanas flotantes (Mejoras "diagramas renderizados" + "ventanas
  // flotantes") — `useFloatingWindows` es 100% local a esta pantalla
  // (posición/tamaño/z-order), separado de `useConversation` (que solo
  // sabe "el modelo pidió abrir una ventana de tal tipo"). `openWindow`/
  // `consumeWindowRequest` son funciones importadas, no setters locales
  // de este componente — mismo motivo que `setLiveActive`/`setWakeFlare`
  // ya usan un `useEffect` acá sin disparar react-hooks/set-state-in-effect.
  const { windows, openWindow, closeWindow, toggleMinimize, focusWindow, moveWindow, retileWindows } = useFloatingWindows();
  const { windowRequest, consumeWindowRequest } = conv;
  useEffect(() => {
    if (!windowRequest) return;
    openWindow(windowRequest);
    consumeWindowRequest();
  }, [windowRequest, consumeWindowRequest, openWindow]);

  // Modo pantalla completa / kiosko — el orb se achica a una esquina (mismo
  // flag `compact` que ya usa el achique por ventanas abiertas) y las
  // ventanas abiertas se reacomodan en grilla apenas se activa, y de nuevo
  // cada vez que se abre una ventana nueva mientras sigue activo (depende de
  // `windows.length`, no de `windows` — retilear no cambia la cantidad, así
  // que no hay loop). Nunca al desactivar: las ventanas quedan donde la
  // grilla las dejó, el usuario puede seguir moviéndolas a mano.
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  useEffect(() => {
    if (!isFullscreen) return;
    retileWindows(window.innerWidth, window.innerHeight);
  }, [isFullscreen, windows.length, retileWindows]);

  function openManualWindow(kind: ManualWindowKind) {
    openWindow({ kind, title: MANUAL_WINDOW_TITLE[kind], props: {} });
  }

  function openSection(section: SectionKey) {
    conv.closeDisplay();
    setHamburgerOpen(false);
    setScreenMode(section);
  }

  function closeSection() {
    setScreenMode("chat");
  }

  const activeSectionLabel = SECTIONS.find((s) => s.key === screenMode)?.label;

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {conv.pendingConfirmation && (
        <PendingConfirmationModal
          confirmation={conv.pendingConfirmation}
          busy={conv.isSending}
          onCancel={() => conv.resolveConfirmation(false)}
          onConfirm={() => conv.resolveConfirmation(true)}
        />
      )}

      {conv.activeDisplay && (
        <JARVISDisplay
          display={conv.activeDisplay}
          messages={conv.messages}
          isSending={conv.isSending}
          streamingStatus={conv.streamingStatus}
          onClose={conv.closeDisplay}
          onSendMessage={(text) => void conv.sendMessage(text)}
        />
      )}

      {/* El Modo Presentación (`activeDisplay`) y una sección del hamburguesa nunca
          se muestran a la vez — si el modelo dispara `kan_show_display` mientras hay
          una sección abierta, `JARVISDisplay` (arriba, z-[200]) la tapa; al cerrar el
          Modo Presentación, la sección reaparece donde había quedado (`screenMode` no
          se toca). Chequeo en el render, no en un efecto — nada que sincronizar. */}
      {screenMode !== "chat" && !conv.activeDisplay && activeSectionLabel && (
        <SectionOverlay title={activeSectionLabel} onClose={closeSection}>
          {screenMode === "sensores" && <SensoresClient />}
          {screenMode === "dispositivos" && <DispositivosPanel />}
          {screenMode === "secuencias" && <SecuenciasClient />}
          {screenMode === "alertas" && <AlertsPanel />}
          {screenMode === "respaldos" && <RespaldosClient />}
          {screenMode === "logs" && <LogsPanel />}
          {screenMode === "configuracion" && (
            <ConfiguracionPanel onNavigateSection={(section) => setScreenMode(section)} />
          )}
          {screenMode === "vista-general" && <OverviewPanel />}
        </SectionOverlay>
      )}

      <ImmersiveOrb
        conv={conv}
        activity={activity}
        greeting={greeting}
        homeContent={homeContent}
        flare={wakeFlare}
        compact={windows.length > 0 || isFullscreen}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <FloatingWindowLayer
        windows={windows}
        onClose={closeWindow}
        onToggleMinimize={toggleMinimize}
        onFocus={focusWindow}
        onMove={moveWindow}
      />

      {historyOpen && <HistorySheet messages={conv.messages} onClose={() => setHistoryOpen(false)} />}

      {/* HUD_SCOPE_STYLE: mismo motivo que HamburgerMenu/NewWindowButton — flota sobre negro puro, no sobre una superficie del tema normal. */}
      <div className="fixed top-4 left-4 z-[210]" style={HUD_SCOPE_STYLE}>
        <SoundToggle />
      </div>

      {/* bottom-14 (no bottom-4): despeja el StatusBar (h-9) fijo abajo, misma altura que NewWindowButton. */}
      <div className="fixed bottom-14 left-4 z-[210]" style={HUD_SCOPE_STYLE}>
        <FullscreenToggle active={isFullscreen} onToggle={toggleFullscreen} />
      </div>

      <NewWindowButton onOpen={openManualWindow} />

      <HamburgerMenu open={hamburgerOpen} onToggle={() => setHamburgerOpen((prev) => !prev)} onSelect={openSection} />

      <StatusBar />
    </div>
  );
}

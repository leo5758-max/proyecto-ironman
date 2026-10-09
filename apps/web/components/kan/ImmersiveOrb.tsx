"use client";

import { useRef, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { KANAvatar } from "@/components/kan/KANAvatar";
import { FloatingResponse } from "@/components/kan/FloatingResponse";
import { VoiceButton } from "@/components/dashboard/VoiceButton";
import { LiveVoiceButton } from "@/components/dashboard/LiveVoiceButton";
import { ScreenShareButton } from "@/components/dashboard/ScreenShareButton";
import { CameraShareButton } from "@/components/dashboard/CameraShareButton";
import type { useConversation } from "@/lib/chat/useConversation";
import type { KANActivity } from "@/lib/kan/useKANState";
import { playListenStart } from "@/lib/kan/sound";

// Mitad del diámetro máximo de OrbRings (220px en viewports ≥640px, ver
// OrbRings.tsx) + margen — distancia mínima entre el centro del orb y el
// borde inferior de la franja de texto, para que el anillo nunca quede
// tapado por (ni tape a) `FloatingResponse`/el saludo, sin importar cuánto
// texto tengan.
const TEXT_ZONE_CLEARANCE = "calc(50% + 130px)";

/**
 * Pantalla de reposo/chat de /inicio (rediseño JARVIS) — el orb de KAN
 * centrado + la respuesta flotando arriba (`FloatingResponse`) + el input
 * pill, todo sobre fondo negro.
 *
 * El orb está centrado con `position: absolute` + transform, no con
 * flexbox dinámico — su posición no depende de la altura de ningún
 * hermano (el `<form>` de abajo, o `FloatingResponse` cuando la respuesta
 * es larga). Antes, centrarlo con `justify-center` sobre un grupo de
 * altura variable dejaba que una respuesta larga o un viewport bajo
 * empujaran el anillo exterior fuera de pantalla — con posición absoluta
 * fija, eso ya no puede pasar: el orb siempre está en el mismo lugar. El
 * texto flotante y el input viven en sus propias franjas (también
 * `absolute`, ancladas a los bordes del contenedor), independientes entre
 * sí y del orb.
 */
export function ImmersiveOrb({
  conv,
  activity,
  greeting,
  homeContent,
  flare,
  compact,
  onOpenHistory,
}: {
  conv: ReturnType<typeof useConversation>;
  activity: KANActivity;
  greeting?: string;
  /** Contenido extra antes del primer mensaje (ej. `OnboardingWelcome`) — solo se muestra en reposo. */
  homeContent?: ReactNode;
  /** Anillo de flare sobre el orb — `ImmersiveHome` lo prende brevemente al activarse el wake word. */
  flare?: boolean;
  /** Con alguna ventana flotante abierta, el orb se achica y se corre a una esquina — libera el centro sin desmontarlo. */
  compact?: boolean;
  onOpenHistory: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMessages = conv.messages.length > 0;

  async function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await conv.selectImage(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await conv.sendMessage(conv.input);
  }

  function handleMicClick() {
    if (conv.voice.status === "recording") {
      conv.voice.stop();
    } else {
      playListenStart();
      conv.voice.start();
    }
  }

  return (
    <div className="relative h-full w-full">
      {/*
       * Orb — centrado absoluto, fijo, no depende del contenido de los
       * hermanos. Con `compact` (alguna ventana flotante abierta, ver
       * ImmersiveHome.tsx) se achica y se corre a la esquina inferior
       * izquierda vía `.kan-orb-compact` (globals.css) — mismo elemento,
       * nunca se desmonta, `transition: transform` anima el cambio de
       * lugar/tamaño en los dos sentidos (achicarse al abrir una ventana,
       * volver al cerrarse la última).
       */}
      <div className={`absolute top-1/2 left-1/2 kan-orb-anchor ${compact ? "kan-orb-compact" : ""}`}>
        <KANAvatar size="lg" activity={activity} flare={flare} />
      </div>

      {/*
       * Franja de texto — solo `bottom` (no `top`), así que la altura es
       * automática según el contenido: el saludo/`FloatingResponse` nunca
       * se recorta por un alto de franja mal calculado, siempre se ve
       * completo, creciendo hacia arriba desde `TEXT_ZONE_CLEARANCE`
       * arriba del centro (donde arranca el orb). `max-h`+`overflow-y-auto`
       * es la única red de seguridad — si una respuesta es tan larga que
       * ni así entra, scrollea en vez de empujar algo fuera de pantalla.
       */}
      <div
        className="absolute inset-x-0 flex max-h-[40vh] flex-col items-center gap-2 overflow-y-auto px-4"
        style={{ bottom: TEXT_ZONE_CLEARANCE }}
      >
        {!hasMessages && (
          <div className="fade-in flex flex-col items-center gap-2 text-center">
            {greeting && <p className="text-[32px] font-medium tracking-tight text-ink">{greeting}</p>}
            <p className="text-sm text-ink-muted">{activity === "listening" ? "Escuchando…" : 'Decí "KAN" o escribí abajo'}</p>
            {homeContent && <div className="mt-6 w-full max-w-3xl">{homeContent}</div>}
          </div>
        )}
        {hasMessages && (
          <FloatingResponse
            messages={conv.messages}
            isSending={conv.isSending}
            streamingStatus={conv.streamingStatus}
            isSpeaking={conv.isSpeaking}
            onOpenHistory={onOpenHistory}
          />
        )}
        {(conv.error || conv.voice.error || conv.live.error) && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {conv.error ?? conv.voice.error ?? conv.live.error}
          </p>
        )}
      </div>

      {/* Input — franja fija abajo, tamaño y posición independientes de lo que haya arriba. */}
      <form
        onSubmit={handleSubmit}
        className="absolute inset-x-0 bottom-12 mx-auto flex w-full max-w-xl flex-col gap-2 px-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 px-1">
          <LiveVoiceButton status={conv.live.status} onClick={conv.live.status === "active" ? conv.live.stop : conv.live.start} />
          {conv.live.status === "active" && (
            <ScreenShareButton
              sharing={conv.live.screenSharing}
              onClick={conv.live.screenSharing ? conv.live.stopScreenShare : conv.live.startScreenShare}
            />
          )}
          {conv.live.status === "active" && (
            <CameraShareButton
              sharing={conv.live.cameraSharing}
              onClick={conv.live.cameraSharing ? conv.live.stopCameraShare : conv.live.startCameraShare}
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            aria-label="Adjuntar imagen"
            title="Adjuntar imagen"
            onClick={() => fileInputRef.current?.click()}
            disabled={conv.isSending}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-faint transition-colors duration-fast hover:bg-surface-3 hover:text-ink-muted disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Imagen</span>
          </button>
          {conv.pendingImage && (
            <div className="flex items-center gap-2 rounded-full bg-surface-3 px-2 py-1">
              <img
                src={`data:${conv.pendingImage.mimeType};base64,${conv.pendingImage.data}`}
                alt="Imagen a adjuntar"
                className="h-6 w-6 rounded-full object-cover"
              />
              <button
                type="button"
                aria-label="Quitar imagen"
                onClick={() => conv.setPendingImage(null)}
                className="press rounded-full p-0.5 text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end gap-1 rounded-[24px] bg-surface-3 py-2 pr-2 pl-2">
          <VoiceButton status={conv.voice.status} onClick={handleMicClick} />
          <input
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-ink outline-none placeholder:text-ink-faint"
            placeholder="Escribile a KAN…"
            value={conv.input}
            onChange={(event) => conv.setInput(event.target.value)}
            disabled={conv.isSending}
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform duration-fast hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            disabled={conv.isSending || !conv.input.trim()}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

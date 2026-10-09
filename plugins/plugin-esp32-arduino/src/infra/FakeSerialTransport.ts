import type { PortInfo, SerialConnection, SerialTransportPort, LineConnectionState } from "@kan/serial-line-transport";

/**
 * Transporte serial simulado para tests (ADR-012: probar contra un "cliente
 * real" — aquí, un dispositivo que habla el protocolo de verdad — en vez de
 * mockear la lógica interna). Cada `FakeDevice` decide qué responder a cada
 * comando, igual que respondería el firmware real sobre `Serial`.
 */
export interface FakeDevice {
  path: string;
  manufacturer?: string;
  /** `undefined` simula un dispositivo serial ajeno a KAN que no responde nuestro protocolo. */
  handle(command: Record<string, unknown>): Record<string, unknown> | undefined;
}

export class FakeSerialTransport implements SerialTransportPort {
  constructor(private readonly devices: FakeDevice[]) {}

  async list(): Promise<PortInfo[]> {
    return this.devices.map((device) => ({ path: device.path, manufacturer: device.manufacturer }));
  }

  async open(path: string): Promise<SerialConnection> {
    const device = this.devices.find((d) => d.path === path);
    if (!device) {
      throw new Error(`Puerto no encontrado: ${path}`);
    }

    const lineHandlers: Array<(line: string) => void> = [];
    const stateHandlers: Array<(state: LineConnectionState) => void> = [];
    let state: LineConnectionState = "connected";

    return {
      get state() {
        return state;
      },
      write: (line: string) => {
        if (state !== "connected") return;
        let command: Record<string, unknown>;
        try {
          command = JSON.parse(line) as Record<string, unknown>;
        } catch {
          return;
        }
        const response = device.handle(command);
        if (response !== undefined) {
          queueMicrotask(() => {
            if (state !== "connected") return;
            lineHandlers.forEach((handler) => handler(JSON.stringify(response)));
          });
        }
      },
      onLine: (handler: (line: string) => void) => {
        lineHandlers.push(handler);
        return () => {
          const index = lineHandlers.indexOf(handler);
          if (index !== -1) lineHandlers.splice(index, 1);
        };
      },
      onStateChange: (handler: (state: LineConnectionState) => void) => {
        stateHandlers.push(handler);
        return () => {
          const index = stateHandlers.indexOf(handler);
          if (index !== -1) stateHandlers.splice(index, 1);
        };
      },
      close: async () => {
        state = "disconnected";
        stateHandlers.forEach((handler) => handler(state));
      },
    };
  }
}

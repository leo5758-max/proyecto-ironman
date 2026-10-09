import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import { useSession } from "../../lib/auth/SessionProvider";
import { registerPushToken } from "../../lib/notifications/registerPushToken";

// Feather (dentro de @expo/vector-icons) — es el set del que `lucide-react`
// (usado en apps/web) es un fork directo, mismo lenguaje visual de trazo
// fino en ambas plataformas.
type FeatherIconName = keyof typeof Feather.glyphMap;

function tabIcon(name: FeatherIconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Feather name={name} size={size} color={color as string} />
  );
}

/**
 * Navegación del área autenticada (docs/18, incremento 6) — mismas 3
 * secciones que la barra de `apps/web`'s shell (Chat, Dashboard,
 * Automatización), como pestañas nativas en vez de un nav lateral.
 *
 * Este layout solo se monta con sesión activa (guard en app/_layout.tsx),
 * así que es el lugar natural para registrar el token de push una vez por
 * sesión (P7, ADR-040) — sin pantalla ni gesto de usuario dedicado.
 */
export default function AppLayout() {
  const { session } = useSession();

  useEffect(() => {
    if (session?.userId) registerPushToken(session.userId);
  }, [session?.userId]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#5b6472",
        tabBarStyle: { backgroundColor: "#0b0e14", borderTopColor: "#1f2430" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Chat", tabBarIcon: tabIcon("message-circle") }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: tabIcon("grid") }} />
      <Tabs.Screen name="sensores" options={{ title: "Sensores", tabBarIcon: tabIcon("activity") }} />
      <Tabs.Screen name="control" options={{ title: "Control", tabBarIcon: tabIcon("sliders") }} />
      <Tabs.Screen name="dispositivos" options={{ title: "Dispositivos", tabBarIcon: tabIcon("cpu") }} />
      <Tabs.Screen name="alertas" options={{ title: "Alertas", tabBarIcon: tabIcon("bell") }} />
      <Tabs.Screen name="automatizaciones" options={{ title: "Automatización", tabBarIcon: tabIcon("zap") }} />
    </Tabs>
  );
}

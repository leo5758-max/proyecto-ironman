import { describe, expect, it } from "vitest";
import { buildInviteEmailBody, inviteEmailSubject } from "./inviteEmail";

describe("inviteEmailSubject", () => {
  it("interpola el label del equipo", () => {
    expect(inviteEmailSubject("Equipo (Windows)")).toBe("Te invitaron a acceder a Equipo (Windows) en KAN");
  });
});

describe("buildInviteEmailBody", () => {
  it("incluye el label y el link a /inicio (el acceso ya está concedido, sin link de 'aceptar')", () => {
    const { html, text } = buildInviteEmailBody({ agentLabel: "Equipo (Windows)", appUrl: "https://kan.dev" });

    expect(text).toContain("Equipo (Windows)");
    expect(text).toContain("https://kan.dev/inicio");
    expect(html).toContain("Equipo (Windows)");
    expect(html).toContain('href="https://kan.dev/inicio"');
  });

  it("escapa HTML en el label", () => {
    const { html } = buildInviteEmailBody({ agentLabel: "<b>x</b>", appUrl: "https://kan.dev" });
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;b&gt;");
  });
});

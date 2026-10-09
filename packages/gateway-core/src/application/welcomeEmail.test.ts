import { describe, expect, it } from "vitest";
import { buildWelcomeEmailBody, welcomeEmailSubject } from "./welcomeEmail";

describe("welcomeEmailSubject", () => {
  it("interpola el nombre", () => {
    expect(welcomeEmailSubject("Fabián")).toBe("Bienvenido a KAN, Fabián");
  });
});

describe("buildWelcomeEmailBody", () => {
  it("incluye el nombre y los dos links (docs + /inicio)", () => {
    const { html, text } = buildWelcomeEmailBody({ name: "Fabián", appUrl: "https://kan.dev" });

    expect(text).toContain("¡Bienvenido a KAN, Fabián!");
    expect(text).toContain("https://kan.dev/docs");
    expect(text).toContain("https://kan.dev/inicio");
    expect(html).toContain("Fabián");
    expect(html).toContain('href="https://kan.dev/docs"');
    expect(html).toContain('href="https://kan.dev/inicio"');
  });

  it("escapa HTML en el nombre (evita inyección si viniera de raw_user_meta_data)", () => {
    const { html } = buildWelcomeEmailBody({ name: "<script>alert(1)</script>", appUrl: "https://kan.dev" });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

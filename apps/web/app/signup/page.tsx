import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASSES, PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { signUpAction } from "./actions";
import { signInWithGoogleAction } from "@/lib/auth/oauthActions";

const TITLE = "Crear cuenta — KAN";
const DESCRIPTION = "Creá tu cuenta gratis en KAN y empezá a controlar tu hardware con inteligencia artificial, sin escribir código.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/signup", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string; ref?: string }> }) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm fade-in">
        <h1 className="mb-1 text-lg font-semibold text-ink">Crear cuenta</h1>
        <p className="mb-6 text-sm text-ink-faint">Empieza a usar KAN.</p>

        {params.error && (
          <p className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {params.error}
          </p>
        )}

        {params.ref && (
          <p className="mb-4 rounded-md border border-accent/40 bg-gradient-accent-soft px-3 py-2 text-sm text-ink">
            Te invitaron a KAN — vos y quien te invitó reciben 1 mes gratis de Pro al registrarte.
          </p>
        )}

        <form action={signUpAction} className="flex flex-col gap-3">
          {params.ref && <input type="hidden" name="referralCode" value={params.ref} />}
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={INPUT_CLASSES} />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Contraseña (mínimo 6 caracteres)"
            autoComplete="new-password"
            className={INPUT_CLASSES}
          />
          <button type="submit" className={PRIMARY_BUTTON_CLASSES}>
            Crear cuenta
          </button>
        </form>

        <form action={signInWithGoogleAction} className="mt-4 border-t border-line pt-4">
          <button type="submit" className={SECONDARY_BUTTON_CLASSES}>
            Continuar con Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-faint">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}

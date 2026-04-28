import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";

type GoogleLoginButtonProps = {
  disabled?: boolean;
  onCredential: (credential: string) => Promise<void> | void;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";
const MOCK_GOOGLE_CREDENTIAL = "mock-google-credential";

function isMockMode() {
  return (
    import.meta.env.MODE === "test" ||
    (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === "true")
  );
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google script could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Google script could not be loaded."));

    document.head.appendChild(script);
  });
}

export function GoogleLoginButton({
  disabled = false,
  onCredential,
}: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode()) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === "replace-me") {
      setErrorMessage("Google login is not configured for this environment.");
      return;
    }

    let cancelled = false;

    async function renderGoogleButton() {
      try {
        await loadGoogleScript();

        if (cancelled || !containerRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) {
              void onCredential(credential);
            }
          },
        });

        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
        });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Google login could not be initialized.",
          );
        }
      }
    }

    void renderGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (isMockMode()) {
    return (
      <Button
        className="w-full"
        disabled={disabled}
        onClick={() => void onCredential(MOCK_GOOGLE_CREDENTIAL)}
        type="button"
      >
        Continuar com Google
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={disabled ? "pointer-events-none opacity-50" : undefined}
        ref={containerRef}
      />
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

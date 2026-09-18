"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { createClient } from "@/lib/supabase/client";

type AuthStatus = "checking" | "authenticated" | "anonymous";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      if (data.session) {
        setStatus("authenticated");
        return;
      }

      setStatus("anonymous");
      router.replace("/login");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        setStatus("anonymous");
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  if (status !== "authenticated") {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg" aria-busy="true">
        <div className="flex items-center gap-2.5 text-surface/70">
          <Image
            className="size-8 rounded-[9px] border border-surface/10 object-cover"
            src="/Logo.png"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span className="text-[0.78rem] font-semibold">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  return <CurrentUserProvider>{children}</CurrentUserProvider>;
}

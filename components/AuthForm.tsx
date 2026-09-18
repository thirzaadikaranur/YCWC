"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

const copy: Record<AuthMode, { title: string; description: string; loading: string }> = {
  login: {
    title: "Masuk ke ruang belajarmu",
    description: "Lanjutkan sesi belajar dan lihat bagian yang sudah kamu pahami.",
    loading: "Memeriksa...",
  },
  signup: {
    title: "Buat ruang belajarmu",
    description: "Mulai belajar dengan menemukan bagian yang masih perlu kamu perkuat.",
    loading: "Membuat akun...",
  },
};

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox untuk link konfirmasi, lalu coba masuk lagi.";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Email sudah terdaftar. Coba masuk atau gunakan email lain.";
  }
  if (normalized.includes("password should be at least")) {
    return "Password terlalu pendek. Gunakan minimal 6 karakter.";
  }
  if (normalized.includes("unable to validate email") || normalized.includes("invalid email")) {
    return "Format email tidak valid.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }

  return message;
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(translateAuthError(signInError.message));
          return;
        }

        router.replace("/");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { displayName: displayName.trim() } },
      });

      if (signUpError) {
        setError(translateAuthError(signUpError.message));
        return;
      }

      if (data.session) {
        router.replace("/");
        return;
      }

      setNotice(
        "Akun dibuat. Cek emailmu untuk link konfirmasi sebelum bisa masuk.",
      );
      setMode("login");
    } finally {
      setIsLoading(false);
    }
  }

  async function requestReset() {
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Isi email akunmu dulu, lalu tekan Lupa password lagi.");
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/login` },
    );

    if (resetError) {
      setError(translateAuthError(resetError.message));
      return;
    }

    setNotice("Link reset password sudah dikirim ke email akunmu.");
  }

  const activeCopy = copy[mode];

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-5 py-[clamp(28px,6vh,68px)] pb-6 isolate before:absolute before:-right-[22%] before:-top-[44%] before:z-[-1] before:block before:aspect-square before:w-[min(74vw,760px)] before:rounded-full before:border before:border-surface/[0.07] before:content-[''] after:absolute after:-bottom-[35%] after:-left-[24%] after:z-[-1] after:block after:aspect-square after:w-[min(48vw,500px)] after:rounded-full after:border after:border-accent/[0.12] after:content-['']">
      <main className="flex w-full max-w-[448px] flex-col gap-[18px]">
        <div className="inline-flex items-center justify-center gap-2.5 text-surface" aria-label="ReverseTutor">
          <Image className="size-12 rounded-[14px] border border-surface/[0.12] object-cover shadow-[0_8px_18px_rgba(8,10,28,0.2)]" src="/Logo.png" alt="" width={48} height={48} priority />
          <span className="font-display text-[1.42rem] font-semibold tracking-[-0.025em]">ReverseTutor</span>
        </div>

        <section className="relative overflow-hidden rounded-card border border-surface/20 bg-surface p-[clamp(24px,5vw,36px)] text-ink shadow-card before:absolute before:left-9 before:top-0 before:block before:h-1 before:w-16 before:rounded-b-[5px] before:bg-accent before:content-['']" aria-labelledby="auth-title">
          <div className="mb-6">
            <h1 id="auth-title" className="mb-2.5 max-w-[12ch] font-display text-[clamp(2rem,7vw,2.62rem)] font-semibold leading-[1.03] tracking-[-0.045em]">
              {activeCopy.title}
            </h1>
            <p className="m-0 max-w-[36ch] text-[0.88rem] leading-[1.55] text-ink-muted">{activeCopy.description}</p>
          </div>

          <div className="mb-[22px] grid grid-cols-2 gap-1 rounded-[16px] border border-ink/[0.12] bg-surface-muted p-1" role="tablist" aria-label="Pilihan akses akun">
            {(["login", "signup"] as AuthMode[]).map((item) => (
              <button
                key={item}
                className={`min-h-[42px] rounded-control border border-transparent px-3.5 py-2 text-[0.84rem] font-semibold transition-colors ${mode === item ? "bg-bg text-surface shadow-[0_4px_12px_rgba(27,31,59,0.16)]" : "text-ink-muted hover:text-ink"}`}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => changeMode(item)}
              >
                {item === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {error && (
            <p className="mb-4 flex items-start gap-2 rounded-control border border-danger/30 bg-danger/[0.09] px-3 py-[11px] text-[0.78rem] font-semibold leading-[1.45] text-danger" role="alert" aria-live="polite">
              <Icon name="alert" className="mt-px size-[17px] shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {notice && (
            <p className="mb-4 flex items-start gap-2 rounded-control border border-success/35 bg-success/[0.1] px-3 py-[11px] text-[0.78rem] font-semibold leading-[1.45] text-[#42644D]" role="status" aria-live="polite">
              <Icon name="check" className="mt-px size-[17px] shrink-0" />
              <span>{notice}</span>
            </p>
          )}

          <form className="grid gap-[17px]" onSubmit={submit}>
            {mode === "signup" && (
              <div className="grid gap-[7px]">
                <label className="text-[0.78rem] font-semibold" htmlFor="signup-name">Nama tampilan</label>
                <input className="min-h-12 w-full rounded-control border border-ink/25 bg-surface-bright px-3.5 py-3 text-[0.88rem] text-ink outline-none transition-colors placeholder:text-[#858797] hover:border-ink/40 focus:border-accent focus:ring-4 focus:ring-accent/15" id="signup-name" name="displayName" type="text" autoComplete="name" placeholder="Contoh: Naya Putri" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </div>
            )}
            <div className="grid gap-[7px]">
              <label className="text-[0.78rem] font-semibold" htmlFor="auth-email">Email</label>
              <input className="min-h-12 w-full rounded-control border border-ink/25 bg-surface-bright px-3.5 py-3 text-[0.88rem] text-ink outline-none transition-colors placeholder:text-[#858797] hover:border-ink/40 focus:border-accent focus:ring-4 focus:ring-accent/15" id="auth-email" name="email" type="email" autoComplete="email" placeholder="nama@contoh.id" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-[7px]">
              <label className="text-[0.78rem] font-semibold" htmlFor="auth-password">Password</label>
              <input className="min-h-12 w-full rounded-control border border-ink/25 bg-surface-bright px-3.5 py-3 text-[0.88rem] text-ink outline-none transition-colors placeholder:text-[#858797] hover:border-ink/40 focus:border-accent focus:ring-4 focus:ring-accent/15" id="auth-password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "Masukkan password" : "Buat password"} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {mode === "signup" && <small className="-mt-2 text-[0.7rem] leading-[1.45] text-ink-muted">Gunakan password yang mudah kamu ingat dan sulit ditebak orang lain.</small>}

            <div className="mt-[5px] grid gap-[15px]">
              {mode === "login" && (
                <button className="justify-self-start text-[0.76rem] text-ink-muted underline underline-offset-[3px] transition-colors hover:text-accent" type="button" onClick={requestReset}>Lupa password?</button>
              )}
              <button className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-control border border-transparent bg-accent px-[18px] py-3 text-[0.86rem] font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-80" type="submit" disabled={isLoading} aria-busy={isLoading}>
                {isLoading && <span className="size-[15px] animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" />}
                {isLoading ? activeCopy.loading : mode === "login" ? "Masuk" : "Buat Akun"}
              </button>
            </div>
          </form>
        </section>

        <p className="m-0 text-center text-[0.68rem] text-surface/[0.46]">ReverseTutor, 2026</p>
      </main>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { createTopic } from "@/lib/api";
import type { ChatMode } from "@/types";

const placeholders: Record<ChatMode, string> = {
  ringkasan: "Tempel materi yang mau diringkas...",
  kuis: "Tempel materi untuk dibuatkan kuis...",
  reverse_bot: "Jelaskan bagian yang ingin kamu ajarkan...",
  qa: "Tulis pertanyaanmu tentang materi...",
};

export default function Home() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function startTopic(material: string) {
    if (!material.trim()) {
      setError("Tempel materi atau tulis pesan dulu supaya kita bisa mulai.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await createTopic({ rawMaterial: material });
      router.push(`/topik/${response.topic.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Materi belum bisa diproses. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="relative min-h-0 flex-1">
        <WelcomeScreen selectedMode={selectedMode} onSelectMode={setSelectedMode} />
        {error && (
          <p className="fixed bottom-[92px] left-1/2 z-30 -translate-x-1/2 rounded-control border border-danger/40 bg-bg/95 px-3.5 py-2.5 text-center text-[0.72rem] font-semibold text-[#F2B2A8] shadow-card" role="alert">
            {error}
          </p>
        )}
        <Composer
          placeholder={selectedMode ? placeholders[selectedMode] : "Kirim atau tempel materi untuk mulai..."}
          isSubmitting={isSubmitting}
          onSubmit={startTopic}
        />
      </div>
    </AppShell>
  );
}

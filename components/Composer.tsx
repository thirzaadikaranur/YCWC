"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { extractPdfText } from "@/lib/pdf";

type AttachmentState = "parsing" | "success" | "error";

interface Attachment {
  name: string;
  size: string;
  state: AttachmentState;
  text?: string;
  pageCount?: number;
  truncated?: boolean;
  message?: string;
}

interface ComposerProps {
  placeholder: string;
  isSubmitting?: boolean;
  onSubmit: (material: string) => void;
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
}

export function Composer({ placeholder, isSubmitting = false, onSubmit }: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function selectFile(file: File) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const base = { name: file.name, size: formatFileSize(file.size) };

    if (!isPdf || file.size === 0) {
      setAttachment({
        ...base,
        state: "error",
        message: "File ini bukan PDF yang bisa dibaca. Tempel teks materinya secara manual.",
      });
      return;
    }

    setAttachment({ ...base, state: "parsing" });

    try {
      const result = await extractPdfText(file);

      if (!result.text) {
        setAttachment({
          ...base,
          state: "error",
          message: "Tidak ada teks yang bisa dibaca dari PDF ini. Mungkin hasil scan gambar — tempel teksnya manual.",
        });
        return;
      }

      setAttachment({
        ...base,
        state: "success",
        text: result.text,
        pageCount: result.pageCount,
        truncated: result.truncated,
      });
    } catch {
      setAttachment({
        ...base,
        state: "error",
        message: "Gagal membaca PDF. Coba file lain atau tempel teksnya manual.",
      });
    }
  }

  function removeAttachment() {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (attachment?.state === "parsing" || isSubmitting) return;

    const material = value.trim() || attachment?.text || "";
    if (!material) return;

    onSubmit(material);
  }

  const canSubmit =
    !isSubmitting &&
    attachment?.state !== "parsing" &&
    Boolean(value.trim() || attachment?.text);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-b from-bg/0 via-bg/85 to-bg px-3 pb-3 pt-8 transition-[left,right] duration-[220ms] ease-out md:left-[var(--sidebar-offset)] md:right-[var(--panel-offset,0px)] md:px-[22px] md:pb-[22px]">
      <div className="mx-auto w-full max-w-[820px]">
        {attachment && (
          <div className="mx-auto mb-2 w-full max-w-[650px]">
            <div className={`grid grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-2.5 rounded-[13px] border p-2.5 ${attachment.state === "success" ? "border-success/45 bg-[#425C4E]/55" : attachment.state === "error" ? "border-danger/60 bg-[#662D32]/70" : "border-surface/[0.16] bg-border/90"}`}>
              <span className={`relative grid size-7 place-items-center rounded-lg ${attachment.state === "success" ? "bg-success/25 text-[#B3C8B8]" : attachment.state === "error" ? "bg-danger/30 text-[#F2B2A8]" : "bg-surface/[0.11] text-surface"}`}>
                {attachment.state === "parsing" && <Icon name="file" className="size-[17px]" />}
                {attachment.state === "success" && <Icon name="check" className="size-[17px]" />}
                {attachment.state === "error" && <Icon name="alert" className="size-[17px]" />}
                {attachment.state === "parsing" && <span className="absolute -bottom-px -right-px size-2.5 animate-spin rounded-full border-[1.5px] border-surface/30 border-t-accent" />}
              </span>
              <span className="min-w-0">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-[0.72rem] font-bold leading-tight text-surface">{attachment.name}</span>
                  <span className="shrink-0 text-[0.64rem] text-surface/[0.52]">{attachment.size}</span>
                </span>
                <span className={`mt-[3px] block text-[0.65rem] leading-[1.4] ${attachment.state === "success" ? "text-[#B3C8B8]" : attachment.state === "error" ? "text-[#F2B2A8]" : "text-surface/[0.62]"}`}>
                  {attachment.state === "parsing" && "Membaca PDF..."}
                  {attachment.state === "success" &&
                    `PDF siap digunakan (${attachment.pageCount ?? 0} halaman, ${attachment.text?.length ?? 0} karakter)`}
                  {attachment.state === "error" && attachment.message}
                </span>
              </span>
              <button className="grid size-7 place-items-center rounded-lg text-lg leading-none text-surface/60 transition-colors hover:bg-surface/[0.12] hover:text-surface" type="button" aria-label="Hapus lampiran" onClick={removeAttachment}>
                <Icon name="x" className="size-4" />
              </button>
            </div>
            {attachment.state === "success" && attachment.truncated && (
              <p className="m-1.5 text-[0.62rem] leading-[1.45] text-surface/[0.48]">
                Materi dipotong otomatis agar tetap muat diproses AI.
              </p>
            )}
          </div>
        )}
        <form className="grid min-h-[58px] grid-cols-[42px_minmax(0,1fr)_40px] items-center gap-2 rounded-[20px] border border-surface/[0.19] bg-surface/10 p-2 pl-2.5 shadow-[0_13px_34px_rgba(8,10,28,0.2)] backdrop-blur-[16px] transition-colors focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/[0.08] max-md:min-h-[54px] max-md:grid-cols-[38px_minmax(0,1fr)_38px] max-md:rounded-[18px]" onSubmit={submit}>
          <button className="grid size-10 place-items-center rounded-full text-surface/70 transition-colors hover:bg-surface/[0.11] hover:text-surface max-md:size-9" type="button" aria-label="Unggah materi PDF" onClick={() => fileInputRef.current?.click()}>
            <Icon name="plus" className="size-5" />
          </button>
          <label className="sr-only" htmlFor="composer-input">Pesan atau materi</label>
          <input
            className="min-w-0 border-0 bg-transparent px-0 py-2.5 text-[0.8rem] text-surface outline-none placeholder:text-surface/[0.48]"
            id="composer-input"
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button className="grid size-10 place-items-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60 max-md:size-9" type="submit" aria-label="Kirim pesan" disabled={!canSubmit}>
            {isSubmitting ? <span className="size-4 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" /> : <Icon name="send" className="size-[18px]" />}
          </button>
        </form>
        <input ref={fileInputRef} className="sr-only" type="file" accept=".pdf,application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void selectFile(file); }} />
      </div>
    </div>
  );
}

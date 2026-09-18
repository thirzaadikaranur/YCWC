import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PanelHeading, SettingCopy } from "@/components/settings/SettingsPrimitives";
import type { UserAccount } from "@/types";

interface AccountSettingsPanelProps {
  user: UserAccount;
  onResetPassword: () => void;
  onLogout: () => void;
  onDelete: () => void;
}

export function AccountSettingsPanel({ user, onResetPassword, onLogout, onDelete }: AccountSettingsPanelProps) {
  return (
    <section role="tabpanel" aria-labelledby="account-tab">
      <PanelHeading title="Akun" description="Kelola akses akun dan data yang tersimpan di ReverseTutor." />
      <div className="overflow-hidden rounded-[17px] border border-ink/[0.15] bg-surface-bright shadow-[0_14px_30px_rgba(27,31,59,0.07)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-b border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]"><SettingCopy title="Email" description="Email akun diambil dari layanan autentikasi dan tidak dapat diedit di sini." /><StaticValue value={user.email || "—"} /></div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-b border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]"><SettingCopy title="Bergabung sejak" description="Tanggal akun dibuat di ReverseTutor." /><StaticValue value={user.joinedAt} /></div>
        <div className="flex flex-wrap gap-[9px] p-[21px_25px] max-md:flex-col max-md:px-[17px]"><button className="min-h-[43px] rounded-control border border-accent/60 bg-transparent px-3.5 py-2.5 text-[0.72rem] font-bold text-[#B43F24] hover:bg-accent/10" type="button" onClick={onResetPassword}>Ganti Password</button><button className="min-h-[43px] rounded-control border border-ink/25 bg-transparent px-3.5 py-2.5 text-[0.72rem] font-bold text-ink-muted hover:bg-surface-muted" type="button" onClick={onLogout}>Keluar</button></div>
      </div>
      <section className="mt-[33px] border-t border-ink/20 pt-[25px]" aria-labelledby="danger-zone-title">
        <div className="mb-[17px]"><h3 id="danger-zone-title" className="mb-[7px] font-display text-[1.28rem] font-semibold tracking-[-0.035em]">Zona Sensitif</h3><p className="m-0 max-w-[54ch] text-[0.72rem] leading-[1.55] text-ink-muted">Menghapus akun akan menghapus topik, sesi, peta pemahaman, histori skor, dan profil belajarmu. Tindakan ini tidak dapat dibatalkan.</p></div>
        <button className="min-h-[43px] rounded-control border border-danger/50 bg-danger/[0.08] px-3.5 py-2.5 text-[0.72rem] font-bold text-[#963E38] hover:bg-danger/[0.14]" type="button" onClick={onDelete}>Hapus Akun</button>
      </section>
    </section>
  );
}

function StaticValue({ value }: { value: string }) {
  return <div className="flex min-h-12 w-full max-w-[290px] items-center justify-self-end rounded-control border border-ink/[0.12] bg-surface-muted px-[13px] py-[11px] text-[0.8rem] text-ink-muted max-[850px]:max-w-full max-[850px]:justify-self-start">{value}</div>;
}

interface DeleteAccountDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountDialog({ open, email, onClose, onConfirm }: DeleteAccountDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  if (!open) return null;
  const canDelete = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(8,10,28,0.68)] p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="relative w-full max-w-[470px] rounded-[20px] border border-surface/30 bg-surface p-[29px] text-ink shadow-card max-md:p-[25px_19px_20px]">
        <button className="absolute right-4 top-4 grid size-[30px] place-items-center rounded-[9px] border border-ink/[0.14] text-lg leading-none text-ink-muted hover:bg-surface-muted" type="button" aria-label="Tutup dialog" onClick={() => { setConfirmEmail(""); onClose(); }}><Icon name="x" className="size-4" /></button>
        <p className="mb-2 text-[0.62rem] font-extrabold tracking-[0.11em] text-danger">AKSI TIDAK DAPAT DIBATALKAN</p>
        <h2 id="delete-dialog-title" className="mb-2.5 max-w-[13ch] font-display text-[2rem] font-semibold leading-[1.03] tracking-[-0.05em]">Hapus akun ini?</h2>
        <p className="mb-5 text-[0.75rem] leading-[1.6] text-ink-muted">Semua topik dan riwayat belajarmu akan ikut dihapus. Ketik email akunmu untuk mengonfirmasi.</p>
        <label className="grid gap-[7px] text-[0.72rem] font-bold" htmlFor="delete-confirm-email">Ketik email akun<input className="min-h-12 rounded-control border border-ink/25 bg-surface-bright px-[13px] py-[11px] font-normal text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/15" id="delete-confirm-email" type="email" placeholder={email} autoComplete="off" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} /></label>
        <div className="mt-[21px] flex flex-wrap justify-end gap-[9px]"><button className="min-h-[43px] rounded-control border border-ink/25 px-3.5 py-2.5 text-[0.72rem] font-bold text-ink-muted hover:bg-surface-muted" type="button" onClick={() => { setConfirmEmail(""); onClose(); }}>Batalkan</button><button className="min-h-[43px] rounded-control border border-danger/50 bg-danger/[0.08] px-3.5 py-2.5 text-[0.72rem] font-bold text-[#963E38] disabled:cursor-not-allowed disabled:border-danger/25 disabled:bg-danger/[0.05] disabled:text-[#963E38]/40" type="button" disabled={!canDelete} onClick={() => { setConfirmEmail(""); onClose(); onConfirm(); }}>Hapus akun</button></div>
      </div>
    </div>
  );
}

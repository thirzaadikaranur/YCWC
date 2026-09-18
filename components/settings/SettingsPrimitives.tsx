export function PanelHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-[25px] max-w-[540px]">
      <h2 className="mb-[9px] font-display text-[clamp(1.85rem,4vw,2.55rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-ink">
        {title}
      </h2>
      <p className="m-0 max-w-[48ch] text-[0.78rem] leading-[1.6] text-ink-muted">{description}</p>
    </header>
  );
}

export function SettingCopy({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-w-0">
      <h3 className="m-0 text-[0.82rem] font-bold leading-[1.35]">{title}</h3>
      <p className="mt-[7px] max-w-[43ch] text-[0.71rem] leading-[1.55] text-ink-muted">{description}</p>
    </div>
  );
}

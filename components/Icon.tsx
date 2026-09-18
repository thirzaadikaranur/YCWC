import type { SVGProps } from "react";

export type IconName =
  | "alert"
  | "arrow-left"
  | "check"
  | "chevron-down"
  | "file"
  | "menu"
  | "panel"
  | "plus"
  | "refresh"
  | "search"
  | "send"
  | "settings"
  | "spark"
  | "upload"
  | "x";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {name === "menu" && <path d="M4 7h16M4 12h16M4 17h16" {...shared} />}
      {name === "plus" && <path d="M12 5v14M5 12h14" {...shared} />}
      {name === "search" && (
        <>
          <circle cx="10.8" cy="10.8" r="6.3" {...shared} />
          <path d="m16 16 4.4 4.4" {...shared} />
        </>
      )}
      {name === "settings" && (
        <>
          <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
            {...shared}
          />
          <circle cx="12" cy="12" r="3" {...shared} />
        </>
      )}
      {name === "panel" && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="1.8" {...shared} />
          <path d="M14.5 4.5v15M17.5 8.5v7" {...shared} />
        </>
      )}
      {name === "spark" && (
        <>
          <path
            d="M12 2c.66 6.42 3.48 9.24 9.9 9.9-6.42.66-9.24 3.48-9.9 9.9-.66-6.42-3.48-9.24-9.9-9.9C8.52 11.24 11.34 8.42 12 2Z"
            fill="currentColor"
            stroke="none"
          />
          <circle cx="20" cy="4" r="1.2" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "send" && (
        <>
          <path d="m4.5 19.5 15-7.5-15-7.5 2.4 7.5-2.4 7.5Z" {...shared} />
          <path d="M6.9 12h10.7" {...shared} />
        </>
      )}
      {name === "file" && (
        <>
          <path d="M6.5 3.5h7l4 4v13h-11v-17Z" {...shared} />
          <path d="M13.5 3.5v4h4M9 12h6M9 15.5h6" {...shared} />
        </>
      )}
      {name === "check" && <path d="m5.5 12.5 4.2 4.2L18.8 7.8" {...shared} strokeWidth={2.2} />}
      {name === "alert" && (
        <>
          <circle cx="12" cy="12" r="8.5" {...shared} />
          <path d="M12 8v4.7M12 16h.01" {...shared} strokeWidth={2.2} />
        </>
      )}
      {name === "x" && <path d="m6 6 12 12M18 6 6 18" {...shared} />}
      {name === "arrow-left" && <path d="M19 12H5M11 6l-6 6 6 6" {...shared} />}
      {name === "chevron-down" && <path d="m6 9 6 6 6-6" {...shared} />}
      {name === "refresh" && (
        <>
          <path d="M20 11a8 8 0 0 0-14.6-4.4L4 8" {...shared} />
          <path d="M4 4v4h4M4 13a8 8 0 0 0 14.6 4.4L20 16" {...shared} />
          <path d="M20 20v-4h-4" {...shared} />
        </>
      )}
      {name === "upload" && (
        <>
          <path d="M12 15V4M8 8l4-4 4 4M5 14v5h14v-5" {...shared} />
        </>
      )}
    </svg>
  );
}

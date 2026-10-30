import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  about: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
  projects: <path d="M3 7V5h6l2 2h10v12H3V7Zm0 3h18" />,
  experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V4h8v3M3 12h18m-11 0v3h4v-3" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  guestbook: <><path d="M4 3h15v18H4V3Zm4 0v18m3-13h5m-5 4h5m-5 4h3" /></>,
  chess: <><path d="M8 20h10l-1-4H9l-1 4Zm1-4c0-4 6-4 3-7l-4 2-3-2 5-6 5 2c4 3 4 7 2 11M10 3V1" /><path d="M12 7h.01" /></>,
  help: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 15h10" /></>,
  desktop: <><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M12 17v4m-4 0h8" /></>,
  github: <path d="M9 20v-3c-4 1-4-2-6-2m12 5v-3c0-1-.3-1.7-1-2 3-.3 5-1.5 5-5 0-1.3-.5-2.3-1.3-3.1.2-.8.2-1.9-.2-2.9-1.2 0-2.3.7-3 1.2a11 11 0 0 0-5 0C8.8 4.7 7.7 4 6.5 4c-.4 1-.4 2.1-.2 2.9C5.5 7.7 5 8.7 5 10c0 3.5 2 4.7 5 5-.7.3-1 1-1 2" />,
};

export function DesktopIcon({ name }: { name: string }) {
  return <svg className="desktop-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

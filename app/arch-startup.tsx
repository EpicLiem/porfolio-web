"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SESSION_KEY = "portfolio-v2:booted-hyprland";
// Start offsets and durations model overlapping jobs in a simulated boot.
const services = [
  [170, 190, "Journal Service", "Started"],
  [190, 70, "Load Kernel Modules", "Finished"],
  [210, 120, "Remount Root and Kernel File Systems", "Finished"],
  [230, 290, "Coldplug All udev Devices", "Finished"],
  [280, 60, "Apply Kernel Variables", "Finished"],
  [290, 100, "Load/Save Screen Backlight Brightness", "Finished"],
  [310, 130, "Set Up Additional Binary Formats", "Finished"],
  [340, 100, "Create Static Device Nodes in /dev", "Finished"],
  [370, 210, "Flush Journal to Persistent Storage", "Finished"],
  [450, 120, "Rule-based Manager for Device Events and Files", "Started"],
  [590, 80, "Create Volatile Files and Directories", "Finished"],
  [610, 130, "Load/Save OS Random Seed", "Finished"],
  [620, 90, "Rebuild Dynamic Linker Cache", "Finished"],
  [640, 100, "Update Journal Catalog", "Finished"],
  [680, 80, "Record System Boot/Shutdown in UTMP", "Finished"],
  [820, 170, "D-Bus System Message Bus", "Started"],
  [840, 760, "Network Manager", "Started"],
  [860, 240, "User Login Management", "Started"],
  [880, 100, "Save/Restore Sound Card State", "Finished"],
  [900, 390, "Bluetooth service", "Started"],
  [920, 130, "Disk Manager", "Started"],
  [940, 330, "Authorization Manager", "Started"],
  [960, 650, "Network Time Synchronization", "Started"],
  [980, 220, "Power Profiles daemon", "Started"],
  [1010, 410, "CUPS Scheduler", "Started"],
  [1040, 150, "Wireless Authentication Service", "Started"],
  [1080, 290, "Avahi mDNS/DNS-SD Stack", "Started"],
  [1130, 540, "Modem Manager", "Started"],
  [1200, 180, "Manage, Install and Generate Color Profiles", "Started"],
  [1280, 300, "Daemon for power management", "Started"],
  [1300, 190, "Getty on tty1", "Started"],
  [1320, 220, "Greeter daemon", "Started"],
  [1550, 50, "User Runtime Directory /run/user/1000", "Finished"],
  [1600, 90, "User Manager for UID 1000", "Started"],
  [1700, 60, "D-Bus User Message Bus", "Started"],
  [1705, 85, "PipeWire Multimedia Service", "Started"],
  [1710, 70, "Prepare Wayland Session Environment", "Finished"],
  [1790, 100, "Multimedia Service Session Manager (WirePlumber)", "Started"],
  [1800, 120, "PipeWire PulseAudio", "Started"],
  [1785, 170, "Hyprland Wayland Compositor", "Started"],
  [1960, 45, "Hyprland Polkit Authentication Agent", "Started"],
  [1965, 110, "Portal service (Hyprland implementation)", "Started"],
  [1970, 85, "Portal service (GTK/GNOME implementation)", "Started"],
  [1980, 55, "Hyprland Idle Daemon", "Started"],
  [1990, 105, "Hyprland Wallpaper Daemon", "Started"],
  [2000, 65, "Dunst Notification Daemon", "Started"],
  [2010, 130, "Waybar", "Started"],
  [2020, 50, "Secret Service (GNOME Keyring)", "Started"],
  [2080, 110, "Portal service", "Started"],
] as const;

const bootLines: [number, string, string][] = [
  [0, "", ":: running early hook [udev]"],
  [30, "", ":: running hook [udev]"],
  [60, "", ":: Triggering uevents..."],
  [100, "", ":: running hook [filesystems]"],
  [130, "", ":: Mounting '/dev/nvme0n1p2' on real root"],
  [150, "", "Welcome to Arch Linux!"],
  [590, "ok", "Reached target Local File Systems."],
  [780, "ok", "Reached target System Initialization."],
  [790, "ok", "Reached target Sockets."],
  [800, "ok", "Reached target Basic System."],
  [1620, "ok", "Reached target Network."],
  [1700, "ok", "Reached target Multi-User System."],
  [1701, "ok", "Reached target Graphical Interface."],
  [1695, "ok", "Reached target Basic User System."],
  [1782, "ok", "Reached target Preparation for Graphical Session."],
  [1958, "ok", "Reached target Graphical Session."],
  [2230, "ok", "Reached target XDG Autostart Applications."],
  ...services.flatMap(([start, duration, name, completion]): [number, string, string][] => [
    [start, "", `         Starting ${name}...`],
    [start + duration, "ok", `${completion} ${name}.`],
  ]),
];
bootLines.sort((a, b) => a[0] - b[0]);
const BLACKOUT_START = bootLines[bootLines.length - 1][0] + 650;
const BOOT_DURATION = BLACKOUT_START + 600;

export default function ArchStartup({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const skipRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  function finish() {
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The intro still finishes when browser storage is disabled.
    }
    setVisible(false);
  }

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const handheld = matchMedia("(max-width: 767px), (max-width: 1000px) and (max-height: 500px)");
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {}

    const skipIntro = seen || motion.matches || handheld.matches;
    const timer = window.setTimeout(finish, skipIntro ? 0 : BOOT_DURATION);
    const frames = !skipIntro
      ? [...new Set([...bootLines.map(([time]) => time), BLACKOUT_START])]
          .map((time) => window.setTimeout(() => setElapsed(time), time))
      : [];
    if (!skipIntro) skipRef.current?.focus({ preventScroll: true });
    const onMotionChange = () => {
      if (motion.matches || handheld.matches) finish();
    };
    motion.addEventListener("change", onMotionChange);
    handheld.addEventListener("change", onMotionChange);
    return () => {
      window.clearTimeout(timer);
      frames.forEach(window.clearTimeout);
      motion.removeEventListener("change", onMotionChange);
      handheld.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = visible;
    if (!visible && document.activeElement === document.body) {
      contentRef.current?.focus({ preventScroll: true });
    }
  }, [visible]);

  return (
    <>
      {visible && (
        <section
          tabIndex={-1}
          className={`arch-startup${elapsed >= BLACKOUT_START ? " boot-blackout" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Arch-inspired startup animation"
          onKeyDown={(event) => {
            if (event.key === "Escape") finish();
            if (event.key === "Tab") {
              event.preventDefault();
              skipRef.current?.focus();
            }
          }}
        >
          <div className="boot-console" aria-hidden="true">
            <div className="boot-output">
              {bootLines.filter(([time]) => time <= elapsed).map(([time, status, text], index) => (
                <div className="boot-line" key={`${time}-${index}`}>
                  {status === "ok" && <span className="boot-status">[<span>  OK  </span>] </span>}{text}
                </div>
              ))}
              <div className="boot-line"><span className="boot-cursor" /></div>
            </div>
          </div>
          <button className="boot-skip" ref={skipRef} onClick={finish}>Skip boot <span aria-hidden="true">[Esc]</span></button>
        </section>
      )}
      <noscript><style>{".arch-startup { display: none; }"}</style></noscript>
      <div ref={contentRef} tabIndex={-1} className="site-content">
        {children}
      </div>
    </>
  );
}

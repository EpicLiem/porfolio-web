export type DesktopPalette = {
  id: string;
  name: string;
  reference: string;
  colors: Record<"canvas" | "surface" | "frame" | "inset" | "ink" | "muted" | "accent" | "selection" | "link", string>;
};

export const palettes: DesktopPalette[] = [
  { id: "roast", name: "Roast & indigo", reference: "Wada 182", colors: { canvas: "#19181C", surface: "#282027", frame: "#88766C", inset: "#121115", ink: "#F5E9DC", muted: "#C5AEA0", accent: "#E9A46C", selection: "#553B30", link: "#EEB78C" } },
  { id: "copper", name: "Copper & teal", reference: "Wada 058", colors: { canvas: "#211719", surface: "#302023", frame: "#8C7775", inset: "#160F11", ink: "#F5E9DF", muted: "#CBB1AA", accent: "#62D1C7", selection: "#164E4B", link: "#7ADBD2" } },
  { id: "olive", name: "Olive & brass", reference: "Wada 066", colors: { canvas: "#1B1D13", surface: "#292B1C", frame: "#85866C", inset: "#11130C", ink: "#F2EED8", muted: "#C1C2A4", accent: "#E1BF50", selection: "#484519", link: "#E7CB75" } },
  { id: "charcoal", name: "Charcoal & steel", reference: "Wada 069", colors: { canvas: "#161618", surface: "#252528", frame: "#808086", inset: "#0D0D0F", ink: "#F2F0ED", muted: "#BEBDC4", accent: "#D0CFD5", selection: "#44434B", link: "#DAD8E2" } },
  { id: "violet", name: "Violet & oat", reference: "Wada 083", colors: { canvas: "#1D192D", surface: "#2B263E", frame: "#89819E", inset: "#13101F", ink: "#F1EDDF", muted: "#BDB5CE", accent: "#C8C99E", selection: "#45432F", link: "#D9DAB1" } },
  { id: "berry", name: "Berry & lavender", reference: "Wada 174", colors: { canvas: "#261923", surface: "#372430", frame: "#957C92", inset: "#190F17", ink: "#F8EAF0", muted: "#D0B7C9", accent: "#E5B2CD", selection: "#58354C", link: "#D7C0EC" } },
  { id: "porcelain", name: "Porcelain & cocoa", reference: "Wada 113", colors: { canvas: "#F3E7E1", surface: "#FCF5F0", frame: "#8D766B", inset: "#E6D6CC", ink: "#38261E", muted: "#70564A", accent: "#70432E", selection: "#DCC4B4", link: "#714329" } },
  { id: "pistachio", name: "Pistachio & terracotta", reference: "Wada 137", colors: { canvas: "#F5E8D3", surface: "#FFF7E9", frame: "#8A7359", inset: "#E8D6B9", ink: "#342A20", muted: "#6D5943", accent: "#A13625", selection: "#CCDDD0", link: "#285C50" } },
];

export const wallpapers = [
  { id: "coffee-line", name: "Coffee Line Drawing", src: "/desktop/wallpapers/coffee-line.jpg" },
  { id: "coffee-shop", name: "Corner Coffee", src: "/desktop/wallpapers/coffee-shop.webp" },
  { id: "pistachio-tea", name: "Pistachio Break", src: "/desktop/wallpapers/pistachio-tea.webp" },
  { id: "beach-path", name: "Coastal Greenway", src: "/desktop/wallpapers/beach-path.webp" },
  { id: "mountain-range", name: "Rose Mountain Dusk", src: "/desktop/wallpapers/mountain-range.webp" },
  { id: "pine", name: "Quiet Pine", src: "/desktop/wallpapers/pine.webp" },
  { id: "sakura-gate", name: "Sakura Gate", src: "/desktop/wallpapers/sakura-gate.webp" },
  { id: "temple", name: "Temple Morning", src: "/desktop/wallpapers/temple.webp" },
  { id: "rainy-window", name: "Rain at Closing Time", src: "/desktop/wallpapers/rainy-window.webp" },
  { id: "serenity", name: "Lantern River", src: "/desktop/wallpapers/serenity.webp" },
  { id: "snowy-train", name: "Winter Railway", src: "/desktop/wallpapers/snowy-train.webp" },
];

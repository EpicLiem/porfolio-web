import ArchStartup from "./arch-startup";
import Desktop from "./desktop/desktop";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { contact } from "@/lib/portfolio";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: "Liem Luttrell", description: site.description, author: { "@id": `${site.url}/#person` } },
    { "@type": "Person", "@id": `${site.url}/#person`, name: "Liem Luttrell", url: site.url, sameAs: [contact.github, contact.linkedin, contact.devpost] },
  ],
};

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><ArchStartup><Desktop /></ArchStartup></>;
}

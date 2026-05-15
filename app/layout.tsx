import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReviewBoost — Bewertungsmanagement für Restaurants & Gastronomie",
  description: "Automatisiertes Bewertungsmanagement für Restaurants: KI-Antworten, QR-Codes, Konkurrenz-Radar, Lieferplattform-Tracking. DSGVO-konform. Ersten Monat gratis.",
  keywords: ["Bewertungsmanagement", "Restaurant", "Google Bewertungen", "Gastronomie", "KI Antworten", "Review Management", "Lieferando", "Uber Eats", "Foodora", "Wolt"],
  authors: [{ name: "ReviewBoost" }],
  openGraph: {
    title: "ReviewBoost — Mehr Sterne. Mehr Gäste. Weniger Aufwand.",
    description: "Automatisiertes Bewertungsmanagement für Restaurants & lokale Betriebe. Ersten Monat gratis.",
    url: "https://reviewboost-lyart.vercel.app",
    siteName: "ReviewBoost",
    locale: "de_AT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewBoost — Bewertungsmanagement für Restaurants",
    description: "KI-Antworten, Konkurrenz-Radar, Lieferplattform-Tracking. Ersten Monat gratis.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#f8fafc",
        }}
      >
        {children}
      </body>
    </html>
  );
}

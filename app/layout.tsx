import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReviewBoost — Mehr echte Bewertungen für dein Business",
  description: "Sammle, verwalte und analysiere Kundenbewertungen automatisch. Steigere dein Ranking auf Google, Tripadvisor & Co.",
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

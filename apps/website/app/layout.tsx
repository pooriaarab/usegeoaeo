import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Audit any site for search engines and AI answer engines. Score it 0 to 100, then generate llms.txt, sitemap, robots, JSON-LD, WebMCP, and Markdown mirrors. Free and open source (MIT).";

export const metadata: Metadata = {
  metadataBase: new URL("https://usegeoaeo.com"),
  title: {
    default: "geoaeo | SEO, GEO, and AEO for any site",
    template: "%s | geoaeo",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://usegeoaeo.com",
    siteName: "geoaeo",
    title: "geoaeo | SEO, GEO, and AEO for any site",
    description,
  },
  twitter: { card: "summary_large_image", title: "geoaeo", description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://usegeoaeo.com/#org",
      name: "geoaeo",
      url: "https://usegeoaeo.com",
    },
    {
      "@type": "WebSite",
      "@id": "https://usegeoaeo.com/#site",
      url: "https://usegeoaeo.com",
      name: "geoaeo",
      description,
      publisher: { "@id": "https://usegeoaeo.com/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://usegeoaeo.com/tools?url={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "geoaeo",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Node.js",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

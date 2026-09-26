import type { Metadata } from "next";
import { Archivo, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Swiss brand: Archivo does headings and body; Roboto Mono does the small
// caps labels. They load into the existing --font-geist-sans /
// --font-geist-mono variable names that @theme points --font-sans at.
const geistSans = Archivo({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// 150 characters. The previous one ran to 186 and Google cut it mid-list.
const description =
  "Audit any site for search and AI answer engines, score it 0 to 100, then generate llms.txt, sitemap, robots, JSON-LD, WebMCP, and Markdown mirrors.";

export const metadata: Metadata = {
  metadataBase: new URL("https://usegeoaeo.com"),
  title: {
    default: "geoaeo | SEO, GEO, and AEO for any site",
    template: "%s | geoaeo",
  },
  description,
  authors: [{ name: "Pooria Arab", url: "https://github.com/pooriaarab" }],
  creator: "Pooria Arab",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://usegeoaeo.com",
    siteName: "geoaeo",
    title: "geoaeo | SEO, GEO, and AEO for any site",
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "geoaeo — audit any site for search and AI answer engines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "geoaeo",
    description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
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
      datePublished: "2026-08-12",
      publisher: { "@id": "https://usegeoaeo.com/#org" },
      author: { "@id": "https://usegeoaeo.com/#org" },
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
      offers: {
        "@type": "Offer",
        name: "geoaeo open source",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.npmjs.com/package/geoaeo",
        description:
          "Free and open-source under the MIT license. Install with npm i geoaeo. Hosted tools at https://usegeoaeo.com/tools are free. No paid tier.",
      },
      description,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
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

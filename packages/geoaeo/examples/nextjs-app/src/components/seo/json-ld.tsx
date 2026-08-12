import { generateJsonLd, type JsonLdKind } from 'geoaeo';
import { siteConfig } from '../../geoaeo.config';

function JsonLd({ kind }: { kind: JsonLdKind }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateJsonLd(siteConfig, kind)),
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return <JsonLd kind="software" />;
}

export function ProductJsonLd() {
  return <JsonLd kind="product" />;
}

export function FaqJsonLd() {
  return <JsonLd kind="faq" />;
}
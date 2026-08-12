import { generateWebmcp } from 'geoaeo';
import { siteConfig } from '../../geoaeo.config';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
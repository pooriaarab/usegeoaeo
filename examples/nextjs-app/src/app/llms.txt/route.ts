import { generateLlms } from 'geoaeo';
import { siteConfig } from '../../geoaeo.config';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
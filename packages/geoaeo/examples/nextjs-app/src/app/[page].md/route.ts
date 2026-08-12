import { generateLlmsFull } from 'geoaeo';
import { siteConfig } from '../../geoaeo.config';

export const dynamic = 'force-static';

export async function GET(
  _request: Request,
  context: { params: Promise<{ page: string }> },
) {
  const { page } = await context.params;
  const body = `# ${page}

${siteConfig.description}

Read more: ${siteConfig.siteUrl}/${page}

${generateLlmsFull(siteConfig)}
`;
  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
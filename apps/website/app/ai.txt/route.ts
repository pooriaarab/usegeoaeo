import { generateAiTxt } from "geoaeo/ai-txt";
import siteConfig from "../../geoaeo.config";

export const dynamic = "force-static";

export function GET() {
  return new Response(generateAiTxt(siteConfig), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

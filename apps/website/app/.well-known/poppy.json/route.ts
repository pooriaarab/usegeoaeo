import { generatePoppy } from "geoaeo/poppy";
import { NextResponse } from "next/server";

import siteConfig from "../../../geoaeo.config";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(generatePoppy(siteConfig));
}

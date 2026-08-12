import type { EmailJobPayload } from "@template/shared";

import {
  renderBillingReceipt,
  renderPasswordReset,
  renderWelcome,
} from "./templates";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Render an email job payload to transport-ready subject/html/text.
 * Pure — no Cloudflare binding, no API keys.
 */
export function renderEmail(payload: EmailJobPayload): RenderedEmail {
  switch (payload.template) {
    case "welcome":
      return renderWelcome(payload.props);
    case "password_reset":
      return renderPasswordReset(payload.props);
    case "billing_receipt":
      return renderBillingReceipt(payload.props);
    default: {
      const _exhaustive: never = payload;
      throw new Error(`Unknown email template: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

/** @deprecated alias — prefer renderEmail */
export async function renderEmailHtml(payload: EmailJobPayload): Promise<RenderedEmail> {
  return renderEmail(payload);
}

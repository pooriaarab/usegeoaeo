/**
 * Cloudflare Email Service sender helpers.
 *
 * Wrangler binding:
 *   "send_email": [{ "name": "EMAIL" }]
 *
 * Production requires the from-domain onboarded:
 *   wrangler email sending enable yourdomain.com
 *
 * Docs: https://developers.cloudflare.com/email-service/
 */

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailMessage {
  to: string | string[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/** Minimal shape of the Workers Email Sending binding. */
export interface SendEmailBinding {
  send(message: SendEmailMessage): Promise<{ messageId?: string } | void>;
}

export function normalizeFrom(
  from: string | EmailAddress,
  fallbackEmail: string,
  fallbackName?: string,
): EmailAddress {
  if (typeof from === "string") {
    return { email: from || fallbackEmail, name: fallbackName };
  }
  return {
    email: from.email || fallbackEmail,
    name: from.name ?? fallbackName,
  };
}

/**
 * Send via Cloudflare Email Service binding.
 * When binding is missing (local unit tests), logs and no-ops if allowMock.
 */
export async function sendViaCloudflareEmail(
  email: SendEmailBinding | undefined,
  message: SendEmailMessage,
  opts?: { allowMock?: boolean; log?: (info: unknown) => void },
): Promise<{ mock: boolean; messageId?: string }> {
  const log = opts?.log ?? console.log;
  if (!email) {
    if (opts?.allowMock) {
      log({ level: "warn", msg: "EMAIL binding missing; mock send", message });
      return { mock: true };
    }
    throw new Error("Cloudflare EMAIL (send_email) binding is not configured");
  }

  const result = await email.send(message);
  return {
    mock: false,
    messageId: result && typeof result === "object" ? result.messageId : undefined,
  };
}

import type {
  EmailBillingReceiptProps,
  EmailPasswordResetProps,
  EmailWelcomeProps,
} from "@template/shared";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;")
    .replaceAll("'", "&#39;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.5;color:#151515;background:#fbf8ef;padding:24px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #151515;border-radius:12px;padding:24px">
      <tr><td>
        <h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(title)}</h1>
        ${bodyHtml}
        <p style="margin:24px 0 0;font-size:12px;color:#68645d">Sent by your Cloudflare-native app template.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function welcomeSubject(props: EmailWelcomeProps): string {
  return `Welcome to ${props.workspaceName}`;
}

export function renderWelcome(props: EmailWelcomeProps): { subject: string; html: string; text: string } {
  const name = props.ownerName?.trim() || "there";
  const subject = welcomeSubject(props);
  const text = `Hi ${name},\n\nYour workspace "${props.workspaceName}" is ready.\n\n— Team`;
  const html = layout(
    "You're in",
    `<p>Hi ${escapeHtml(name)},</p>
     <p>Your workspace <strong>${escapeHtml(props.workspaceName)}</strong> is ready on Cloudflare.</p>
     <p>If you have questions, reply to this email any time.</p>`,
  );
  return { subject, html, text };
}

export function passwordResetSubject(_props: EmailPasswordResetProps): string {
  return "Reset your password";
}

export function renderPasswordReset(
  props: EmailPasswordResetProps,
): { subject: string; html: string; text: string } {
  const subject = passwordResetSubject(props);
  const text = `Reset your password:\n${props.resetUrl}\n\nIf you did not request this, ignore this email.`;
  const html = layout(
    "Reset your password",
    `<p>Click the button below to choose a new password. This link expires soon.</p>
     <p><a href="${escapeHtml(props.resetUrl)}" style="display:inline-block;background:#151515;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Reset password</a></p>
     <p style="font-size:13px;color:#68645d">Or paste this URL:<br>${escapeHtml(props.resetUrl)}</p>
     <p>If you did not request a reset, your password will stay the same.</p>`,
  );
  return { subject, html, text };
}

export function billingReceiptSubject(props: EmailBillingReceiptProps): string {
  return `Receipt for ${props.workspaceName}`;
}

export function renderBillingReceipt(
  props: EmailBillingReceiptProps,
): { subject: string; html: string; text: string } {
  const amount = (props.amountCents / 100).toFixed(2);
  const subject = billingReceiptSubject(props);
  const text = `Payment received for ${props.workspaceName}: $${amount}. Invoice: ${props.invoiceUrl}`;
  const html = layout(
    "Payment received",
    `<p>Thanks for your payment for <strong>${escapeHtml(props.workspaceName)}</strong>.</p>
     <p style="font-size:28px;font-weight:800;margin:16px 0">$${escapeHtml(amount)}</p>
     <p><a href="${escapeHtml(props.invoiceUrl)}">View invoice</a></p>`,
  );
  return { subject, html, text };
}

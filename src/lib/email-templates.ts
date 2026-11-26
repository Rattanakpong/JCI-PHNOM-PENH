// Table-based layout + inline styles throughout — email clients (especially
// Outlook desktop) don't reliably support flexbox/grid or external/`<style>`
// CSS, so this intentionally doesn't follow the app's usual Tailwind
// conventions. Brand colors are copied from tailwind.config.ts since email
// HTML can't reference it.
const BRAND = {
  blue: "#0088CE",
  navy: "#0B132B",
  teal: "#4ECDC4",
  gold: "#F4C430",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
};

export function setupPasswordEmailHtml({
  name,
  url,
  isNewAccount,
}: {
  name: string;
  url: string;
  isNewAccount: boolean;
}): string {
  const heading = isNewAccount ? "Welcome to the Admin Dashboard" : "Reset Your Password";
  const intro = isNewAccount
    ? "An admin account was created for you on the JCI Phnom Penh dashboard. Choose a password to get started."
    : "A password reset was requested for your JCI Phnom Penh admin account.";
  const buttonLabel = isNewAccount ? "Set Your Password" : "Reset Your Password";

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.background};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <!-- Accent bar -->
            <tr>
              <td style="height:4px;line-height:4px;font-size:0;background-color:${BRAND.blue};background-image:linear-gradient(90deg, ${BRAND.blue}, ${BRAND.teal}, ${BRAND.gold});">&nbsp;</td>
            </tr>
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:32px 32px 8px;">
                <img src="cid:jci-logo" width="140" alt="JCI Phnom Penh" style="display:block;max-width:140px;height:auto;" />
              </td>
            </tr>
            <!-- Heading + body -->
            <tr>
              <td style="padding:16px 40px 8px;">
                <h1 style="margin:0;font-size:20px;line-height:1.3;color:${BRAND.navy};text-align:center;font-family:Arial,Helvetica,sans-serif;">
                  ${heading}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.navy};">Hi ${name},</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.navy};opacity:0.75;">${intro}</p>
              </td>
            </tr>
            <!-- CTA button -->
            <tr>
              <td align="center" style="padding:28px 40px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:999px;background-color:${BRAND.blue};">
                      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;font-family:Arial,Helvetica,sans-serif;">
                        ${buttonLabel}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Fallback link -->
            <tr>
              <td style="padding:8px 40px 0;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.navy};opacity:0.5;text-align:center;">
                  Or copy this link into your browser:<br />
                  <a href="${url}" target="_blank" style="color:${BRAND.blue};word-break:break-all;">${url}</a>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:28px 40px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.navy};opacity:0.5;text-align:center;">
                  This link expires in 7 days and can only be used once.<br />
                  If you didn't expect this email, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:${BRAND.navy};opacity:0.4;">JCI Phnom Penh &middot; Active Citizens Creating Impact</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

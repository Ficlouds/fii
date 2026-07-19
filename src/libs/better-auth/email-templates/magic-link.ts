/**
 * Magic link / OTP sign-in email template
 */
export const getMagicLinkEmailTemplate = (params: { expiresInSeconds: number; url: string }) => {
  const { url, expiresInSeconds } = params;
  const expiresInMinutes = Math.round(expiresInSeconds / 60);
  const expirationText = expiresInMinutes >= 1
    ? `${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}`
    : `${expiresInSeconds} seconds`;
  const year = new Date().getFullYear();

  return {
    subject: 'Your Fi sign-in link',
    text: `Sign in to Fi\n\nClick this link to sign in: ${url}\n\nThis link expires in ${expirationText}.\n\nIf you did not request this, you can safely ignore this email.\n\nFi`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Fi</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="font-size:22px;font-weight:700;color:#111111;margin:0 0 40px;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Fi</p>
    <p style="font-size:13px;font-weight:600;color:#111111;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Fi</p>
    <h1 style="font-size:20px;font-weight:600;color:#111111;margin:0 0 24px;line-height:1.3;">Sign-in link</h1>
    <p style="font-size:15px;color:#333333;margin:0 0 16px;line-height:1.6;">
      Click the link below to sign in to your Fi account.
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 32px;line-height:1.6;">
      <a href="${url}" style="color:#0066cc;text-decoration:none;font-weight:500;">Sign in to Fi</a>
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 8px;line-height:1.6;">
      This link expires in <strong>${expirationText}</strong> and can only be used once.
    </p>
    <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
      If you did not request this, you can safely ignore this email.
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 4px;">Thanks,</p>
    <p style="font-size:15px;color:#333333;margin:0;">The Fi team</p>
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e5e5;">
      <p style="font-size:12px;color:#888888;margin:0 0 4px;line-height:1.6;">
        Fi by Ficlouds &nbsp;|&nbsp;
        <a href="https://ficlouds.com/privacy" style="color:#888888;text-decoration:none;">Privacy Statement</a>
      </p>
      <p style="font-size:12px;color:#aaaaaa;margin:0;">
        &copy; \${${year}} Ficlouds. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
};

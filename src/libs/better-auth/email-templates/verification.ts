/**
 * Email verification template
 * Sent when user signs up to verify their email address
 */
export const getVerificationEmailTemplate = (params: {
  expiresInSeconds: number;
  url: string;
  userName?: string | null;
}) => {
  const { url, userName, expiresInSeconds } = params;
  const expiresInHours = expiresInSeconds / 3600;
  const expirationText = expiresInHours >= 1
    ? `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}`
    : `${expiresInSeconds / 60} minutes`;
  const year = new Date().getFullYear();
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  return {
    subject: 'Confirm your Fi account',
    text: `Confirm your Fi account\n\n${greeting}\n\nClick this link to verify your email address: ${url}\n\nThis link expires in ${expirationText}. If you did not create a Fi account, you can safely ignore this email.\n\nFi`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your Fi account</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <div style="max-width:580px;margin:0 auto;padding:48px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:36px;">
      <img src="https://ficlouds.com/logos/fi-logo.png" alt="Fi" style="height:32px;width:auto;display:block;">
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;padding:48px 40px;border:1px solid rgba(0,0,0,0.06);">

      <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 12px;letter-spacing:-0.4px;line-height:1.3;">
        Confirm your email address
      </h1>
      <p style="font-size:15px;color:#555555;margin:0 0 8px;line-height:1.6;">
        ${greeting}
      </p>
      <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
        To complete your Fi account setup, please confirm your email address. This link is valid for ${expirationText}.
      </p>

      <!-- Button -->
      <div style="margin:0 0 32px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.2px;">
          Confirm email address
        </a>
      </div>

      <p style="font-size:13px;color:#999999;margin:0 0 24px;line-height:1.6;">
        If you did not create a Fi account, you can safely ignore this email.
      </p>

      <!-- Divider -->
      <div style="border-top:1px solid #e5e5e5;margin:28px 0;"></div>

      <!-- Fallback -->
      <p style="font-size:12px;color:#aaaaaa;margin:0 0 6px;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="font-size:12px;color:#555555;margin:0;word-break:break-all;line-height:1.5;">
        ${url}
      </p>

    </div>

    <!-- Footer -->
    <div style="margin-top:32px;padding:0 4px;">
      <p style="font-size:12px;color:#aaaaaa;margin:0 0 4px;">
        Fi by Ficlouds
      </p>
      <p style="font-size:12px;color:#cccccc;margin:0;">
        &copy; ${year} Ficlouds. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`,
  };
};

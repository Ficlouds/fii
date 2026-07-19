/**
 * Magic link sign-in email template
 * Contains both a clickable link and a visible OTP code
 */
export const getMagicLinkEmailTemplate = (params: { expiresInSeconds: number; url: string }) => {
  const { url, expiresInSeconds } = params;
  const expiresInMinutes = Math.round(expiresInSeconds / 60);
  const expirationText = expiresInMinutes >= 1
    ? `${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}`
    : `${expiresInSeconds} seconds`;

  // Extract OTP token from magic link URL for display
  const urlObj = new URL(url);
  const token = urlObj.searchParams.get('token') || '';
  const shortCode = token.slice(0, 6).toUpperCase();

  const year = new Date().getFullYear();

  return {
    subject: 'Your sign-in link for Fi',
    text: `Sign in to Fi\n\nClick this link to sign in: ${url}\n\nOr enter this code: ${shortCode}\n\nThis link expires in ${expirationText}. If you did not request this, you can safely ignore this email.\n\nFi`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Fi</title>
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
        Your sign-in link
      </h1>
      <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
        Click the button below to sign in to Fi. This link is valid for ${expirationText} and can only be used once.
      </p>

      <!-- Button -->
      <div style="margin:0 0 36px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.2px;">
          Sign in to Fi
        </a>
      </div>

      <!-- Divider with OR -->
      <div style="display:flex;align-items:center;gap:16px;margin:0 0 32px;">
        <div style="flex:1;height:1px;background:#e5e5e5;"></div>
        <span style="font-size:12px;color:#aaaaaa;font-weight:500;">OR</span>
        <div style="flex:1;height:1px;background:#e5e5e5;"></div>
      </div>

      <!-- OTP Code -->
      <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.6;">
        Enter this code manually if the button does not work:
      </p>
      <div style="background-color:#f5f5f3;border-radius:12px;padding:24px;text-align:center;margin:0 0 32px;">
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#111111;font-family:'Courier New',Courier,monospace;">
          ${shortCode}
        </div>
        <p style="font-size:12px;color:#aaaaaa;margin:8px 0 0;">
          Expires in ${expirationText}
        </p>
      </div>

      <p style="font-size:13px;color:#999999;margin:0 0 24px;line-height:1.6;">
        If you did not request this, you can safely ignore this email. Your account remains secure.
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

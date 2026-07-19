/**
 * Password reset email template
 * Sent when user requests a password reset
 */
export const getResetPasswordEmailTemplate = (params: { url: string }) => {
  const { url } = params;
  const year = new Date().getFullYear();

  return {
    subject: 'Reset your Fi password',
    text: `Reset your password\n\nClick this link to reset your Fi password: ${url}\n\nThis link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.\n\nFi`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
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
        Reset your password
      </h1>
      <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
        We received a request to reset the password for your Fi account. Click the button below to choose a new password. This link is valid for 1 hour.
      </p>

      <!-- Button -->
      <div style="margin:0 0 32px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.2px;">
          Reset password
        </a>
      </div>

      <p style="font-size:13px;color:#999999;margin:0 0 24px;line-height:1.6;">
        If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
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

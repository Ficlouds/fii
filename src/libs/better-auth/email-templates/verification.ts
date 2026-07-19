/**
 * Email verification template
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
  const greeting = userName ? `Hi ${userName},` : 'Hi,';

  return {
    subject: 'Confirm your Fi account',
    text: `${greeting}\n\nClick this link to confirm your Fi account: ${url}\n\nThis link expires in ${expirationText}.\n\nIf you did not create a Fi account, you can safely ignore this email.\n\nThanks,\nThe Fi team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your Fi account</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <img src="https://ficlouds.com/logos/fi-logo.png" alt="Fi" style="height:28px;width:auto;display:block;margin-bottom:32px;">
    <p style="font-size:13px;font-weight:600;color:#111111;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Fi</p>
    <h1 style="font-size:20px;font-weight:600;color:#111111;margin:0 0 24px;line-height:1.3;">Confirm your account</h1>
    <p style="font-size:15px;color:#333333;margin:0 0 16px;line-height:1.6;">
      ${greeting}
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 16px;line-height:1.6;">
      Thank you for creating a Fi account. Please confirm your email address by clicking the link below.
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 32px;line-height:1.6;">
      <a href="${url}" style="color:#0066cc;text-decoration:none;font-weight:500;">Confirm email address</a>
    </p>
    <p style="font-size:15px;color:#555555;margin:0 0 8px;line-height:1.6;">
      This link expires in <strong>${expirationText}</strong>.
    </p>
    <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
      If you did not create a Fi account, you can safely ignore this email.
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

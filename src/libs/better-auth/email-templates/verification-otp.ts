/**
 * Email OTP verification template
 */
export const getVerificationOTPEmailTemplate = (params: {
  expiresInSeconds: number;
  otp: string;
  userName?: string | null;
}) => {
  const { otp, userName, expiresInSeconds } = params;
  const expiresInMinutes = Math.round(expiresInSeconds / 60);
  const expirationText = expiresInMinutes >= 1
    ? `${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}`
    : `${expiresInSeconds} seconds`;
  const year = new Date().getFullYear();
  const greeting = userName ? `Hi ${userName},` : 'Hi,';

  return {
    subject: 'Your Fi verification code',
    text: `${greeting}\n\nYour Fi verification code is: ${otp}\n\nThis code expires in ${expirationText}.\n\nDo not share this code with anyone.\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Fi team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Fi verification code</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <img src="https://ficlouds.com/logos/fi-logo.png" alt="Fi" style="height:28px;width:auto;display:block;margin-bottom:32px;">
    <p style="font-size:13px;font-weight:600;color:#111111;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Fi</p>
    <h1 style="font-size:20px;font-weight:600;color:#111111;margin:0 0 24px;line-height:1.3;">Verification code</h1>
    <p style="font-size:15px;color:#333333;margin:0 0 16px;line-height:1.6;">
      ${greeting}
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 8px;line-height:1.6;">
      Please use this code to verify your Fi account.
    </p>
    <p style="font-size:15px;color:#333333;margin:0 0 32px;line-height:1.6;">
      Here is your code: <strong style="font-size:20px;letter-spacing:4px;color:#111111;">${otp}</strong>
    </p>
    <p style="font-size:15px;color:#555555;margin:0 0 8px;line-height:1.6;">
      This code expires in <strong>${expirationText}</strong>. Do not share this code with anyone.
    </p>
    <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
      If you did not request this code, you can safely ignore this email.
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

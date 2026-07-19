/**
 * Email OTP verification template
 * Sent when user needs to verify their email using a one-time code
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
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  return {
    subject: 'Your Fi verification code',
    text: `Your Fi verification code\n\n${greeting}\n\nYour verification code is: ${otp}\n\nThis code expires in ${expirationText}. Do not share this code with anyone.\n\nIf you did not request this code, you can safely ignore this email.\n\nFi`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Fi verification code</title>
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
        Your verification code
      </h1>
      <p style="font-size:15px;color:#555555;margin:0 0 8px;line-height:1.6;">
        ${greeting}
      </p>
      <p style="font-size:15px;color:#555555;margin:0 0 32px;line-height:1.6;">
        Use the code below to verify your email address. This code expires in ${expirationText}.
      </p>

      <!-- OTP Code -->
      <div style="background-color:#f5f5f3;border-radius:12px;padding:32px;text-align:center;margin:0 0 32px;">
        <div style="font-size:40px;font-weight:700;letter-spacing:10px;color:#111111;font-family:'Courier New',Courier,monospace;">
          ${otp}
        </div>
      </div>

      <p style="font-size:13px;color:#999999;margin:0 0 8px;line-height:1.6;">
        Do not share this code with anyone. Fi will never ask for your verification code.
      </p>
      <p style="font-size:13px;color:#999999;margin:0 0 24px;line-height:1.6;">
        If you did not request this code, you can safely ignore this email.
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

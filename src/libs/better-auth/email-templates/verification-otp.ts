/**
 * Email OTP verification template
 * Clean, no colors, no boxes — logo, code, fine print only
 */
export const getVerificationOTPEmailTemplate = (params: {
  expiresInSeconds: number;
  otp: string;
  userName?: string | null;
}) => {
  const { otp, userName, expiresInSeconds } = params;
  const expiresInMinutes = Math.round(expiresInSeconds / 60);
  const year = new Date().getFullYear();
  const greeting = userName ? `Hi ${userName},` : 'Hi,';

  return {
    subject: 'Your Fi verification code',
    text: `${greeting}\n\nYour Fi verification code is: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes. Do not share this code with anyone.\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Fi team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Fi verification code</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <div style="max-width:520px;margin:0 auto;padding:48px 32px;">

    <!-- Logo -->
    <div style="margin-bottom:40px;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;"><tr><td style="font-size:20px;font-weight:700;color:#111111;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,serif;">Fi</td></tr></table>
    </div>

    <!-- Heading -->
    <h1 style="font-size:20px;font-weight:600;color:#111111;margin:0 0 16px;line-height:1.4;">
      Fi account verification
    </h1>

    <!-- Greeting and body -->
    <p style="font-size:15px;color:#333333;margin:0 0 6px;line-height:1.7;">${greeting}</p>
    <p style="font-size:15px;color:#333333;margin:0 0 28px;line-height:1.7;">
      Please use this code to verify your Fi account.
    </p>

    <!-- OTP -->
    <p style="font-size:14px;color:#555555;margin:0 0 8px;">Here is your code:</p>
    <p style="font-size:34px;font-weight:700;color:#111111;margin:0 0 28px;letter-spacing:6px;font-family:'Courier New',Courier,monospace;">${otp}</p>

    <!-- Body -->
    <p style="font-size:15px;color:#333333;margin:0 0 28px;line-height:1.7;">
      This code expires in <strong>${expiresInMinutes} minutes</strong> and can only be used once.
    </p>

    <p style="font-size:15px;color:#333333;margin:0 0 4px;">Thanks,</p>
    <p style="font-size:15px;color:#333333;margin:0 0 40px;">The Fi team</p>

    <!-- Divider -->
    <div style="border-top:1px solid #e5e5e5;margin-bottom:24px;"></div>

    <!-- Fine print -->
    <p style="font-size:12px;color:#888888;margin:0 0 6px;line-height:1.7;">
      Do not share this code with anyone. Fi will never ask for your verification code.
    </p>
    <p style="font-size:12px;color:#888888;margin:0 0 6px;line-height:1.7;">
      If you did not request this code, you can safely ignore this email. Your account has not been affected.
    </p>
    <p style="font-size:12px;color:#aaaaaa;margin:0 0 6px;line-height:1.7;">
      &copy; ${year} Ficlouds &nbsp;&middot;&nbsp;
      <a href="https://ficlouds.com/privacy" style="color:#aaaaaa;text-decoration:none;">Privacy Statement</a>
    </p>

  </div>
</body>
</html>`,
  };
};

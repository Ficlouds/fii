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
      <img src="data:image/png;base64,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" alt="Fi" style="height:28px;width:auto;display:block;">
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

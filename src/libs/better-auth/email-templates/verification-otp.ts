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

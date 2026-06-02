const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ─── 1. SEND OTP EMAIL (to user during login) ───────────── */
const sendOtpEmail = async (toEmail, otp, userName) => {
  const mailOptions = {
    from: `"Eatoz 🍽️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Eatoz Login OTP",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden;border:1px solid #222;">
        <div style="background:#111;padding:32px;text-align:center;border-bottom:1px solid #222;">
          <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">Eatoz</h1>
          <p style="color:#888;margin:6px 0 0;font-size:13px;">Your food, your way</p>
        </div>
        <div style="padding:36px 32px;">
          <p style="color:#ccc;font-size:15px;margin:0 0 8px;">Hey <strong style="color:#fff;">${userName}</strong>,</p>
          <p style="color:#888;font-size:14px;margin:0 0 28px;line-height:1.6;">
            Use the OTP below to complete your login. It expires in <strong style="color:#fff;">5 minutes</strong>.
          </p>
          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
            <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Your One-Time Password</p>
            <p style="color:#fff;font-size:42px;font-weight:700;letter-spacing:10px;margin:0;font-family:'Courier New',monospace;">${otp}</p>
          </div>
          <p style="color:#555;font-size:12px;text-align:center;margin:0;line-height:1.6;">
            If you didn't try to log in, ignore this email.<br/>Never share this OTP with anyone.
          </p>
        </div>
        <div style="background:#111;padding:20px;text-align:center;border-top:1px solid #222;">
          <p style="color:#444;font-size:11px;margin:0;">© 2025 Eatoz. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/* ─── 2. SEND WELCOME EMAIL (to user after OTP verified) ─── */
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: `"Eatoz 🍽️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome back to Eatoz! 🍽️",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden;border:1px solid #222;">
        <div style="background:#111;padding:32px;text-align:center;border-bottom:1px solid #222;">
          <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">Eatoz</h1>
          <p style="color:#888;margin:6px 0 0;font-size:13px;">Your food, your way</p>
        </div>
        <div style="padding:36px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🍽️</div>
          <h2 style="color:#fff;font-size:22px;margin:0 0 12px;">Welcome back, ${userName}!</h2>
          <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 28px;">
            You've successfully signed in to Eatoz.<br/>
            Your cravings are just a tap away. Enjoy!
          </p>
          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;">
            <p style="color:#555;font-size:12px;margin:0;">
              Signed in at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </p>
          </div>
        </div>
        <div style="background:#111;padding:20px;text-align:center;border-top:1px solid #222;">
          <p style="color:#444;font-size:11px;margin:0;">© 2025 Eatoz. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/* ─── 3. SEND ADMIN ALERT (to admin after any sign-in) ───── */
const sendAdminSignInAlert = async (userName, userEmail, role) => {
  const mailOptions = {
    from: `"Eatoz 🍽️" <${process.env.EMAIL_USER}>`,
    to: "eshachauhan1204@gmail.com",
    subject: `🔔 Sign-In Alert: ${userName} just logged in`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden;border:1px solid #222;">
        <div style="background:#111;padding:32px;text-align:center;border-bottom:1px solid #222;">
          <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">Eatoz</h1>
          <p style="color:#888;margin:6px 0 0;font-size:13px;">Admin Notification Panel</p>
        </div>
        <div style="padding:36px 32px;">
          <div style="font-size:40px;text-align:center;margin-bottom:16px;">🔔</div>
          <h2 style="color:#fff;font-size:20px;text-align:center;margin:0 0 8px;">New Sign-In Detected</h2>
          <p style="color:#888;font-size:13px;text-align:center;margin:0 0 28px;">
            A user has successfully signed in to Eatoz.
          </p>

          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#888;font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;">
                  👤 Name
                </td>
                <td style="color:#fff;font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;text-align:right;font-weight:600;">
                  ${userName}
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;">
                  📧 Email
                </td>
                <td style="color:#fff;font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                  ${userEmail}
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;">
                  🏷️ Role
                </td>
                <td style="font-size:13px;padding:10px 0;border-bottom:1px solid #2a2a2a;text-align:right;text-transform:capitalize;font-weight:600;color:${role === "admin" ? "#f59e0b" : "#34d399"};">
                  ${role}
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:10px 0;">
                  🕐 Time
                </td>
                <td style="color:#fff;font-size:13px;padding:10px 0;text-align:right;">
                  ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                </td>
              </tr>
            </table>
          </div>

          <p style="color:#555;font-size:12px;text-align:center;margin:0;line-height:1.6;">
            This is an automated alert from your Eatoz admin panel.<br/>
            If this sign-in looks suspicious, review it immediately.
          </p>
        </div>
        <div style="background:#111;padding:20px;text-align:center;border-top:1px solid #222;">
          <p style="color:#444;font-size:11px;margin:0;">© 2025 Eatoz. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendWelcomeEmail, sendAdminSignInAlert };
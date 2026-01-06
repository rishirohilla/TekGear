const nodemailer = require('nodemailer');

// Create transporter (will use environment variables)
const createTransporter = () => {
  // Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Email transporter configured with:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  console.log('⚠️ SMTP not configured - emails will be logged to console');
  return null;
};

// Send bonus notification email
const sendBonusNotification = async (user, bonusData) => {
  const { timeSaved, incentiveEarned, jobTitle } = bonusData;

  const message = {
    to: user.email,
    subject: '🎉 Efficiency Bonus Earned! - GearGain Pro',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 32px; border: 1px solid #4cad9a33; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { color: #4cad9a; font-size: 28px; font-weight: bold; }
            .title { color: #ffffff; font-size: 24px; margin: 16px 0; }
            .highlight { background: linear-gradient(135deg, #4cad9a 0%, #3d9c8b 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }
            .amount { color: #ffffff; font-size: 48px; font-weight: bold; }
            .stats { display: flex; justify-content: space-around; margin: 24px 0; }
            .stat { text-align: center; }
            .stat-value { color: #4cad9a; font-size: 24px; font-weight: bold; }
            .stat-label { color: #888888; font-size: 12px; text-transform: uppercase; }
            .message { color: #cccccc; text-align: center; margin: 24px 0; }
            .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">⚡ GearGain Pro</div>
                <div class="title">You Beat the Clock!</div>
              </div>
              
              <div class="highlight">
                <div class="amount">+$${incentiveEarned.toFixed(2)}</div>
                <div style="color: #ffffff; opacity: 0.9;">Added to your weekly pulse!</div>
              </div>
              
              <table style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="text-align: center; padding: 16px;">
                    <div style="color: #4cad9a; font-size: 24px; font-weight: bold;">${timeSaved}</div>
                    <div style="color: #888888; font-size: 12px; text-transform: uppercase;">Minutes Saved</div>
                  </td>
                  <td style="text-align: center; padding: 16px;">
                    <div style="color: #4cad9a; font-size: 24px; font-weight: bold;">${jobTitle}</div>
                    <div style="color: #888888; font-size: 12px; text-transform: uppercase;">Job Completed</div>
                  </td>
                </tr>
              </table>
              
              <div class="message">
                Great work, ${user.name}! Your efficiency is making a difference. Keep up the momentum! 🚀
              </div>
              
              <div class="footer">
                GearGain Pro - Dealership Productivity Platform<br>
                Powering technician excellence.
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  };

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"GearGain Pro" <${process.env.SMTP_USER}>`,
        ...message
      });
      console.log(`📧 Bonus notification sent to ${user.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
      throw error;
    }
  } else {
    // Development mode - just log the notification
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 BONUS NOTIFICATION (Dev Mode)');
    console.log(`To: ${user.email}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`🎉 ${user.name} earned $${incentiveEarned.toFixed(2)} bonus!`);
    console.log(`⏱️  Time saved: ${timeSaved} minutes`);
    console.log(`🔧 Job: ${jobTitle}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

// Send weekly summary email
const sendWeeklySummary = async (user, weeklyData) => {
  const { totalEarnings, jobsCompleted, totalTimeSaved, efficiencyRatio, goalProgress } = weeklyData;

  console.log(`📊 Weekly Summary for ${user.name}:`, {
    totalEarnings,
    jobsCompleted,
    totalTimeSaved,
    efficiencyRatio,
    goalProgress
  });

  // In production, this would send an actual email
};

module.exports = {
  sendBonusNotification,
  sendWeeklySummary
};

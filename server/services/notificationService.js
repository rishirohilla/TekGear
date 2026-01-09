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
    subject: '🎉 Efficiency Bonus Earned! - TekGear',
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
                <div class="logo">⚡ TekGear</div>
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
                TekGear - Dealership Productivity Platform<br>
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
        from: `"TekGear" <${process.env.SMTP_USER}>`,
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

// Send job request notification to manager
const sendJobRequestNotification = async (manager, requestData) => {
  const { techName, techEmail, jobTitle, jobId, requiredCert, bookTime, approvalToken } = requestData;

  const approveUrl = `${process.env.CLIENT_URL || 'http://localhost:5001'}/api/jobs/${jobId}/approve/${approvalToken}`;

  const message = {
    to: manager.email,
    subject: `🔔 Job Request: ${techName} wants to work on "${jobTitle}"`,
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
            .title { color: #ffffff; font-size: 22px; margin: 16px 0; }
            .info-box { background: #1a1a1a; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; }
            .info-label { color: #888; }
            .info-value { color: #fff; font-weight: 500; }
            .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px; }
            .btn-approve { background: linear-gradient(135deg, #4cad9a 0%, #3d9c8b 100%); color: white; }
            .btn-reject { background: #333; color: #888; border: 1px solid #555; }
            .buttons { text-align: center; margin: 24px 0; }
            .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">⚡ TekGear</div>
                <div class="title">Job Request Pending Your Approval</div>
              </div>
              
              <div class="info-box">
                <table style="width: 100%;">
                  <tr><td style="color: #888; padding: 8px 0;">Technician</td><td style="color: #4cad9a; text-align: right; font-weight: bold;">${techName}</td></tr>
                  <tr><td style="color: #888; padding: 8px 0;">Email</td><td style="color: #fff; text-align: right;">${techEmail}</td></tr>
                  <tr><td style="color: #888; padding: 8px 0;">Job</td><td style="color: #fff; text-align: right; font-weight: bold;">${jobTitle}</td></tr>
                  <tr><td style="color: #888; padding: 8px 0;">Required Cert</td><td style="color: #4cad9a; text-align: right;">${requiredCert}</td></tr>
                  <tr><td style="color: #888; padding: 8px 0;">Book Time</td><td style="color: #fff; text-align: right;">${bookTime} minutes</td></tr>
                </table>
              </div>
              
              <div class="buttons">
                <a href="${approveUrl}" class="btn btn-approve">✓ Approve Job</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 12px;">
                Or log in to the dashboard to approve/reject with more options.
              </p>
              
              <div class="footer">
                TekGear - Dealership Productivity Platform<br>
                Manager Control Center
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
        from: `"TekGear" <${process.env.SMTP_USER}>`,
        ...message
      });
      console.log(`📧 Job request notification sent to ${manager.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
      throw error;
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 JOB REQUEST NOTIFICATION (Dev Mode)');
    console.log(`To: ${manager.email}`);
    console.log(`Tech: ${techName} requests "${jobTitle}"`);
    console.log(`Approve URL: ${approveUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

// Send job approval/rejection notification to tech
const sendJobApprovalNotification = async (tech, approvalData) => {
  const { jobTitle, approved, reason, managerName, directAssignment, reassigned } = approvalData;

  let subject, title, message;

  if (approved) {
    if (directAssignment) {
      subject = `📋 Job Assigned: "${jobTitle}"`;
      title = reassigned ? 'Job Reassigned to You!' : 'New Job Assigned!';
      message = `${managerName} has ${reassigned ? 'reassigned' : 'assigned'} you to work on this job. You can start whenever you're ready!`;
    } else {
      subject = `✅ Job Request Approved: "${jobTitle}"`;
      title = 'Your Request Was Approved!';
      message = `${managerName} has approved your request. You can now start working on this job.`;
    }
  } else {
    subject = `❌ Job Request Declined: "${jobTitle}"`;
    title = 'Request Not Approved';
    message = `${managerName} has declined your request. Reason: ${reason || 'Not specified'}`;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 32px; border: 1px solid ${approved ? '#4cad9a33' : '#ef444433'}; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { color: #4cad9a; font-size: 28px; font-weight: bold; }
          .title { color: ${approved ? '#4cad9a' : '#ef4444'}; font-size: 24px; margin: 16px 0; }
          .job-title { color: #ffffff; font-size: 20px; text-align: center; margin: 20px 0; padding: 16px; background: #1a1a1a; border-radius: 8px; }
          .message { color: #cccccc; text-align: center; margin: 24px 0; }
          .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">⚡ TekGear</div>
              <div class="title">${title}</div>
            </div>
            
            <div class="job-title">${jobTitle}</div>
            
            <div class="message">${message}</div>
            
            ${approved ? '<p style="text-align: center; color: #4cad9a;">Log in to your dashboard to start working! 🚀</p>' : ''}
            
            <div class="footer">
              TekGear - Dealership Productivity Platform
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TekGear" <${process.env.SMTP_USER}>`,
        to: tech.email,
        subject,
        html: emailHtml
      });
      console.log(`📧 Job ${approved ? 'approval' : 'rejection'} notification sent to ${tech.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
      throw error;
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 JOB ${approved ? 'APPROVAL' : 'REJECTION'} (Dev Mode)`);
    console.log(`To: ${tech.email}`);
    console.log(`Job: ${jobTitle}`);
    console.log(`Status: ${approved ? 'APPROVED' : 'REJECTED'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

// Send notification to manager when a tech requests to join shop
const sendManagerTechRequestNotification = async (manager, requestData) => {
  const { techName, techEmail, techCertifications, shopName, approvalToken } = requestData;
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

  const transporter = createTransporter();
  const subject = `🔔 New Technician Request - ${techName} wants to join ${shopName}`;

  const emailHtml = `
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
          .info-box { background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .label { color: #888888; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
          .value { color: #ffffff; font-size: 16px; font-weight: 500; }
          .certs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
          .cert-badge { background: #4cad9a22; color: #4cad9a; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
          .buttons { display: flex; gap: 16px; justify-content: center; margin: 32px 0; }
          .btn { padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
          .btn-approve { background: #4cad9a; color: white; }
          .btn-reject { background: #ef4444; color: white; }
          .or-text { color: #666; text-align: center; margin: 16px 0; }
          .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">⚡ TekGear</div>
              <div class="title">New Technician Request</div>
            </div>
            
            <div class="info-box">
              <div class="label">Technician</div>
              <div class="value">${techName}</div>
              <div style="color: #888; font-size: 14px;">${techEmail}</div>
            </div>
            
            <div class="info-box">
              <div class="label">Requesting to join</div>
              <div class="value">${shopName}</div>
            </div>
            
            <div class="info-box">
              <div class="label">Certifications</div>
              <div class="certs">
                ${techCertifications.map(cert => `<span class="cert-badge">${cert}</span>`).join('')}
              </div>
            </div>
            
            <div class="buttons">
              <a href="${serverUrl}/api/shop/email-approve/${approvalToken}" class="btn btn-approve">✓ Approve</a>
              <a href="${serverUrl}/api/shop/email-reject/${approvalToken}" class="btn btn-reject">✕ Reject</a>
            </div>
            
            <p class="or-text">or manage from your dashboard</p>
            
            <div class="footer">
              TekGear - Dealership Productivity Platform
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TekGear" <${process.env.SMTP_USER}>`,
        to: manager.email,
        subject,
        html: emailHtml
      });
      console.log(`📧 Tech request notification sent to manager: ${manager.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 TECH REQUEST (Dev Mode)`);
    console.log(`To Manager: ${manager.email}`);
    console.log(`Tech: ${techName} (${techEmail})`);
    console.log(`Shop: ${shopName}`);
    console.log(`Approve: ${serverUrl}/api/shop/email-approve/${approvalToken}`);
    console.log(`Reject: ${serverUrl}/api/shop/email-reject/${approvalToken}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

// Send notification to tech about their account approval/rejection
const sendTechApprovalNotification = async (tech, approvalData) => {
  const { shopName, approved, reason, managerName } = approvalData;

  const transporter = createTransporter();
  const subject = approved
    ? `✅ Welcome to ${shopName}! Your account is approved`
    : `❌ Account Request Update - ${shopName}`;

  const message = approved
    ? `Great news! Your request to join ${shopName} has been approved by ${managerName}. You can now log in and start working.`
    : `Your request to join ${shopName} was not approved. ${reason || ''}`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TekGear" <${process.env.SMTP_USER}>`,
        to: tech.email,
        subject,
        html: `<h2>Account Status: ${approved ? 'APPROVED' : 'NOT APPROVED'}</h2><p>Hi ${tech.name},</p><p>${message}</p>${approved ? `<p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Log In Now</a></p>` : ''}`
      });
      console.log(`📧 Tech ${approved ? 'approval' : 'rejection'} sent to ${tech.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 TECH ACCOUNT ${approved ? 'APPROVED' : 'REJECTED'} (Dev Mode)`);
    console.log(`To: ${tech.email}`);
    console.log(`Shop: ${shopName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

// Send confirmation to tech when they submit account request
const sendTechRequestConfirmation = async (tech, shopName) => {
  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TekGear" <${process.env.SMTP_USER}>`,
        to: tech.email,
        subject: `📝 Account Request Received - ${shopName}`,
        html: `<h2>Request Received!</h2><p>Hi ${tech.name},</p><p>Your request to join <strong>${shopName}</strong> has been received. The manager will review and you'll be notified.</p><p style="color: orange;">⏳ PENDING APPROVAL</p>`
      });
      console.log(`📧 Request confirmation sent to ${tech.email}`);
    } catch (error) {
      console.error('Email send failed:', error.message);
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 TECH REQUEST CONFIRMATION (Dev Mode)`);
    console.log(`To: ${tech.email}`);
    console.log(`Shop: ${shopName}`);
    console.log(`Status: PENDING`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};

module.exports = {
  sendBonusNotification,
  sendWeeklySummary,
  sendJobRequestNotification,
  sendJobApprovalNotification,
  sendManagerTechRequestNotification,
  sendTechApprovalNotification,
  sendTechRequestConfirmation
};


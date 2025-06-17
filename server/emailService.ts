interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class EmailService {
  private smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Mock email sending for development
      // In production, use nodemailer or similar service
      console.log('📧 Sending email:', {
        to: options.to,
        subject: options.subject,
        attachments: options.attachments?.length || 0,
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendReportEmail(
    recipients: string[],
    clientName: string,
    reportPdf: Buffer,
    period: string
  ): Promise<boolean> {
    const subject = `📊 Social Media Analytics Report - ${clientName} (${period})`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E40AF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Social Media Analytics Report</h1>
              <p>Your automated insights for ${clientName}</p>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Your scheduled social media analytics report for <strong>${clientName}</strong> (${period}) is ready.</p>
              <p>The attached PDF contains:</p>
              <ul>
                <li>📈 Key performance metrics and trends</li>
                <li>📊 Engagement and reach analytics</li>
                <li>🏆 Top performing posts</li>
                <li>📋 Executive summary and insights</li>
              </ul>
              <p>Please find the detailed report attached to this email.</p>
              <p>Best regards,<br>SocialPulse Analytics Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipients,
      subject,
      html,
      attachments: [
        {
          filename: `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_report_${period}.pdf`,
          content: reportPdf,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendAlertEmail(
    recipients: string[],
    clientName: string,
    alertTitle: string,
    alertMessage: string
  ): Promise<boolean> {
    const subject = `🚨 Alert: ${alertTitle} - ${clientName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .alert-title { color: #D97706; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚨 Social Media Alert</h1>
            <div class="alert">
              <div class="alert-title">${alertTitle}</div>
              <p>${alertMessage}</p>
            </div>
            <p>This alert was generated for <strong>${clientName}</strong>.</p>
            <p>Please review your dashboard for more details and take appropriate action if needed.</p>
            <p>Best regards,<br>SocialPulse Analytics Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipients,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();

import { db } from '../../config/db';
import { compileTemplate } from './templates';
import nodemailer from 'nodemailer';

export interface EmailSettings {
  id: string;
  provider: 'sandbox' | 'smtp' | 'resend' | 'sendgrid';
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_secure: boolean;
  resend_api_key?: string;
  sendgrid_api_key?: string;
  sender_email: string;
  sender_name: string;
  enabled_types: string[];
  is_active: boolean;
}

// 1. Fetch current settings from database
export const getEmailSettings = async (): Promise<EmailSettings | null> => {
  try {
    const res = await db.query('SELECT * FROM email_settings LIMIT 1');
    if (res.rows.length === 0) {
      // Seed default sandbox settings
      const seedRes = await db.query(
        `INSERT INTO email_settings (provider, sender_email, sender_name)
         VALUES ('sandbox', 'noreply@brotherhood2026.com', 'Brotherhood Clothing')
         RETURNING *`
      );
      return seedRes.rows[0];
    }
    const settings = res.rows[0];
    if (typeof settings.enabled_types === 'string') {
      settings.enabled_types = JSON.parse(settings.enabled_types);
    }
    return settings;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
};

// 2. Queue Email in Database
export const queueEmail = async (
  recipientEmail: string,
  recipientName: string,
  templateName: string,
  variables: any
): Promise<boolean> => {
  try {
    const email = recipientEmail.toLowerCase().trim();

    // A. Check user notification settings preference
    const userPref = await db.query(
      'SELECT allow_email_notifications FROM users WHERE email = $1',
      [email]
    );
    if (userPref.rows.length > 0 && !userPref.rows[0].allow_email_notifications) {
      console.log(`Skipping queue email to ${email}: User disabled email notifications.`);
      return false;
    }

    // B. Check global email type setting
    const settings = await getEmailSettings();
    if (settings) {
      if (!settings.is_active) {
        console.log('Skipping queue email: Email system is globally disabled.');
        return false;
      }
      if (!settings.enabled_types.includes(templateName)) {
        console.log(`Skipping queue email: Notification type "${templateName}" is disabled.`);
        return false;
      }
    }

    // C. Prevent Duplicate Emails within the last 5 minutes (same recipient, template, and variables)
    const varJson = JSON.stringify(variables);
    const duplicates = await db.query(
      `SELECT id FROM email_logs 
       WHERE recipient_email = $1 
         AND template_name = $2 
         AND template_variables::jsonb = $3::jsonb 
         AND (status = 'pending' OR status = 'processing' OR (status = 'sent' AND sent_at > NOW() - INTERVAL '5 minutes'))
       LIMIT 1`,
      [email, templateName, varJson]
    );

    if (duplicates.rows.length > 0) {
      console.log(`Skipping duplicate email to ${email} (template: ${templateName}) queued/sent recently.`);
      return false;
    }

    // D. Compile Template to obtain subject
    const { subject } = compileTemplate(templateName, variables);

    // E. Insert Log as Pending (Queue)
    await db.query(
      `INSERT INTO email_logs (recipient_email, recipient_name, subject, template_name, template_variables, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [email, recipientName, subject, templateName, varJson]
    );

    console.log(`Email successfully queued for ${email} (template: ${templateName}).`);
    return true;
  } catch (error) {
    console.error('Error queuing email:', error);
    return false;
  }
};

// 3. Process/Send Immediate Log
export const sendEmailImmediate = async (logId: string): Promise<boolean> => {
  try {
    // A. Fetch Log
    const logRes = await db.query('SELECT * FROM email_logs WHERE id = $1', [logId]);
    if (logRes.rows.length === 0) return false;
    const log = logRes.rows[0];

    // B. Mark log as processing
    await db.query("UPDATE email_logs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [logId]);

    // C. Fetch Settings
    const settings = await getEmailSettings();
    if (!settings || !settings.is_active) {
      throw new Error('Email settings not found or globally disabled.');
    }

    // D. Compile HTML body
    const vars = typeof log.template_variables === 'string' ? JSON.parse(log.template_variables) : log.template_variables;
    const { html, subject } = compileTemplate(log.template_name, vars);

    let messageId = '';
    const fromAddress = `"${settings.sender_name}" <${settings.sender_email}>`;

    if (settings.provider === 'sandbox') {
      // Sandbox mode: Simulate successful send
      messageId = `sandbox-${Math.random().toString(36).substr(2, 9)}@brotherhood.com`;
      console.log(`[SANDBOX EMAIL] From: ${fromAddress} | To: ${log.recipient_email} | Subject: ${subject}`);
    } else if (settings.provider === 'smtp') {
      if (!settings.smtp_host || !settings.smtp_port) {
        throw new Error('SMTP host/port are not configured.');
      }
      // SMTP transport configuration
      const transportOptions: any = {
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: settings.smtp_secure,
      };

      if (settings.smtp_user && settings.smtp_pass) {
        transportOptions.auth = {
          user: settings.smtp_user,
          pass: settings.smtp_pass
        };
      }

      const transporter = nodemailer.createTransport(transportOptions);
      const info = await transporter.sendMail({
        from: fromAddress,
        to: log.recipient_email,
        subject,
        html,
      });
      messageId = info.messageId;
    } else if (settings.provider === 'resend') {
      if (!settings.resend_api_key) throw new Error('Resend API key is missing.');
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.resend_api_key}`
        },
        body: JSON.stringify({
          from: fromAddress,
          to: log.recipient_email,
          subject,
          html
        })
      });

      const resData = await response.json() as any;
      if (!response.ok) {
        throw new Error(resData.message || `Resend request failed with status ${response.status}`);
      }
      messageId = resData.id;
    } else if (settings.provider === 'sendgrid') {
      if (!settings.sendgrid_api_key) throw new Error('SendGrid API key is missing.');

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.sendgrid_api_key}`
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: log.recipient_email, name: log.recipient_name }]
          }],
          from: { email: settings.sender_email, name: settings.sender_name },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`SendGrid request failed: ${errText}`);
      }
      messageId = response.headers.get('x-message-id') || `sg-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      throw new Error(`Unknown email provider: ${settings.provider}`);
    }

    // E. Save log as sent
    await db.query(
      `UPDATE email_logs 
       SET status = 'sent', provider_message_id = $1, error_message = NULL, updated_at = CURRENT_TIMESTAMP, sent_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [messageId, logId]
    );

    console.log(`Email log ${logId} sent successfully (Provider: ${settings.provider}).`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send email log ${logId}:`, error);
    
    // Increment retry count and mark as failed
    await db.query(
      `UPDATE email_logs 
       SET status = 'failed', retry_count = retry_count + 1, error_message = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [error.message || 'Unknown error occurred.', logId]
    );
    
    return false;
  }
};

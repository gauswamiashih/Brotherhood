import { Request, Response } from 'express';
import { db } from '../config/db';
import { getEmailSettings, queueEmail, sendEmailImmediate } from '../services/email/email.service';
import { compileTemplate } from '../services/email/templates';

// ─── USER NOTIFICATION PREFERENCES ──────────────────────────────────────────

export const getNotificationSettings = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await db.query('SELECT allow_email_notifications FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user notification preferences:', error);
    return res.status(500).json({ error: 'Failed to retrieve notification preferences' });
  }
};

export const updateNotificationSettings = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { allowEmailNotifications } = req.body;
  if (allowEmailNotifications === undefined) {
    return res.status(400).json({ error: 'allowEmailNotifications value is required' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET allow_email_notifications = $1 WHERE id = $2 RETURNING id, allow_email_notifications',
      [allowEmailNotifications, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ error: 'Failed to update notification settings' });
  }
};

export const sendTestEmail = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { type } = req.body; // template name
  if (!type) return res.status(400).json({ error: 'Email type is required' });

  try {
    const mockVars: Record<string, any> = {
      name: req.user.name || 'Valued Customer',
      email: req.user.email,
      customerName: req.user.name || 'Valued Customer',
      customerEmail: req.user.email,
      customerAddress: '123 Luxury Avenue, Palanpur, Gujarat, 385001',
      customerPhone: '9664592743',
      orderId: '00000000-0000-0000-0000-000000000099',
      totalPrice: 24999.00,
      status: 'shipped',
      items: [
        { name: 'Classic Gold Sherwani', price: 14999.00, quantity: 1 },
        { name: 'Italian Velvet Blazer', price: 8999.00, quantity: 1 }
      ],
      productName: 'Italian Velvet Blazer',
      shopName: 'Brotherhood Flagship Store',
      shopId: '00000000-0000-0000-0000-000000000002',
      oldPrice: 10999,
      newPrice: 8999,
      stock: 2,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      phone: '9664592743',
      city: 'Palanpur',
      category: 'Menswear',
      rating: 5,
      comment: 'Superb quality and fit! Simply stunning.',
      time: new Date().toLocaleString(),
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Developer Console',
      ticketSubject: 'Return and Refund Gating',
      originalMessage: 'How do I return items if the sizing is incorrect?',
      replyContent: 'Our boutique offers a 7-day custom alterations policy. Simply bring the product to our boutique in Palanpur with your order confirmation email.',
      verificationUrl: `http://localhost:5173/verify?email=${req.user.email}`,
      resetUrl: `http://localhost:5173/reset-password?token=mockToken123`
    };

    // Queue test email
    const queued = await queueEmail(req.user.email, req.user.name || 'Test User', type, mockVars);
    if (!queued) {
      return res.status(400).json({ error: 'Failed to queue test email. Check settings or duplicate check limits.' });
    }
    return res.status(200).json({ message: `Test email (${type}) successfully queued in background.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to send test email' });
  }
};

// ─── ADMIN EMAIL MANAGEMENT ──────────────────────────────────────────────────

export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ error: 'Failed to retrieve email logs' });
  }
};

export const resendFailedEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const logCheck = await db.query('SELECT status, retry_count FROM email_logs WHERE id = $1', [id]);
    if (logCheck.rows.length === 0) return res.status(404).json({ error: 'Log entry not found' });
    
    // Reset status to pending and reset retry count so background worker will pick it up
    await db.query(
      "UPDATE email_logs SET status = 'pending', retry_count = 0, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    // Call immediate send in background
    setTimeout(async () => {
      await sendEmailImmediate(id);
    }, 1000);

    return res.status(200).json({ message: 'Email queued for immediate delivery.' });
  } catch (error) {
    console.error('Error resending failed email:', error);
    return res.status(500).json({ error: 'Failed to trigger resend' });
  }
};

export const getAdminEmailSettings = async (req: Request, res: Response) => {
  try {
    const settings = await getEmailSettings();
    if (!settings) return res.status(404).json({ error: 'Email configuration not found' });
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve email settings' });
  }
};

export const updateAdminEmailSettings = async (req: Request, res: Response) => {
  const {
    provider,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpSecure,
    resendApiKey,
    sendgridApiKey,
    senderEmail,
    senderName,
    enabledTypes,
    isActive
  } = req.body;

  try {
    const current = await getEmailSettings();
    if (!current) return res.status(404).json({ error: 'Settings not found' });

    const enabledTypesJson = JSON.stringify(enabledTypes || current.enabled_types);

    const result = await db.query(
      `UPDATE email_settings 
       SET provider = $1, 
           smtp_host = $2, 
           smtp_port = $3, 
           smtp_user = $4, 
           smtp_pass = $5, 
           smtp_secure = $6, 
           resend_api_key = $7, 
           sendgrid_api_key = $8, 
           sender_email = $9, 
           sender_name = $10, 
           enabled_types = $11, 
           is_active = $12, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13 RETURNING *`,
      [
        provider || current.provider,
        smtpHost !== undefined ? smtpHost : current.smtp_host,
        smtpPort !== undefined ? Number(smtpPort) : current.smtp_port,
        smtpUser !== undefined ? smtpUser : current.smtp_user,
        smtpPass !== undefined ? smtpPass : current.smtp_pass,
        smtpSecure !== undefined ? smtpSecure : current.smtp_secure,
        resendApiKey !== undefined ? resendApiKey : current.resend_api_key,
        sendgridApiKey !== undefined ? sendgridApiKey : current.sendgrid_api_key,
        senderEmail || current.sender_email,
        senderName || current.sender_name,
        enabledTypesJson,
        isActive !== undefined ? isActive : current.is_active,
        current.id
      ]
    );

    const updated = result.rows[0];
    if (typeof updated.enabled_types === 'string') {
      updated.enabled_types = JSON.parse(updated.enabled_types);
    }
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating email settings:', error);
    return res.status(500).json({ error: 'Failed to update email settings', details: error.message });
  }
};

export const previewEmailTemplate = (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Template name is required' });

  try {
    const mockVars: Record<string, any> = {
      name: 'Ashish Gauswami',
      email: 'gauswamiashish760@gmail.com',
      customerName: 'Ashish Gauswami',
      customerEmail: 'gauswamiashish760@gmail.com',
      customerAddress: 'Dhanera Highway, Palanpur, Gujarat, India',
      customerPhone: '9664592743',
      orderId: '00000000-0000-0000-0000-000000000099',
      totalPrice: 23998.00,
      status: 'shipped',
      items: [
        { name: 'Classic Gold Sherwani', price: 14999.00, quantity: 1 },
        { name: 'Italian Velvet Blazer', price: 8999.00, quantity: 1 }
      ],
      productName: 'Classic Gold Sherwani',
      shopName: 'Brotherhood Clothing',
      shopId: '00000000-0000-0000-0000-000000000002',
      oldPrice: 14999,
      newPrice: 12999,
      stock: 3,
      ownerName: 'Ashish Gauswami',
      ownerEmail: 'gauswamiashish760@gmail.com',
      phone: '9664592743',
      city: 'Palanpur',
      category: 'All Wear',
      rating: 5,
      comment: 'Absolutely love the embroidery. It looks premium and elite!',
      time: new Date().toLocaleString(),
      ip: '127.0.0.1',
      device: 'Chrome Browser (Mac OS)',
      ticketSubject: 'Alterations Support',
      originalMessage: 'Can you deliver by Thursday night?',
      replyContent: 'Yes, we have confirmed stock availability and will expedite dispatch. Expect delivery by Thursday afternoon.',
      verificationUrl: 'http://localhost:5173/verify?email=gauswamiashish760@gmail.com',
      resetUrl: 'http://localhost:5173/reset-password?token=mockToken123'
    };

    const result = compileTemplate(String(name), mockVars);
    return res.status(200).send(result.html);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Template rendering failed' });
  }
};

export const triggerTestCron = async (req: Request, res: Response) => {
  const { reportType } = req.body; // 'sales_report', 'platform_summary', 'low_inventory'
  
  try {
    if (reportType === 'platform_summary') {
      // Fetch platform metrics
      const usersRes = await db.query('SELECT count(*) FROM users');
      const activeShopsRes = await db.query("SELECT count(*) FROM shops WHERE status = 'approved'");
      const pendingShopsRes = await db.query("SELECT count(*) FROM shops WHERE status = 'pending'");
      const followersRes = await db.query('SELECT count(*) FROM followers');
      
      const adminEmail = 'gauswamiashish760@gmail.com';
      await queueEmail(adminEmail, 'Founder Admin', 'platform_summary', {
        totalUsers: usersRes.rows[0].count,
        activeShops: activeShopsRes.rows[0].count,
        pendingShops: pendingShopsRes.rows[0].count,
        totalFollowers: followersRes.rows[0].count
      });
      return res.status(200).json({ message: 'Simulated Admin Platform Summary cron executed & queued.' });
    }

    if (reportType === 'sales_report') {
      // Simulate reports for approved shops
      const shopsRes = await db.query(`
        SELECT s.id, s.name, s.owner_name, u.email 
        FROM shops s 
        JOIN users u ON s.owner_id = u.id 
        WHERE s.status = 'approved'
      `);
      
      for (const shop of shopsRes.rows) {
        // Mock revenue/orders metrics for report demo
        await queueEmail(shop.email, shop.owner_name, 'sales_report', {
          shopName: shop.name,
          ownerName: shop.owner_name,
          type: 'weekly',
          totalRevenue: 54997.00,
          orderCount: 4,
          followerGain: 12
        });
      }
      return res.status(200).json({ message: 'Simulated Vendor Sales Report cron executed & queued.' });
    }

    if (reportType === 'low_inventory') {
      // Find low stock products
      const shopsRes = await db.query(`
        SELECT p.name as product_name, p.stock, s.name as shop_name, s.owner_name, s.email 
        FROM products p 
        JOIN shops s ON p.shop_id = s.id 
        WHERE p.stock <= 3
      `);

      for (const row of shopsRes.rows) {
        await queueEmail(row.email, row.owner_name, 'low_inventory', {
          productName: row.product_name,
          shopName: row.shop_name,
          ownerName: row.owner_name,
          stock: row.stock
        });
      }
      return res.status(200).json({ message: 'Simulated Low Inventory cron executed & queued.' });
    }

    return res.status(400).json({ error: 'Invalid reportType value' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ─── NEWSLETTER & CONTACT FORM HANDLERS ──────────────────────────────────────

export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    await db.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET is_active = true',
      [email.toLowerCase().trim()]
    );

    // Queue subscription confirmation email
    await queueEmail(email, 'Subscriber', 'newsletter_confirmation', { email });

    return res.status(200).json({ message: 'Successfully subscribed to the luxury newsletter list.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Newsletter registration failed', details: error.message });
  }
};

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    await db.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );

    // Queue critical admin alert
    const adminEmail = 'gauswamiashish760@gmail.com';
    await queueEmail(adminEmail, 'Founder Admin', 'new_vendor', {
      shopName: `Contact Message: ${subject}`,
      ownerName: name,
      ownerEmail: email,
      category: 'Customer Support Inquiry'
    });

    return res.status(200).json({ message: 'Your support inquiry has been submitted. Our team will contact you shortly.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Submission failed', details: error.message });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export const replyContactMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyContent } = req.body;
  if (!replyContent) return res.status(400).json({ error: 'Reply content is required' });

  try {
    const msgRes = await db.query('SELECT * FROM contact_messages WHERE id = $1', [id]);
    if (msgRes.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    const msg = msgRes.rows[0];

    await db.query(
      'UPDATE contact_messages SET replied = true, reply_content = $1 WHERE id = $2',
      [replyContent, id]
    );

    // Queue response email to the customer
    await queueEmail(msg.email, msg.name, 'contact_response', {
      name: msg.name,
      ticketSubject: msg.subject,
      originalMessage: msg.message,
      replyContent
    });

    return res.status(200).json({ message: 'Reply submitted and response email queued.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to process reply', details: error.message });
  }
};

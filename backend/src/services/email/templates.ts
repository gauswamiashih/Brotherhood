// responsive HTML templates matching the Obsidian Black, Deep Purple, and Gold luxury theme
export interface EmailTemplateResult {
  subject: string;
  html: string;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper: Wrap content in base layout
const wrapBaseLayout = (subject: string, contentHtml: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090214; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #090214; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background: linear-gradient(135deg, #120524 0%, #1e0b36 100%); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px 0 rgba(94, 23, 235, 0.2); padding: 40px; text-align: left;">
          
          <!-- Header Branding -->
          <tr>
            <td align="center" style="padding-bottom: 30px; border-bottom: 1px solid rgba(212, 175, 55, 0.15);">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color: #D4AF37; font-size: 26px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif; letter-spacing: 3px; text-transform: uppercase;">
                    Brotherhood
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #9f7aea; font-size: 9px; font-weight: bold; letter-spacing: 5px; text-transform: uppercase; padding-top: 5px;">
                    Clothing
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; font-family: 'Outfit', sans-serif;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Settings -->
          <tr>
            <td align="center" style="padding-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.15); font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0; font-weight: bold; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">Brotherhood Premium Fashion Marketplace</p>
              <p style="margin: 4px 0 0 0;">Palanpur, Gujarat, India</p>
              <p style="margin: 15px 0 0 0;">
                You received this email because you opted in to notifications. Manage preferences in your 
                <a href="${FRONTEND_URL}/dashboard" style="color: #D4AF37; text-decoration: none; font-weight: bold;">Account Dashboard</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Render templates dynamically
export const compileTemplate = (templateName: string, vars: any): EmailTemplateResult => {
  let subject = '';
  let body = '';

  switch (templateName) {
    case 'welcome':
      subject = `Welcome to Brotherhood Clothing, ${vars.name || 'Shopper'}!`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Welcome to the Elite Circle, ${vars.name}!</h2>
        <p>Thank you for registering at Brotherhood Clothing, Palanpur's premier digital fashion marketplace. We connect connoisseurs of fashion with the finest luxury boutiques.</p>
        <p>Your account (<strong>${vars.email}</strong>) is now active and ready.</p>
        <div style="background-color: rgba(94, 23, 235, 0.15); border: 1px solid rgba(94, 23, 235, 0.3); border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; font-size: 13px; color: #e2e8f0;">Consult our signature Couture AI Stylist for bespoke recommendations tailored specifically for you.</p>
          <a href="${FRONTEND_URL}/ai-stylist" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Try Couture AI Stylist</a>
        </div>
      `;
      break;

    case 'verification':
      subject = 'Verify Your Email - Brotherhood Clothing';
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Confirm Your Identity</h2>
        <p>Thank you for joining Brotherhood Clothing. To secure your account and verify your email address, please click the verification button below:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${vars.verificationUrl || FRONTEND_URL + '/verify?email=' + vars.email}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">If the button above does not work, copy and paste this link in your browser:</p>
        <p style="font-size: 11px; word-break: break-all; color: #a78bfa;">${vars.verificationUrl || FRONTEND_URL + '/verify?email=' + vars.email}</p>
      `;
      break;

    case 'password_reset':
      subject = 'Reset Your Password - Brotherhood Clothing';
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Password Reset Request</h2>
        <p>We received a request to reset the password associated with your account (<strong>${vars.email}</strong>). Click the link below to set a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${vars.resetUrl || FRONTEND_URL + '/reset-password?token=' + vars.token}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      `;
      break;

    case 'login_alert':
      subject = 'Security Alert: New Sign-in Detected';
      body = `
        <h2 style="color: #EF4444; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">New Device Sign-In</h2>
        <p>A new sign-in was detected for your account (<strong>${vars.email}</strong>).</p>
        <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px; color: #f87171;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr><td><strong>Time:</strong></td><td>${vars.time || new Date().toLocaleString()}</td></tr>
            <tr><td><strong>IP Address:</strong></td><td>${vars.ip || '127.0.0.1'}</td></tr>
            <tr><td><strong>Device:</strong></td><td>${vars.device || 'Web Browser'}</td></tr>
          </table>
        </div>
        <p>If this was you, no action is needed. If you do not recognize this sign-in, please reset your password immediately and contact support.</p>
      `;
      break;

    case 'order_confirmation':
      subject = `Order Confirmed: #${vars.orderId.substring(0, 8)}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Thank you for your purchase!</h2>
        <p>Hello ${vars.customerName}, your luxury order has been confirmed. The boutique owner is preparing your premium items for delivery.</p>
        
        <h3 style="color: #9f7aea; font-size: 14px; margin-top: 25px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 5px;">Order Summary</h3>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #cbd5e1; margin-top: 10px;">
          ${(vars.items || []).map((item: any) => `
            <tr>
              <td style="padding: 8px 0;">${item.name} (x${item.quantity})</td>
              <td align="right" style="padding: 8px 0; color: #D4AF37;">₹${Number(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 15px 0; font-size: 14px; color: #ffffff;">Total Price</td>
            <td align="right" style="padding: 15px 0; font-size: 16px; color: #D4AF37;">₹${Number(vars.totalPrice).toLocaleString()}</td>
          </tr>
        </table>

        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 8px; padding: 15px; margin: 25px 0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 5px 0;"><strong>Shipping Coordinates:</strong></p>
          <p style="margin: 0;">${vars.customerAddress}</p>
        </div>
      `;
      break;

    case 'order_status':
      subject = `Order #${vars.orderId.substring(0, 8)} Status Update: ${vars.status.toUpperCase()}`;
      let statusNotes = '';
      if (vars.status === 'shipped') {
        statusNotes = 'Your premium parcel has been handed over to our designer dispatch agent and is on its way to your destination.';
      } else if (vars.status === 'completed') {
        statusNotes = 'Delivered! Your luxury order has reached its shipping destination. We hope you enjoy your premium selections.';
      } else if (vars.status === 'cancelled') {
        statusNotes = 'This order has been cancelled. If any payment was made, your refund has been scheduled.';
      } else {
        statusNotes = `The status of your order has been updated to "${vars.status}".`;
      }
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Order Status Update</h2>
        <p>Hello ${vars.customerName}, the status of your order <strong>#${vars.orderId.substring(0, 8)}</strong> has changed.</p>
        <div style="background-color: rgba(94, 23, 235, 0.15); border-left: 4px solid #D4AF37; border-radius: 4px; padding: 15px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
            Current Status: ${vars.status.toUpperCase()}
          </p>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">${statusNotes}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Log in to your account dashboard at any time to view tracking history.</p>
      `;
      break;

    case 'wishlist_price_drop':
      subject = `Price Drop Alert! ${vars.productName} is now cheaper`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Boutique Price Drop!</h2>
        <p>Good news! An item on your wishlist, <strong>${vars.productName}</strong>, from boutique <strong>${vars.shopName}</strong> has dropped in price!</p>
        <div style="background-color: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; text-decoration: line-through; color: #94a3b8;">Original Price: ₹${Number(vars.oldPrice).toLocaleString()}</p>
          <p style="margin: 5px 0 15px 0; font-size: 20px; font-weight: bold; color: #D4AF37;">New Price: ₹${Number(vars.newPrice).toLocaleString()}</p>
          <a href="${FRONTEND_URL}/shops/${vars.shopId}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">View in Shop</a>
        </div>
      `;
      break;

    case 'back_in_stock':
      subject = `Back In Stock: ${vars.productName}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Item Restocked!</h2>
        <p>The premium designer item <strong>${vars.productName}</strong> from boutique <strong>${vars.shopName}</strong> is back in stock!</p>
        <p>Hurry up and purchase before it runs out of inventory again.</p>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${FRONTEND_URL}/shops/${vars.shopId}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Shop Now</a>
        </div>
      `;
      break;

    case 'newsletter_confirmation':
      subject = 'Newsletter Subscription Confirmed - Brotherhood Clothing';
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Subscription Active</h2>
        <p>You have successfully subscribed to the Brotherhood Clothing newsletters.</p>
        <p>Stay tuned to receive early notification of Palanpur's flagship launches, boutique showcases, private sales, and seasonal lookbook selections.</p>
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; font-size: 12px;">
          <p style="margin: 0; color: #94a3b8;">Want to unsubscribe? Click <a href="${FRONTEND_URL}/unsubscribe?email=${vars.email}" style="color: #cbd5e1; text-decoration: underline;">here</a>.</p>
        </div>
      `;
      break;

    case 'contact_response':
      subject = `Re: Support Inquiry - ${vars.ticketSubject}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 20px; margin-top: 0;">Support Ticket Reply</h2>
        <p>Hello ${vars.name}, our customer response team has replied to your support message:</p>
        
        <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
          <p style="margin: 0 0 10px 0; color: #94a3b8; font-style: italic;">Your Message: "${vars.originalMessage}"</p>
          <p style="margin: 0; font-weight: bold; color: #ffffff;">Our Response:</p>
          <p style="margin: 5px 0 0 0; color: #e2e8f0; line-height: 1.5;">${vars.replyContent}</p>
        </div>
        <p>If you have any further questions, feel free to reply directly or contact support coordinates.</p>
      `;
      break;

    case 'account_status':
      subject = `Account Status Notification`;
      let accountStatusText = '';
      if (vars.status === 'active') {
        accountStatusText = 'We are pleased to inform you that your customer/vendor account access has been reactivated. You have regained full access to the portal.';
      } else {
        accountStatusText = `Your account status has been updated to "${vars.status.toUpperCase()}". Your access to registered shop dashboards and reviews has been suspended. Please contact admin support for appeals.`;
      }
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Account Status Update</h2>
        <p>Hello ${vars.name},</p>
        <div style="background-color: rgba(94, 23, 235, 0.1); border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
          ${accountStatusText}
        </div>
      `;
      break;

    case 'shop_registration':
      subject = 'Boutique Registered - Brotherhood Clothing';
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Boutique Under Review</h2>
        <p>Congratulations, ${vars.ownerName}! Your boutique <strong>"${vars.shopName}"</strong> has been successfully registered on the Brotherhood platform.</p>
        <p>Our catalog audit team is currently reviewing your registration parameters (phone: ${vars.phone}, city: ${vars.city}, category: ${vars.category}). We will notify you by email as soon as your profile is approved and live.</p>
        <p style="font-size: 12px; color: #94a3b8;">Registration status: <strong>PENDING REVIEW</strong></p>
      `;
      break;

    case 'shop_status':
      subject = `Boutique Status Update: ${vars.shopName}`;
      let shopNotes = '';
      if (vars.status === 'approved') {
        shopNotes = `Great news! Your boutique "${vars.shopName}" has been officially approved. You can now log into your Shop Dashboard, populate products, and pin gallery lookbooks.`;
      } else if (vars.status === 'blocked') {
        shopNotes = `Your boutique "${vars.shopName}" has been suspended/blocked by the platform administrator due to guideline violations. Please appeal by replying.`;
      } else if (vars.status === 'rejected') {
        shopNotes = `Your boutique registration request for "${vars.shopName}" was rejected.\n\nReason: ${vars.reason || 'Boutique details did not meet our brand standards.'}`;
      } else {
        shopNotes = `Boutique status set to ${vars.status}.`;
      }
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Boutique Status Update</h2>
        <p>Hello ${vars.ownerName}, the registration status of your boutique has been updated.</p>
        <div style="background-color: rgba(94, 23, 235, 0.15); border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0; font-size: 13px; color: #e2e8f0; line-height: 1.5; white-space: pre-wrap;">
          ${shopNotes}
        </div>
      `;
      break;

    case 'new_order':
      subject = `New Order Inquiry Received: #${vars.orderId.substring(0, 8)}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">New Boutique Order!</h2>
        <p>Hello ${vars.ownerName}, you have received a new purchase inquiry for <strong>${vars.shopName}</strong>!</p>
        
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.15); border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 5px 0;"><strong>Customer Coordinates:</strong></p>
          <p style="margin: 0;">Name: ${vars.customerName}</p>
          <p style="margin: 0;">Phone: ${vars.customerPhone}</p>
          <p style="margin: 0;">Address: ${vars.customerAddress}</p>
        </div>

        <h3 style="color: #9f7aea; font-size: 13px; margin-top: 20px;">Requested Items</h3>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #cbd5e1;">
          ${(vars.items || []).map((item: any) => `
            <tr>
              <td style="padding: 6px 0;">${item.name} (x${item.quantity})</td>
              <td align="right" style="padding: 6px 0; color: #D4AF37;">₹${Number(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold;">
            <td style="padding: 12px 0; font-size: 14px; color: #ffffff;">Subtotal</td>
            <td align="right" style="padding: 12px 0; font-size: 15px; color: #D4AF37;">₹${Number(vars.totalPrice).toLocaleString()}</td>
          </tr>
        </table>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${FRONTEND_URL}/vendor-dashboard" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Open Vendor Dashboard</a>
        </div>
      `;
      break;

    case 'product_moderation':
      subject = `Product Moderation Alert: ${vars.productName}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Product Moderation</h2>
        <p>Hello ${vars.ownerName}, your product <strong>${vars.productName}</strong> has been ${vars.status} by platform verification filters.</p>
        <p>If approved, it is now visible in the marketplace catalog. If rejected, it has been moved to your draft list.</p>
      `;
      break;

    case 'low_inventory':
      subject = `Low Inventory Alert: ${vars.productName}`;
      body = `
        <h2 style="color: #EF4444; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Low Inventory Warning</h2>
        <p>Hello ${vars.ownerName}, the inventory for item <strong>"${vars.productName}"</strong> at <strong>${vars.shopName}</strong> has dropped below threshold limits.</p>
        <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #f87171;">Remaining Items in Stock:</p>
          <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #EF4444;">${vars.stock}</p>
        </div>
        <p>Please restock this catalog item to ensure customers can continue placing orders seamlessly.</p>
        <div style="margin-top: 25px; text-align: center;">
          <a href="${FRONTEND_URL}/vendor-dashboard" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 12px; text-transform: uppercase;">Restock Item</a>
        </div>
      `;
      break;

    case 'sales_report':
      subject = `${vars.type === 'weekly' ? 'Weekly' : 'Monthly'} Sales Report: ${vars.shopName}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">${vars.type === 'weekly' ? 'Weekly' : 'Monthly'} Sales Metrics</h2>
        <p>Hello ${vars.ownerName}, here is the sales activity report for <strong>${vars.shopName}</strong> ending ${new Date().toLocaleDateString()}:</p>
        
        <div style="background-color: rgba(94, 23, 235, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; color: #94a3b8;">Total Revenue:</td>
              <td align="right" style="padding: 10px 0; font-weight: bold; color: #D4AF37; font-size: 18px;">₹${Number(vars.totalRevenue || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8;">Orders Completed:</td>
              <td align="right" style="padding: 10px 0; font-weight: bold; color: #ffffff;">${vars.orderCount || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8;">New Followers:</td>
              <td align="right" style="padding: 10px 0; font-weight: bold; color: #9f7aea;">+${vars.followerGain || 0}</td>
            </tr>
          </table>
        </div>
        <p>Log in to your owner dashboard to view item-level order analytics and check reviews.</p>
      `;
      break;

    case 'new_review':
      subject = `New customer review for ${vars.shopName}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 20px; margin-top: 0;">New Customer Review</h2>
        <p>Hello ${vars.ownerName}, a shopper left a review for <strong>"${vars.productName}"</strong>:</p>
        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #D4AF37;">
            Rating: ${'★'.repeat(vars.rating)}${'☆'.repeat(5 - vars.rating)} (${vars.rating}/5)
          </p>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #e2e8f0; font-style: italic; line-height: 1.5;">
            "${vars.comment}"
          </p>
        </div>
      `;
      break;

    case 'new_vendor':
      subject = `[Admin Alert] New Vendor Request: ${vars.shopName}`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 20px; margin-top: 0;">New Vendor Sign Up</h2>
        <p>A new shop registration request has been submitted and is awaiting approval:</p>
        <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
          <p style="margin: 3px 0;"><strong>Boutique Name:</strong> ${vars.shopName}</p>
          <p style="margin: 3px 0;"><strong>Owner Name:</strong> ${vars.ownerName}</p>
          <p style="margin: 3px 0;"><strong>Email:</strong> ${vars.ownerEmail}</p>
          <p style="margin: 3px 0;"><strong>Category:</strong> ${vars.category}</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${FRONTEND_URL}/admin" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 12px; text-transform: uppercase;">Open Admin Portal</a>
        </div>
      `;
      break;

    case 'critical_alert':
      subject = `[CRITICAL ALERT] Platform Notification`;
      body = `
        <h2 style="color: #EF4444; font-family: 'Playfair Display', serif; font-size: 20px; margin-top: 0;">System Security Alert</h2>
        <p>This is a high-priority system alert for the platform administrator:</p>
        <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #f87171;">
          <p style="margin: 0;"><strong>Event:</strong> ${vars.event || 'System Alert'}</p>
          <p style="margin: 5px 0 0 0;"><strong>Details:</strong> ${vars.details || 'Something went wrong.'}</p>
        </div>
      `;
      break;

    case 'platform_summary':
      subject = `Platform Summary: Brotherhood Clothing`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Platform Summary Dashboard</h2>
        <p>Hello Admin, here is the performance audit report for Brotherhood Clothing ending ${new Date().toLocaleDateString()}:</p>
        
        <div style="background-color: rgba(94, 23, 235, 0.1); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 20px; margin: 25px 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
            <tr><td style="padding: 8px 0;">Total Registered Users:</td><td align="right" style="padding: 8px 0; font-weight: bold;">${vars.totalUsers || 0}</td></tr>
            <tr><td style="padding: 8px 0;">Active Boutique Outlets:</td><td align="right" style="padding: 8px 0; font-weight: bold;">${vars.activeShops || 0}</td></tr>
            <tr><td style="padding: 8px 0;">Pending Approvals:</td><td align="right" style="padding: 8px 0; font-weight: bold; color: #ef4444;">${vars.pendingShops || 0}</td></tr>
            <tr><td style="padding: 8px 0;">Total Follow Connections:</td><td align="right" style="padding: 8px 0; font-weight: bold; color: #9f7aea;">${vars.totalFollowers || 0}</td></tr>
          </table>
        </div>
      `;
      break;

    default:
      subject = `Notification from Brotherhood Clothing`;
      body = `
        <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;">Notification</h2>
        <p>${vars.message || 'You have a new update in your dashboard.'}</p>
      `;
  }

  return {
    subject,
    html: wrapBaseLayout(subject, body)
  };
};

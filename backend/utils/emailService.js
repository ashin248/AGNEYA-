const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Agneya <onboarding@resend.dev>', // Change to your verified domain later
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email Send Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email Service Exception:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Order Confirmation Email Template
 */
const sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmed - #${order.razorpayOrderId || order._id.toString().slice(-8)}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #9b51e0;">Order Received!</h2>
      <p>Hi ${user.fullName || 'Valued Customer'},</p>
      <p>We've received your order. Your payment is currently <strong>${order.paymentStatus}</strong>.</p>
      <hr />
      <h3>Order Details:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.price}</li>`).join('')}
      </ul>
      <p>Total Amount: <strong>₹${order.amount}</strong></p>
      <p>Shipping to: ${order.address.addressLine}, ${order.address.city}</p>
      <br />
      <p>Thank you for choosing Agneya!</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

/**
 * Payment Success Email Template
 */
const sendPaymentSuccess = async (user, order) => {
  const subject = `Payment Successful - #${order.razorpayOrderId || order._id.toString().slice(-8)}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #28a745;">Payment Success!</h2>
      <p>Hi ${user.fullName || 'Valued Customer'},</p>
      <p>Your payment for order <strong>#${order.razorpayOrderId}</strong> was successful. We are now processing your designs for printing.</p>
      <hr />
      <p>Current Status: <strong>Printing</strong></p>
      <br />
      <p>We'll notify you when your items are shipped!</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendPaymentSuccess,
};

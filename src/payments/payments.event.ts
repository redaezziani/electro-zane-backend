import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/common/services/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentEvent {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @OnEvent('payment.updated')
  async handlePaymentUpdated(payload: {
    transactionId: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
  }) {
    const { transactionId, status } = payload;

    // Fetch payment
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });
    if (!payment) return;

    // Fetch order with items and SKU info
    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
      include: {
        items: {
          include: {
            sku: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
    if (!order) return;

    // Update order status based on payment
    if (status === 'COMPLETED' && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'COMPLETED', status: 'PROCESSING' },
      });
    } else if (status === 'FAILED' && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }

    // Check if customer email is provided
    if (!order.customerEmail) return; // Skip email if no customer email

    // Build order items HTML with modern styling
    const itemsHtml = order.items
      .map(
        (item) => `
        <div style="display:flex; align-items:center; padding:16px 0; border-bottom:1px solid #f1f3f4;">
          <div style="margin-right:16px;">
            <img src="${
              item.sku.images[0]?.url || ''
            }" alt="${item.productName}" 
                 style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #e8eaed;"/>
          </div>
          <div style="flex:1;">
            <div style="font-weight:500; color:#202124; margin-bottom:4px; font-size:14px;">${item.productName}</div>
            <div style="color:#5f6368; font-size:13px;">Quantity: ${item.quantity}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:500; color:#202124; font-size:14px;">$${item.totalPrice.toFixed(2)}</div>
            <div style="color:#5f6368; font-size:12px;">$${item.unitPrice.toFixed(2)} each</div>
          </div>
        </div>
      `,
      )
      .join('');

    // Email subject
    const subject =
      status === 'COMPLETED' ? 'Payment Successful ✅' : 'Payment Failed ❌';

    // Modern email HTML template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; margin: 0 !important; }
          .content-padding { padding: 20px !important; }
          .header-padding { padding: 24px 20px !important; }
        }
      </style>
    </head>
    <body style="background-color:#f8f9fa; margin:0; padding:24px 0;">
      <div class="email-container" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); overflow:hidden; border:1px solid #e8eaed;">
        
       

        <!-- Content -->
        <div class="content-padding" style="padding:32px 40px;">
          <p style="margin:0 0 24px; color:#202124; font-size:16px; line-height:1.5;">
            Hi <strong>${order.customerName}</strong>,
          </p>
          
          <p style="margin:0 0 32px; color:#5f6368; font-size:16px; line-height:1.6;">
            ${
              status === 'COMPLETED'
                ? 'Great news! Your payment has been successfully processed. Thank you for your purchase! 🎉'
                : 'Unfortunately, your payment could not be processed. Please try again or contact our support team for assistance.'
            }
          </p>

          ${
            status === 'COMPLETED'
              ? `
          <!-- Order Summary Card -->
          <div style="background:#f8f9fa; border-radius:12px; padding:24px; margin-bottom:32px; border:1px solid #e8eaed;">
            <h3 style="margin:0 0 20px; color:#202124; font-size:18px; font-weight:600;">Order Summary</h3>
            
            <!-- Order Items -->
            <div style="margin-bottom:20px;">
              ${itemsHtml}
            </div>

            <!-- Total -->
            <div style="border-top:2px solid #e8eaed; padding-top:16px; margin-top:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:16px; font-weight:600; color:#202124;">Total Amount</div>
                <div style="font-size:20px; font-weight:600; color:#1a73e8;">$${order.totalAmount.toFixed(
                  2,
                )}</div>
              </div>
            </div>
          </div>

              `
              : `
          <!-- Error Details -->
          <div style="background:#fef7f0; border:1px solid #fce8d6; border-radius:12px; padding:20px; margin-bottom:32px;">
            <h4 style="margin:0 0 8px; color:#b3440e; font-size:16px; font-weight:600;">Need Help?</h4>
            <p style="margin:0; color:#8a4a2e; font-size:14px; line-height:1.5;">
              If you continue to experience issues, please contact our support team. We're here to help!
            </p>
          </div>
              `
          }

          
        </div>

        <!-- Footer -->
        <div style="background:#f8f9fa; padding:24px 40px; border-top:1px solid #e8eaed; text-align:center;">
          <p style="margin:0 0 8px; color:#5f6368; font-size:14px;">
            Thank you for choosing us!
          </p>
          <p style="margin:0; color:#5f6368; font-size:12px;">
            If you have any questions, feel free to <a href="#" style="color:#1a73e8; text-decoration:none;">contact our support team</a>.
          </p>
        </div>
      </div>

      <!-- Footer Links -->
      <div style="text-align:center; padding:20px; color:#9aa0a6; font-size:12px;">
        <p style="margin:0;">
          © 2024 Your Company Name. All rights reserved.
        </p>
      </div>
    </body>
    </html>
    `;

    // Send email to customer
    await this.emailService.sendEmail(order.customerEmail, subject, html);
  }
}

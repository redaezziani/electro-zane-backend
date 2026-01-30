import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { createCanvas } from 'canvas';
import * as JsBarcode from 'jsbarcode';
import * as path from 'path';
import * as fs from 'fs';
import { secrets } from '../../config/secrets';
import * as ArabicReshaper from 'arabic-persian-reshaper';
import * as bidi from 'bidi-js';

type SupportedLanguage = 'en' | 'ar' | 'fr' | 'es';

interface InvoiceTranslations {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  orderDetails: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  tracking: string;
  confirmedBy: string;
  customerInfo: string;
  shippingAddress: string;
  billingAddress: string;
  orderItems: string;
  sku: string;
  product: string;
  variant: string;
  qty: string;
  unitPrice: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  notes: string;
  statusConfirmed: string;
  paymentCompleted: string;
  imei: string;
  guarantee: string;
}

@Injectable()
export class PdfService {
  constructor() {}

  private translations: Record<SupportedLanguage, InvoiceTranslations> = {
    en: {
      companyName: 'Soufian Shop',
      companyAddress: 'Avenue Hassan II',
      companyCity: 'Ouazzane, Morocco',
      companyPhone: '+212 612-345678',
      orderDetails: 'ORDER DETAILS',
      orderDate: 'Order Date',
      status: 'Status',
      paymentStatus: 'Payment Status',
      tracking: 'Tracking',
      confirmedBy: 'Confirmed By',
      customerInfo: 'CUSTOMER INFORMATION',
      shippingAddress: 'SHIPPING ADDRESS',
      billingAddress: 'BILLING ADDRESS',
      orderItems: 'ORDER ITEMS',
      sku: 'SKU',
      product: 'Product',
      variant: 'Variant',
      qty: 'Qty',
      unitPrice: 'Unit Price',
      total: 'Total',
      subtotal: 'Subtotal:',
      tax: 'Tax:',
      shipping: 'Shipping:',
      discount: 'Discount:',
      notes: 'NOTES',
      statusConfirmed: 'Confirmed',
      paymentCompleted: 'Paid',
      imei: 'IMEI',
      guarantee:
        '30-Day Guarantee: All products come with a 30-day warranty from date of purchase.',
    },
    ar: {
      companyName: 'متجر سفيان',
      companyAddress: 'شارع الحسن الثاني',
      companyCity: 'وزان، المغرب',
      companyPhone: '+212 612-345678',
      orderDetails: 'تفاصيل الطلب',
      orderDate: 'تاريخ الطلب',
      status: 'الحالة',
      paymentStatus: 'حالة الدفع',
      tracking: 'التتبع',
      confirmedBy: 'تم التأكيد بواسطة',
      customerInfo: 'معلومات العميل',
      shippingAddress: 'عنوان الشحن',
      billingAddress: 'عنوان الفوترة',
      orderItems: 'عناصر الطلب',
      sku: 'رمز المنتج',
      product: 'المنتج',
      variant: 'النوع',
      qty: 'الكمية',
      unitPrice: 'سعر الوحدة',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي:',
      tax: 'الضريبة:',
      shipping: 'الشحن:',
      discount: 'الخصم:',
      notes: 'ملاحظات',
      statusConfirmed: 'مؤكد',
      paymentCompleted: 'مدفوع',
      imei: 'IMEI',
      guarantee:
        'ضمان 30 يوماً: جميع المنتجات تأتي مع ضمان 30 يوماً من تاريخ الشراء.',
    },
    fr: {
      companyName: 'Boutique Soufian',
      companyAddress: 'Avenue Hassan II',
      companyCity: 'Ouazzane, Maroc',
      companyPhone: '+212 612-345678',
      orderDetails: 'DÉTAILS DE LA COMMANDE',
      orderDate: 'Date de commande',
      status: 'Statut',
      paymentStatus: 'Statut de paiement',
      tracking: 'Suivi',
      confirmedBy: 'Confirmé par',
      customerInfo: 'INFORMATIONS CLIENT',
      shippingAddress: 'ADRESSE DE LIVRAISON',
      billingAddress: 'ADRESSE DE FACTURATION',
      orderItems: 'ARTICLES COMMANDÉS',
      sku: 'SKU',
      product: 'Produit',
      variant: 'Variante',
      qty: 'Qté',
      unitPrice: 'Prix unitaire',
      total: 'Total',
      subtotal: 'Sous-total:',
      tax: 'Taxe:',
      shipping: 'Livraison:',
      discount: 'Remise:',
      notes: 'NOTES',
      statusConfirmed: 'Confirmé',
      paymentCompleted: 'Payé',
      imei: 'IMEI',
      guarantee:
        "Garantie 30 jours: Tous les produits sont garantis 30 jours à partir de la date d'achat.",
    },
    es: {
      companyName: 'Tienda Soufian',
      companyAddress: 'Avenida Hassan II',
      companyCity: 'Ouazzane, Marruecos',
      companyPhone: '+212 612-345678',
      orderDetails: 'DETALLES DEL PEDIDO',
      orderDate: 'Fecha de pedido',
      status: 'Estado',
      paymentStatus: 'Estado de pago',
      tracking: 'Seguimiento',
      confirmedBy: 'Confirmado por',
      customerInfo: 'INFORMACIÓN DEL CLIENTE',
      shippingAddress: 'DIRECCIÓN DE ENVÍO',
      billingAddress: 'DIRECCIÓN DE FACTURACIÓN',
      orderItems: 'ARTÍCULOS DEL PEDIDO',
      sku: 'SKU',
      product: 'Producto',
      variant: 'Variante',
      qty: 'Cant',
      unitPrice: 'Precio unitario',
      total: 'Total',
      subtotal: 'Subtotal:',
      tax: 'Impuesto:',
      shipping: 'Envío:',
      discount: 'Descuento:',
      notes: 'NOTAS',
      statusConfirmed: 'Confirmado',
      paymentCompleted: 'Pagado',
      imei: 'IMEI',
      guarantee:
        'Garantía de 30 días: Todos los productos tienen una garantía de 30 días desde la fecha de compra.',
    },
  };

  private getFontPath(lang: SupportedLanguage): string | undefined {
    if (lang === 'ar') {
      // Use public folder path which is accessible in both dev and production
      return path.join(process.cwd(), 'public/fonts/arabic-font.otf');
    }
    return undefined; // Use default PDFKit fonts for other languages
  }

  /**
   * Properly formats Arabic text for PDF rendering
   * Uses arabic-persian-reshaper for character shaping and bidi-js for text direction
   */
  private formatArabicText(text: string): string {
    // Check if text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    if (!hasArabic) {
      return text; // Don't process non-Arabic text
    }

    try {
      // Step 1: Reshape Arabic characters to their proper forms
      const reshaped = ArabicReshaper.ArabicShaper(text);

      // Step 2: Apply bidirectional algorithm for proper RTL rendering
      const bidiText = bidi(reshaped);

      return bidiText;
    } catch (error) {
      console.error('Error formatting Arabic text:', error);
      return text; // Return original text if processing fails
    }
  }

  /**
   * Applies RTL formatting to text if language is Arabic
   */
  private formatRTL(text: string, isRTL: boolean): string {
    if (!isRTL) return text;
    return this.formatArabicText(text);
  }

  private generateBarcodeBase64(sku: string): string {
    const canvas = createCanvas(300, 100);
    JsBarcode(canvas, sku, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true,
    });
    return canvas.toDataURL('image/png');
  }

  private formatAddress(address: any): string[] {
    if (!address) return ['Address not provided'];

    // Handle both string and JSON address formats
    if (typeof address === 'string') {
      if (address === 'n/a' || address.trim() === '')
        return ['Address not provided'];
      return [address];
    }

    // Handle JSON address object
    if (typeof address === 'object') {
      const lines: string[] = [];

      if (address.street) lines.push(address.street);
      if (address.street2) lines.push(address.street2);

      // City, State, ZIP on one line
      const cityStateZip = [address.city, address.state, address.zipCode]
        .filter(Boolean)
        .join(', ');
      if (cityStateZip) lines.push(cityStateZip);

      if (address.country) lines.push(address.country);

      return lines.length > 0 ? lines : ['Address not provided'];
    }

    return ['Address not provided'];
  }

  private safe(value: any, defaultValue: string = 'N/A'): string {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return String(value).toLowerCase() === 'n/a' ? defaultValue : String(value);
  }

  // Helper to truncate text if too long for a column
  private truncateText(
    doc: PDFKit.PDFDocument,
    text: string,
    maxWidth: number,
  ): string {
    let truncated = text;
    while (doc.widthOfString(truncated) > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    if (truncated.length < text.length) {
      truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
  }

  async generateOrderPdf(
    order: any,
    language: SupportedLanguage = 'es',
    imeiData?: Record<string, string>, // Map of itemId -> IMEI number
  ): Promise<{ url: string; fileId: string }> {
    const t = this.translations[language];
    const customFont = this.getFontPath(language);
    const isRTL = language === 'ar';

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    // Register custom font if needed
    if (customFont) {
      try {
        doc.registerFont('CustomFont', customFont);
      } catch (error) {
        console.error('Error registering custom font:', error);
      }
    }

    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const pdfBufferPromise = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );

    const pageWidth = doc.page.width - 100; // Account for margins
    let currentY = 80;

    // Set font based on language
    const fontName = customFont ? 'CustomFont' : 'Helvetica';
    const fontBold = customFont ? 'CustomFont' : 'Helvetica-Bold';

    // Add watermark in center of page
    const logoPath = path.resolve(process.cwd(), 'public/images/logo/img.png');
    if (fs.existsSync(logoPath)) {
      try {
        const centerX = doc.page.width / 2 - 100;
        const centerY = doc.page.height / 2 - 100;
        doc.save();
        doc.opacity(0.15); // Slightly more visible watermark
        doc.image(logoPath, centerX, centerY, { width: 200, height: 200 });
        doc.opacity(1); // Reset opacity
        doc.restore();
      } catch (error) {
        console.error('Error adding watermark:', error);
      }
    }

    // Company Header with Logo
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 40, { width: 60, height: 60 });
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    doc
      .fontSize(14)
      .font(fontBold)
      .fillColor('#333333')
      .text('Electrozane', 120, 50, {
        align: 'left',
      });
    doc
      .fontSize(10)
      .font(fontName)
      .fillColor('#666666')
      .text('Ouazzane, Morocco', 120, 70, {
        align: 'left',
      });
    doc.text('+212 661-987415', 120, 85, { align: 'left' });

    currentY = 160;

    // Order Details Section
    doc.fontSize(12).font(fontBold).fillColor('#333333');
    doc.text(this.formatRTL(t.orderDetails, isRTL), 50, currentY, {
      align: isRTL ? 'right' : 'left',
    });
    currentY += 20;

    doc.fontSize(10).font(fontName).fillColor('#000000');
    const orderDateText = `${t.orderDate}: ${new Date(order.createdAt).toLocaleDateString()}`;
    // Always show status as Confirmed (translated)
    const statusText = `${t.status}: ${t.statusConfirmed}`;

    if (isRTL) {
      doc.text(this.formatRTL(statusText, isRTL), 50, currentY, {
        align: 'right',
      });
      currentY += 15;
      doc.text(this.formatRTL(orderDateText, isRTL), 50, currentY, {
        align: 'right',
      });
      currentY += 15;
    } else {
      doc.text(orderDateText, 50, currentY);
      doc.text(statusText, 300, currentY);
      currentY += 15;
    }

    // Always show payment status as Paid (translated)
    const paymentStatusText = `${t.paymentStatus}: ${t.paymentCompleted}`;
    doc.text(this.formatRTL(paymentStatusText, isRTL), 50, currentY, {
      align: isRTL ? 'right' : 'left',
    });

    if (order.trackingNumber) {
      const trackingText = `${t.tracking}: ${this.safe(order.trackingNumber)}`;
      doc.text(
        this.formatRTL(trackingText, isRTL),
        isRTL ? 50 : 300,
        currentY,
        {
          align: isRTL ? 'right' : 'left',
        },
      );
    }
    currentY += 15;

    // Display confirmed by admin if available
    if (order.confirmedBy?.name || order.confirmedBy?.email) {
      const confirmedName =
        order.confirmedBy.name || order.confirmedBy.email || 'Admin';
      const confirmedByText = `${t.confirmedBy}: ${this.safe(confirmedName)}`;
      doc.text(this.formatRTL(confirmedByText, isRTL), 50, currentY, {
        align: isRTL ? 'right' : 'left',
      });
      currentY += 15;
    }

    currentY += 15;

    // Customer Information Section
    doc.fontSize(12).font(fontBold).fillColor('#333333');
    doc.text(this.formatRTL(t.customerInfo, isRTL), 50, currentY, {
      align: isRTL ? 'right' : 'left',
    });
    currentY += 20;

    doc.fontSize(10).font(fontName).fillColor('#000000');

    // Shipping Address Box
    doc.rect(50, currentY, pageWidth / 2 - 10, 80).stroke();
    doc
      .fontSize(10)
      .font(fontBold)
      .text(this.formatRTL(t.shippingAddress, isRTL), 60, currentY + 10, {
        align: isRTL ? 'right' : 'left',
      });
    doc.fontSize(9).font(fontName);

    let shippingY = currentY + 25;
    doc.text(`${this.safe(order.shippingName)}`, 60, shippingY, {
      align: isRTL ? 'right' : 'left',
    });
    shippingY += 12;

    if (order.shippingEmail && order.shippingEmail !== 'n/a') {
      doc.text(`${this.safe(order.shippingEmail)}`, 60, shippingY, {
        align: isRTL ? 'right' : 'left',
      });
      shippingY += 12;
    }

    if (order.shippingPhone && order.shippingPhone !== 'n/a') {
      doc.text(`${this.safe(order.shippingPhone)}`, 60, shippingY, {
        align: isRTL ? 'right' : 'left',
      });
      shippingY += 12;
    }

    // Format and display shipping address
    const shippingAddressLines = this.formatAddress(order.shippingAddress);
    shippingAddressLines.forEach((line) => {
      if (shippingY < currentY + 75) {
        doc.text(line, 60, shippingY, { align: isRTL ? 'right' : 'left' });
        shippingY += 10;
      }
    });

    // Billing Address Box (if different)
    const shouldShowBillingAddress =
      order.billingAddress &&
      JSON.stringify(order.billingAddress) !==
        JSON.stringify(order.shippingAddress);

    if (shouldShowBillingAddress) {
      doc.rect(pageWidth / 2 + 50, currentY, pageWidth / 2 - 10, 80).stroke();
      doc
        .fontSize(10)
        .font(fontBold)
        .text(
          this.formatRTL(t.billingAddress, isRTL),
          pageWidth / 2 + 60,
          currentY + 10,
          {
            align: isRTL ? 'right' : 'left',
          },
        );
      doc.fontSize(9).font(fontName);

      let billingY = currentY + 25;
      doc.text(
        `${this.safe(order.billingName)}`,
        pageWidth / 2 + 60,
        billingY,
        { align: isRTL ? 'right' : 'left' },
      );
      billingY += 12;

      if (order.billingEmail && order.billingEmail !== 'n/a') {
        doc.text(
          `${this.safe(order.billingEmail)}`,
          pageWidth / 2 + 60,
          billingY,
          { align: isRTL ? 'right' : 'left' },
        );
        billingY += 12;
      }

      // Format and display billing address
      const billingAddressLines = this.formatAddress(order.billingAddress);
      billingAddressLines.forEach((line) => {
        if (billingY < currentY + 75) {
          doc.text(line, pageWidth / 2 + 60, billingY, {
            align: isRTL ? 'right' : 'left',
          });
          billingY += 10;
        }
      });
    }

    currentY += 100;

    // Items Section
    doc.fontSize(12).font(fontBold).fillColor('#333333');
    doc.text(this.formatRTL(t.orderItems, isRTL), 50, currentY, {
      align: isRTL ? 'right' : 'left',
    });
    currentY += 25;

    // Table Header with better spacing - Updated layout
    const tableStartY = currentY;
    const tableHeaders = [
      { text: t.product, x: 50, width: 90 },
      { text: t.variant, x: 165, width: 75 },
      { text: t.qty, x: 245, width: 35 },
      { text: t.unitPrice, x: 285, width: 70 },
      { text: t.total, x: 360, width: 60 },
      { text: t.imei, x: 425, width: 70 },
    ];

    // Header background
    doc.rect(50, currentY - 5, pageWidth, 20).fill('#e8f4f8');
    doc.fillColor('#000000');

    // Header text
    doc.fontSize(9).font(fontBold);
    tableHeaders.forEach((header) => {
      const align = [t.qty, t.unitPrice, t.total, t.imei].includes(header.text)
        ? 'right'
        : isRTL
          ? 'right'
          : 'left';
      doc.text(this.formatRTL(header.text, isRTL), header.x, currentY + 2, {
        width: header.width,
        align: align,
      });
    });

    currentY += 25;

    // Table border
    doc.rect(50, tableStartY - 5, pageWidth, 20).stroke();
    doc
      .moveTo(50, currentY - 5)
      .lineTo(50 + pageWidth, currentY - 5)
      .stroke();

    // Items
    doc.fontSize(8).font(fontName);
    order.items.forEach((item, index) => {
      const rowY = currentY;
      const rowHeight = 22;

      // Alternate row background
      if (index % 2 === 1) {
        doc.rect(50, rowY - 2, pageWidth, rowHeight).fill('#fafafa');
        doc.fillColor('#000000');
      }

      // Get product name and variant from item
      const productName = this.safe(item.productName || item.name);
      const variantName = this.safe(item.variantName || '');
      const itemIMEI = imeiData && item.id ? imeiData[item.id] : '';

      // Truncate text to fit new widths
      const productText = this.truncateText(
        doc,
        this.formatRTL(productName, isRTL),
        110,
      );
      const variantText = this.truncateText(
        doc,
        this.formatRTL(variantName, isRTL),
        75,
      );

      // Product name (smaller font)
      doc.fontSize(7);
      doc.text(productText, 50, rowY + 3, {
        width: 110,
        align: isRTL ? 'right' : 'left',
      });

      // Variant (smaller font)
      doc.text(variantText, 165, rowY + 3, {
        width: 75,
        align: isRTL ? 'right' : 'left',
      });

      // Reset font size for other columns
      doc.fontSize(8);

      // Quantity
      doc.text(this.safe(item.quantity), 245, rowY + 3, {
        width: 35,
        align: 'right',
      });

      // Unit price
      doc.text(
        `${this.safe(item.unitPrice?.toFixed?.(2) ?? '0.00')} DH`,
        285,
        rowY + 3,
        { width: 70, align: 'right' },
      );

      // Total price
      doc.text(
        `${this.safe(item.totalPrice?.toFixed?.(2) ?? '0.00')} DH`,
        360,
        rowY + 3,
        { width: 60, align: 'right' },
      );

      // IMEI (if provided for this item)
      if (itemIMEI) {
        doc.fontSize(7).text(itemIMEI, 425, rowY + 3, {
          width: 80,
          align: 'right',
        });
        doc.fontSize(8); // Reset font size
      }

      currentY += rowHeight;
    });

    // Table bottom border
    doc
      .moveTo(50, currentY)
      .lineTo(50 + pageWidth, currentY)
      .stroke();
    currentY += 20;

    // Order Summary
    const summaryStartX = pageWidth - 150;
    const summaryItems = [
      {
        label: t.subtotal,
        value: `${this.safe(order.subtotal?.toFixed?.(2) ?? '0.00')} DH`,
      },
      {
        label: t.tax,
        value: `${this.safe(order.taxAmount?.toFixed?.(2) ?? '0.00')} DH`,
      },
      {
        label: t.shipping,
        value: `${this.safe(order.shippingAmount?.toFixed?.(2) ?? '0.00')} DH`,
      },
      {
        label: t.discount,
        value: `-${this.safe(order.discountAmount?.toFixed?.(2) ?? '0.00')} DH`,
      },
    ];

    doc.fontSize(9).font(fontName);
    summaryItems.forEach((item) => {
      if (isRTL) {
        // For RTL: value on left, label on right
        doc.text(item.value, summaryStartX, currentY, {
          width: 70,
          align: 'left',
        });
        doc.text(
          this.formatRTL(item.label, isRTL),
          summaryStartX + 70,
          currentY,
          {
            width: 80,
            align: 'right',
          },
        );
      } else {
        // For LTR: label on left, value on right
        doc.text(item.label, summaryStartX, currentY, {
          width: 80,
          align: 'left',
        });
        doc.text(item.value, summaryStartX + 80, currentY, {
          width: 70,
          align: 'right',
        });
      }
      currentY += 15;
    });

    // Total with background
    doc.rect(summaryStartX - 5, currentY - 2, 160, 18).fill('#e8e8e8');
    doc.fillColor('#000000');
    doc.fontSize(11).font(fontBold);
    const totalLabel = this.formatRTL(t.total.toUpperCase() + ':', isRTL);

    if (isRTL) {
      // For RTL: total amount on left, label on right
      doc.text(
        `${this.safe(order.totalAmount?.toFixed?.(2) ?? '0.00')} DH`,
        summaryStartX,
        currentY + 2,
        {
          width: 70,
          align: 'left',
        },
      );
      doc.text(totalLabel, summaryStartX + 70, currentY + 2, {
        width: 80,
        align: 'right',
      });
    } else {
      // For LTR: label on left, total amount on right
      doc.text(totalLabel, summaryStartX, currentY + 2, {
        width: 80,
        align: 'left',
      });
      doc.text(
        `${this.safe(order.totalAmount?.toFixed?.(2) ?? '0.00')} DH`,
        summaryStartX + 80,
        currentY + 2,
        {
          width: 70,
          align: 'right',
        },
      );
    }
    currentY += 40;

    // Notes section
    if (order.notes && order.notes !== 'n/a') {
      doc.fontSize(10).font(fontBold).fillColor('#333333');
      doc.text(this.formatRTL(t.notes, isRTL), 50, currentY, {
        align: isRTL ? 'right' : 'left',
      });
      currentY += 15;
      doc.fontSize(9).font(fontName).fillColor('#000000');
      doc.text(order.notes, 50, currentY, {
        width: pageWidth,
        align: isRTL ? 'right' : 'left',
      });
      currentY += 30;
    }

    // Guarantee section
    doc.fontSize(10).font(fontBold).fillColor('#333333');
    const guaranteeText = this.formatRTL(t.guarantee, isRTL);
    doc.text(guaranteeText, 50, currentY, {
      width: pageWidth,
      align: 'center',
    });
    currentY += 30;

    // Barcode
    try {
      const barcodeBase64 = this.generateBarcodeBase64(
        this.safe(order.orderNumber),
      );
      const barcodeBuffer = Buffer.from(barcodeBase64.split(',')[1], 'base64');
      doc.image(barcodeBuffer, doc.page.width / 2 - 100, currentY, {
        width: 200,
        height: 50,
      });
    } catch (error) {
      console.error('Error generating barcode:', error);
    }

    doc.end();
    const pdfBuffer = await pdfBufferPromise;

    // Save PDF locally instead of uploading to ImageKit
    const fileName = `${this.safe(order.orderNumber)}-${language}.pdf`;
    const publicDir = path.resolve(process.cwd(), 'public/pdfs/orders');

    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save PDF file
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Return URL and fileId (use filename as fileId)
    const url = `${secrets.BaseUrl}/pdfs/orders/${fileName}`;
    const fileId = fileName;

    console.log(`✅ Saved PDF to: ${filePath}`);
    console.log(`📄 PDF URL: ${url}`);

    return { url, fileId };
  }
}

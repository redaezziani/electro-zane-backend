// src/barcode/barcode.service.ts
import { Injectable } from '@nestjs/common';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

@Injectable()
export class BarcodeService {
  // Method to generate a unique SKU
  generateSKU(prefix: string = 'SKU'): string {
    const randomNum = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0'); // 6-digit number
    return `${prefix}-${randomNum}`;
  }

  // Method to generate barcode as Base64
  generateBarcode(data: string): string {
    const canvasWidth = 300;
    const canvasHeight = 100;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    JsBarcode(canvas, data, {
      format: 'CODE128', 
      displayValue: true,
      fontSize: 18,
      height: 60,
      width: 2,
    });

    return canvas.toDataURL(); 
  }

  generateSKUWithBarcode(prefix?: string) {
    const sku = this.generateSKU(prefix);
    const barcode = this.generateBarcode(sku);
    return { sku, barcode };
  }
}

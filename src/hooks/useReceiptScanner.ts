import { useState } from 'react';
import { parseReceipt, type ReceiptParseResult } from '@/utils/receiptParser';

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'done' | 'error';
type ScanErrorType = 'permission_denied' | 'cancelled' | 'ocr_failed' | 'unknown';

interface ScanError {
  type: ScanErrorType;
  message: string;
}

export function useReceiptScanner() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<ReceiptParseResult | null>(null);
  const [error, setError] = useState<ScanError | null>(null);

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  const processBase64 = async (base64: string) => {
    setStatus('processing');
    try {
      const { CapacitorPluginMlKitTextRecognition } = await import(
        '@pantrist/capacitor-plugin-ml-kit-text-recognition'
      );
      const { text } = await CapacitorPluginMlKitTextRecognition.detectText({
        base64Image: base64,
      });
      const parsed = parseReceipt(text);
      setResult(parsed);
      setStatus('done');
    } catch {
      setError({ type: 'ocr_failed', message: 'OCR processing failed.' });
      setStatus('error');
    }
  };

  const scan = async (source: 'camera' | 'gallery') => {
    const isNative = typeof (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform === 'function' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor!.isNativePlatform!();
    if (!isNative) {
      setError({ type: 'ocr_failed', message: 'Receipt scanning is only supported in the mobile app.' });
      setStatus('error');
      return;
    }
    setStatus('scanning');
    setError(null);
    try {
      const { Camera, CameraSource, CameraResultType } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        resultType: CameraResultType.Base64,
        quality: 90,
      });
      if (!photo.base64String) {
        setError({ type: 'ocr_failed', message: 'Failed to load image.' });
        setStatus('error');
        return;
      }
      await processBase64(photo.base64String);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/permission/i.test(msg) || /denied/i.test(msg)) {
        setError({ type: 'permission_denied', message: 'Camera permission is required.' });
      } else if (/cancel/i.test(msg) || /user cancelled/i.test(msg)) {
        setError({ type: 'cancelled', message: 'Cancelled.' });
        setStatus('idle');
        return;
      } else {
        setError({ type: 'unknown', message: msg });
      }
      setStatus('error');
    }
  };

  const scanFromCamera = () => scan('camera');
  const scanFromGallery = () => scan('gallery');

  return { status, result, error, scanFromCamera, scanFromGallery, reset };
}

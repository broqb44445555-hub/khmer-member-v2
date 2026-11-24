import type { CompressedPhotoResult } from '../types/member';

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('មិនអាចអានឯកសាររូបភាពបានទេ'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('ទម្រង់រូបភាពមិនត្រឹមត្រូវ'));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function renderResizedCanvas(
  img: HTMLImageElement,
  maxWidth: number
): HTMLCanvasElement {
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('មិនអាចដំណើរការបង្ហាប់រូបភាពបានទេ');
  }

  // Paint white backdrop so transparent PNG/WebP photos export cleanly as JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas;
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('បង្កើតរូបភាព JPEG មិនបានជោគជ័យ'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

function estimateBase64Bytes(dataUrl: string): number {
  const base64Part = dataUrl.split(',')[1] || '';
  return Math.round((base64Part.length * 3) / 4);
}

/**
 * Compresses an uploaded image client-side into two optimized JPEG outputs:
 * 1) High quality (max width 600px, JPEG 0.7) for Telegram Bot sendPhoto.
 * 2) Small thumbnail (max width 150px, JPEG 0.5) base64 string for Google Sheets storage.
 */
export async function compressUploadedPhoto(
  file: File
): Promise<CompressedPhotoResult> {
  const img = await loadImageFromFile(file);

  const highQualityCanvas = renderResizedCanvas(img, 600);
  const telegramBlob = await canvasToJpegBlob(highQualityCanvas, 0.7);
  const previewUrl = highQualityCanvas.toDataURL('image/jpeg', 0.7);

  const thumbnailCanvas = renderResizedCanvas(img, 150);
  const sheetsThumbnail = thumbnailCanvas.toDataURL('image/jpeg', 0.5);

  return {
    telegramBlob,
    previewUrl,
    sheetsThumbnail,
    telegramSizeKb: Math.max(1, Math.round(telegramBlob.size / 1024)),
    thumbnailSizeKb: Math.max(1, Math.round(estimateBase64Bytes(sheetsThumbnail) / 1024)),
  };
}

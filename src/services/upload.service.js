import { STORAGE_BUCKET } from '../constants/api';
import supabase from '../lib/supabase';

const MAX_DIMENSION = 1920; // cukup untuk full-bleed hero/banner; foto HP sering jauh lebih besar dari ini

// Downscale sebelum upload kalau file lebih besar dari MAX_DIMENSION - Supabase
// Free plan tidak punya Image Transformation API (lihat utils/imageUrl.js), jadi
// kompresi harus terjadi di sini, bukan saat render.
async function compressIfOversized(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (Math.max(width, height) <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  const scale = MAX_DIMENSION / Math.max(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'; // pertahankan PNG (transparansi), lainnya jadi JPEG
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outType, 0.85));
  return blob ? new File([blob], file.name, { type: outType }) : file;
}

export const uploadService = {
  async uploadImage(file) {
    const compressed = await compressIfOversized(file);
    const ext      = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    // Nama file UUID unik per upload - URL lama tidak pernah dipakai ulang,
    // jadi aman di-cache selamanya (immutable).
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, compressed, { cacheControl: '31536000', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    return data.publicUrl;
  },

  async deleteImage(url) {
    const filename = url.split('/').pop();
    await supabase.storage.from(STORAGE_BUCKET).remove([filename]);
  },
};

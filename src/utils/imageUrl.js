/**
 * Bangun URL gambar Supabase yang sudah di-resize lewat endpoint Image Transformation.
 * Mengubah `/object/public/` → `/render/image/public/` dan menambah query width/quality/format.
 * Aman: jika `url` bukan URL Supabase storage publik, kembalikan apa adanya (fallback).
 *
 * @param {string} url   URL publik Supabase (atau lainnya)
 * @param {object} opts  { width, height, quality }
 */
export function supaImg(url, { width, height, quality = 75 } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/storage/v1/object/public/')) return url;

  const base = url.replace('/object/public/', '/render/image/public/');
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('resize', 'cover');
  return `${base}?${params.toString()}`;
}

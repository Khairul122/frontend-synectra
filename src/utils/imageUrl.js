/**
 * Kembalikan URL publik Supabase apa adanya.
 * Sebelumnya fungsi ini mengarahkan ke endpoint Image Transformation
 * (`/render/image/public/`), tapi endpoint itu butuh Supabase Pro plan —
 * di Free plan responnya error, bukan gambar, sehingga gambar tampak
 * hilang/rusak. Reaktifkan resize hanya jika project sudah Pro plan.
 *
 * @param {string} url   URL publik Supabase (atau lainnya)
 */
export function supaImg(url) {
  return url;
}

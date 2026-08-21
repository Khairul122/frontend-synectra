# design.md — Synectra Frontend

> Dokumen referensi sistem desain landing page & UI Synectra. Menjelaskan token, prinsip, dan struktur komponen yang berlaku saat ini (hasil redesign "soften neubrutalism"). Untuk aturan kode/struktur folder secara umum, lihat `CLAUDE.md`.

---

## Arah Desain — Softened Neubrutalism

Identitas brand neubrutalist dipertahankan (border hitam tebal, warna kuning bold, motif shadow offset, sistem 3 font) tapi eksekusinya dilembutkan:

| Elemen | Sebelum | Sekarang |
|---|---|---|
| Shadow | Offset keras, 0 blur | Offset pendek + blur ambient halus (2 layer) |
| Sudut | Selalu tajam (`rounded-none`) | Radius kecil-sedang (4–16px) |
| Border | `border-2`/`border-4` hitam | Tidak berubah — tetap ciri khas |
| Warna | Flat, tanpa gradient | Tidak berubah — tanpa gradient/glassmorphism |
| Tipografi | Sangat besar, tight | Skala di-trim di titik paling ekstrem (hero, CTA, angka statistik) |

**Yang sengaja TIDAK dipakai:** gradient sebagai elemen dekoratif, glassmorphism, `rounded-full`/`rounded-2xl`/`rounded-3xl` default Tailwind pada elemen brand, shadow blur besar ala "modern SaaS" generik. Brutalist "spine" (border tegas + offset shadow + color blocking) harus tetap terbaca.

---

## Design Tokens

Semua token didefinisikan di **`src/index.css`** dalam blok `@theme` (Tailwind v4 CSS-first — tidak ada `tailwind.config.js`). Tailwind otomatis meng-generate utility class dari tiap key.

### Warna

```css
--color-neu-black:   #0D0D0D   /* teks utama, border, bg gelap */
--color-neu-white:   #FAFAFA   /* teks di atas bg gelap, bg card */
--color-neu-primary: #FFD000   /* kuning — CTA utama, aksen brand */
--color-neu-accent:  #FF5C5C   /* merah — alert, badge promo */
--color-neu-blue:    #4D61FF   /* link, info */
--color-neu-green:   #00C48C   /* sukses, status aktif */
--color-neu-purple:  #A855F7   /* badge/label sekunder */
--color-neu-bg:      #F5F0E8   /* krem — background utama halaman */
```
Dipakai lewat class `bg-neu-*`, `text-neu-*`, `border-neu-*`. Untuk teks sekunder, pakai opacity di angka yang sama: `text-neu-black/60`, `/55`, `/50`, `/40` — pola ini sudah konsisten dipakai di seluruh section, jangan bikin skala abu-abu baru.

### Tipografi

```css
--font-display: "Space Grotesk", sans-serif   /* heading, label uppercase, tombol */
--font-body:    "DM Sans", sans-serif          /* paragraf, deskripsi */
--font-mono:    "JetBrains Mono", monospace   /* label kecil, tag, angka teknis */
```
Font di-self-host via `@fontsource/*` (bukan Google Fonts CDN). Heading pakai `font-display font-bold` atau `font-black`; body pakai `font-body`.

### Radius

```css
--radius-neu-sm: 4px   /* tombol, badge/chip, input, nav pills */
--radius-neu:    6px   /* card standar, gambar, modal content */
--radius-neu-lg: 10px  /* thumbnail besar, card outer (package/software/portfolio) */
--radius-neu-xl: 16px  /* window/panel besar (MockIDE), modal dialog */
```
Class: `rounded-neu-sm`, `rounded-neu`, `rounded-neu-lg`, `rounded-neu-xl`. **Jangan** pakai `rounded-full`/`rounded-2xl`/`rounded-3xl` Tailwind default di elemen brand — kecuali elemen yang memang harus lingkaran (avatar, dot indicator).

### Shadow

Dua lapis: offset hitam pendek (kesan "sticker" brutalist) + blur ambient halus (kesan lembut). Semua warna base `rgba(13,13,13,...)` (hitam brand).

```css
--shadow-neu-sm: 1px 1px 0px rgba(13,13,13,.92), 3px 4px 8px -2px rgba(13,13,13,.16)
--shadow-neu:    2px 2px 0px rgba(13,13,13,.92), 5px 7px 14px -3px rgba(13,13,13,.18)
--shadow-neu-md: 3px 3px 0px rgba(13,13,13,.92), 7px 10px 20px -4px rgba(13,13,13,.20)
--shadow-neu-lg: 4px 4px 0px rgba(13,13,13,.92), 9px 13px 26px -5px rgba(13,13,13,.22)
--shadow-neu-xl: 6px 6px 0px rgba(13,13,13,.92), 12px 17px 34px -6px rgba(13,13,13,.24)
```
Class: `shadow-neu-sm` → `shadow-neu-xl`. Untuk shadow berwarna non-hitam (mis. tombol kuning), pola manual: offset pendek + blur senada warna, contoh `shadow-[2px_2px_0px_#FFD000,5px_7px_14px_-3px_rgba(255,208,0,.25)]` — lihat CTA button di `Hero.jsx` sebagai referensi. Jangan pakai `shadow-lg`/`shadow-md` Tailwind default (blur murni tanpa offset — hilangkan karakter brutalist-nya).

### Spacing / ritme section

- Section konten biasa (Services, Packages, Software): `py-16 lg:py-20`
- Section "showcase" (About, Portfolio, Why-Choose-Us, How-It-Works, Contact): `py-20 lg:py-24`
- Marquee, Banners: kompak, `py-3`/`py-10` — tidak ikut ritme di atas (memang dirancang sebagai strip pendek)

---

## Animasi

Library yang dipakai — **jangan tambah dependency animasi baru**, semua kebutuhan sudah tercakup:

| Library | Dipakai untuk |
|---|---|
| `framer-motion` | Scroll-entrance semua section (`whileInView`), transisi modal, floating CTA |
| `gsap` | Hero title reveal (`HeroReveal`), transisi antar halaman (`usePageTransition`) |
| `animejs` | Counter angka di Stats (`AnimatedCounter`) |
| `lenis` | Smooth scroll desktop-only (mati otomatis di mobile via `useIsDesktop()`) |
| CSS keyframes (`index.css`) | Marquee tech-stack, `float`, `pulse-slow` |

### Standar timing

Didefinisikan di **`src/components/landing/animations.js`**:
```js
export const EASE = [0.22, 1, 0.36, 1];   // senada dengan power3.out GSAP di Hero
export const STAGGER = 0.07;               // jarak antar item saat stagger

fadeUp(delay)    // opacity 0→1, y 40→0
fadeLeft(delay)  // opacity 0→1, x -40→0
scaleUp(delay)   // opacity 0→1, scale .88→1
cardAnim(delay)  // opacity 0→1, y 30→0 — untuk card di grid/slider
```
Semua durasi `0.55s`. Untuk list panjang, cap stagger dengan `Math.min(i * STAGGER, 0.42)` supaya item terakhir tidak menunggu terlalu lama. Semua section baru yang butuh entrance animation wajib pakai salah satu dari 4 helper ini lewat `<motion.div {...fadeUp(delay)}>` — jangan tulis object transition manual.

`prefers-reduced-motion` dihormati otomatis oleh `useIsDesktop()` (mematikan Lenis) dan default behavior framer-motion.

---

## Struktur Komponen — `src/components/landing/`

Landing page (`src/pages/LandingPage.jsx`) adalah orchestrator tipis: menyimpan state, data-fetching, dan handler, lalu merender komponen section di bawah ini sebagai props-driven children.

**Section (urutan render di halaman):**
`Navbar` → `Hero` → `TechMarquee` → `Stats` → `Services` → `About` → `Packages` → `Banners` → `Software` → `Portfolio` → `WhyChooseUs` → `HowItWorks` → `Contact` → `FeedbackSection` → `CTAFinal` → `Footer` → `FloatingCTA`

**Sub-komponen pendukung:** `PackageCard`, `PortfolioModal`, `SoftwareDetailModal`, `MockIDE`

**Modul bersama (bukan komponen):**
- `animations.js` — variant framer-motion + `EASE`/`STAGGER` (lihat di atas)
- `hooks.js` — `useLenis`, `usePageTransition`, `useLang`, `fixContactUrl` (murni logic, tanpa JSX)
- `helpers.jsx` — `HeroReveal`, `AnimatedCounter`, `LetterReveal` (komponen kecil dengan JSX)

> Catatan: `animations.js`/`hooks.js`/`helpers.jsx` sengaja dipisah per jenis export (bukan campur komponen + non-komponen dalam satu file) — ini syarat agar React Fast Refresh tetap jalan saat dev.

Setiap section men-import `useTranslation()` sendiri (bukan menerima `t` sebagai prop) — semua teks landing page didorong lewat i18next (`src/locales/en.json` / `id.json`, key `landing.*`). Data (portfolios, packages, dst) dan handler (transitionTo, scrollTo, showToast, dst) tetap di-passing sebagai props dari `LandingPage.jsx`, karena itu state yang dipakai bareng oleh banyak section.

---

## Responsive

Breakpoint Tailwind default: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px — tidak ada breakpoint custom. Pola yang sudah ada dan wajib dipertahankan:
- Navbar: nav link `hidden md:flex`, hamburger `sm:hidden`
- Slider horizontal drag (Packages/Software/Feedback) sebagai pengganti grid di mobile — bukan `overflow-x-scroll` biasa, pakai pola `onTouchStart/Move/End` yang sudah ada
- `useIsDesktop()` (`min-width:1024px` + bukan `prefers-reduced-motion`) menentukan kapan Lenis aktif — di bawah itu scroll native, harus tetap begitu
- Mobile sticky CTA bar (`sm:hidden`, fixed bottom) + back-to-top button — lihat `FloatingCTA.jsx`

---

## Kapan mengubah dokumen ini

Update `design.md` setiap kali token di `@theme` (`src/index.css`) berubah, section baru ditambahkan/dihapus dari `src/components/landing/`, atau standar animasi (`animations.js`) berubah. Dokumen ini harus selalu sinkron dengan kondisi kode aktual — jangan biarkan basi seperti yang sempat terjadi pada bagian desain di `CLAUDE.md` sebelum redesign ini.

# design.md — Synectra Frontend

> Dokumen referensi sistem desain landing page & UI Synectra. Menjelaskan token, prinsip, dan struktur komponen yang berlaku saat ini (hasil redesign "soften neubrutalism"). Untuk aturan kode/struktur folder secara umum, lihat `CLAUDE.md`.

---

## Arah Desain — Full-Width Neubrutalism (redesign Stitch "Modern Interactive 3D Landing Page")

Landing page (`src/pages/LandingPage.jsx` + `src/components/landing/*`) memakai bahasa visual Stitch (border tebal, warna solid berselang-seling, shadow offset keras, pill mono-label header) tapi **section-nya full-bleed edge-to-edge** — bukan kartu mengambang. Tiap `<section>` selebar viewport penuh dengan `border-b-4 border-neu-black` sebagai pemisah, kontennya di-center lewat div `max-w-7xl mx-auto px-4 lg:px-6` di dalamnya. Ini sempat dicoba sebagai kartu terpisah bermargin (`.module-card`, sudah dihapus) tapi diputuskan kembali ke full-width.

| Elemen | Halaman lain (dashboard/login/dll) | Landing page |
|---|---|---|
| Shadow (elemen di dalam section — card, badge, tombol) | `shadow-neu-*` — offset pendek + blur ambient halus (2 layer) | `shadow-neu-solid-*`/`shadow-neu-module-sm` — offset keras, 0 blur, ala sticker |
| Border | `border-2` | `border-4` |
| Radius elemen dalam | `rounded-neu` (6px) | `rounded-neu-lg`/`rounded-neu-xl` (10–16px) |
| Section itu sendiri | card dengan radius | **full-bleed, tanpa radius**, dipisahkan `border-b-4` |
| Jarak antar section | `py-16`/`py-20` per section | sama — `py-16 lg:py-20` (konten biasa) / `py-20 lg:py-24` (showcase), TIDAK ada gap/margin antar section |

**Yang sengaja TIDAK dipakai:** gradient sebagai elemen dekoratif, glassmorphism, `rounded-full`/`rounded-2xl`/`rounded-3xl` default Tailwind pada elemen brand, shadow blur ala "modern SaaS" generik, dan — khusus landing page — **jangan bungkus `<section>` dengan radius/shadow/margin sendiri**; itu balik ke pola "kartu" yang sudah sengaja dilepas. Halaman non-landing (dashboard, login, dll) tidak terpengaruh sama sekali oleh perubahan ini.

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
--radius-neu-xl: 16px  /* window/panel besar, modal dialog */
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
Class: `shadow-neu-sm` → `shadow-neu-xl`. Dipakai di halaman non-landing. Untuk shadow berwarna non-hitam (mis. tombol kuning), pola manual: offset pendek + blur senada warna, contoh `shadow-[2px_2px_0px_#FFD000,5px_7px_14px_-3px_rgba(255,208,0,.25)]`. Jangan pakai `shadow-lg`/`shadow-md` Tailwind default (blur murni tanpa offset — hilangkan karakter brutalist-nya).

**Shadow landing page** (offset keras, tanpa blur, ala sticker) — token terpisah, hanya dipakai `src/components/landing/*`:
```css
--shadow-neu-solid-sm:  2px 2px 0px #0D0D0D
--shadow-neu-solid:     4px 4px 0px #0D0D0D
--shadow-neu-solid-lg:  6px 6px 0px #0D0D0D
--shadow-neu-solid-xl:  8px 8px 0px #0D0D0D
--shadow-neu-module-sm: 6px 6px 0px #0D0D0D   /* badge, pill header (SectionTag), tombol besar */
```
Class: `shadow-neu-solid-sm` → `shadow-neu-solid-xl`, `shadow-neu-module-sm`.

### Struktur tiap `<section>` landing page

Full-bleed, dipisah garis, konten di-center manual — bukan card wrapper:
```jsx
<section id="..." className="border-b-4 border-neu-black bg-neu-{warna} py-16 lg:py-20">
  <div className="max-w-7xl mx-auto px-4 lg:px-6">
    ...konten...
  </div>
</section>
```
`bg-neu-{warna}` berselang-seling per section — lihat urutan di bawah. Header pill mono ("SERVICES // WHAT_WE_DO") pakai komponen bersama `<SectionTag>` (`helpers.jsx`), bukan ditulis ulang per section. Slider horizontal (Packages/Software/Feedback) tetap pakai pola bleed-ke-tepi mobile: `-mx-4 px-4 lg:mx-0 lg:px-0` di dalam div konten.

Background halaman (`LandingPage.jsx` root div) pakai `.bg-brutalist-grid` (garis grid 60px, warna `neu-bg`) — praktis tidak terlihat karena section-section full-bleed menutupinya, tapi tetap jadi fallback yang aman.

### Spacing / ritme section

- Section konten biasa (Navbar, Hero, TechMarquee, Stats, Services, About, Packages, Banners, Software, FeedbackSection): `py-16 lg:py-20`
- Section "showcase" (Portfolio, WhyChooseUs, HowItWorks, Contact, CTAFinal): `py-20 lg:py-24`
- Tidak ada gap/margin antar section — pemisah hanya `border-b-4 border-neu-black`, kecuali `Hero` dan `Footer` (section terakhir) yang sengaja tanpa border bawah.

### Urutan & warna latar section (mengikuti mock Stitch)

`Navbar`(putih) → `Hero`(putih) → `TechMarquee`(kuning) → `Stats`(hitam) → `Services`(krem) → `About`(putih) → `Packages`(kuning) → `Banners`(putih) → `Software`(krem) → `Portfolio`(putih) → `WhyChooseUs`(hitam) → `HowItWorks`(krem) → `Contact`(putih) → `FeedbackSection`(hitam) → `CTAFinal`(kuning) → `Footer`(hitam). Saat menambah section baru, pilih warna yang berselang-seling dengan tetangganya — jangan dua section solid-color yang sama bersisian.

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

**Sub-komponen pendukung:** `PackageCard`, `PortfolioModal`, `SoftwareDetailModal`

**Modul bersama (bukan komponen):**
- `animations.js` — variant framer-motion + `EASE`/`STAGGER` (lihat di atas)
- `hooks.js` — `useLenis`, `usePageTransition`, `useLang`, `fixContactUrl` (murni logic, tanpa JSX)
- `helpers.jsx` — `HeroReveal`, `AnimatedCounter`, `LetterReveal`, `SectionTag` (komponen kecil dengan JSX — `SectionTag` = pill mono-label header module-card, mis. "SERVICES // WHAT_WE_DO")

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

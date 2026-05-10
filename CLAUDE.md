# CLAUDE.md — Synectra Frontend

> Panduan resmi untuk membangun antarmuka frontend **Synectra**. Dokumen ini mencakup aturan desain, struktur komponen, library animasi, dan konvensi kode yang wajib diikuti oleh semua kontributor.

---

## 📌 Project Overview

| Field             | Detail                                              |
|-------------------|-----------------------------------------------------|
| **Project**       | Synectra — Frontend                                 |
| **Framework**     | React.js (Vite)                                     |
| **Styling**       | Tailwind CSS v3                                     |
| **Design System** | Neubrutalism                                        |
| **Animasi**       | GSAP + Animate.css + Barba.js                       |
| **State**         | React Context API / Zustand (per kebutuhan)         |
| **HTTP Client**   | Axios                                               |
| **Router**        | React Router v6                                     |

---

## 🚀 Fitur yang Sudah Dibuat (Implemented Features)

Berikut adalah daftar fitur dan komponen yang telah berhasil diimplementasikan (Update per tanggal ini):

1. **Halaman & Akses (Pages)**
   - Halaman Login (`LoginPage.jsx`) untuk autentikasi pengguna.
   - Halaman Registrasi (`RegisterPage.jsx`) untuk pendaftaran akun baru.
   - Halaman Dashboard (`DashboardPage.jsx`) sebagai antarmuka utama pengguna.

2. **Komponen UI & Layout**
   - Struktur navigasi utama menggunakan `Navbar.jsx` dan `Sidebar.jsx`.
   - Komponen UI reusable: `Alert.jsx` untuk notifikasi dinamis dan `ConfirmModal.jsx` untuk konfirmasi aksi.

3. **Integrasi Visual 3D**
   - Penambahan komponen `Scene3D.jsx` untuk integrasi visualisasi objek 3D interaktif yang memberikan pengalaman pengguna lebih premium dan modern.

4. **Service, API, & Utilities**
   - Integrasi `auth.service.js` untuk penanganan HTTP request terkait autentikasi ke backend.
   - Konfigurasi endpoint di `constants/api.js`.
   - Implementasi state management notifikasi menggunakan custom hook `useAlert.js`.
   - Utility class builder `cn.js` untuk styling Tailwind CSS.

---

## 🛠️ Tech Stack & Instalasi

```bash
# Inisialisasi project
npm create vite@latest synectra-frontend -- --template react-ts
cd synectra-frontend

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Animasi
npm install gsap
npm install barba.js @barba/core
npm install animate.css

# Utility
npm install axios
npm install react-router-dom
npm install zustand        # state management ringan (opsional)
npm install clsx           # utility class conditional
npm install tailwind-merge # merge tailwind class tanpa konflik
```

---

## 📁 Project Structure

```
synectra-frontend/
│
├── public/
│   └── assets/                     # Static assets (favicon, font, gambar statis)
│
├── src/
│   │
│   ├── main.tsx                    # Entry point; inisialisasi Barba.js & router
│   ├── App.tsx                     # Root component; setup React Router
│   │
│   ├── pages/                      # Halaman utama (satu file per route)
│   │   ├── HomePage.tsx
│   │   ├── ClientPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── [...]/
│   │
│   ├── components/                 # Komponen reusable
│   │   ├── ui/                     # Komponen UI dasar (atom)
│   │   │   ├── Button.tsx          # Tombol dengan varian neubrutalism
│   │   │   ├── Card.tsx            # Card dengan border & shadow neubrutalism
│   │   │   ├── Input.tsx           # Input field bergaya neubrutalism
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/                 # Komponen layout
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── sections/              # Komponen section per halaman
│   │       ├── HeroSection.tsx
│   │       └── ClientListSection.tsx
│   │
│   ├── animations/                # Semua konfigurasi & fungsi animasi
│   │   ├── gsap.animations.ts     # Fungsi animasi GSAP (entrance, exit, scroll)
│   │   ├── barba.config.ts        # Setup transisi antar halaman dengan Barba.js
│   │   └── animate.config.ts      # Kelas Animate.css yang dipakai & helper-nya
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useGsap.ts             # Hook untuk GSAP animasi di dalam komponen
│   │   ├── useAuth.ts             # Hook autentikasi (JWT + Google OAuth)
│   │   └── useApi.ts              # Hook untuk HTTP request dengan Axios
│   │
│   ├── services/                  # Layer komunikasi ke backend API
│   │   ├── auth.service.ts        # Request ke /auth/* (login, logout, refresh)
│   │   └── client.service.ts      # Request ke /clients/*
│   │
│   ├── store/                     # Global state management
│   │   ├── authStore.ts           # State user & token (Zustand)
│   │   └── uiStore.ts             # State UI global (loading, sidebar, dll)
│   │
│   ├── types/                     # TypeScript type & interface
│   │   ├── auth.types.ts
│   │   ├── client.types.ts
│   │   └── api.types.ts
│   │
│   ├── constants/                 # Nilai konstan
│   │   ├── routes.ts              # Daftar path route aplikasi
│   │   ├── api.ts                 # Base URL & endpoint API
│   │   └── animation.ts          # Durasi & easing konstanta animasi
│   │
│   ├── utils/                     # Helper functions
│   │   ├── cn.ts                  # Utility: gabungkan clsx + tailwind-merge
│   │   └── token.ts               # Utility: baca & simpan JWT dari cookie
│   │
│   └── styles/
│       ├── globals.css            # Import Tailwind directives & Animate.css
│       └── neubrutalism.css       # Custom CSS tambahan khusus neubrutalism
│
├── tailwind.config.ts             # Konfigurasi Tailwind + token neubrutalism
├── tsconfig.json
├── vite.config.ts
├── CLAUDE.md                      # Dokumen panduan ini
└── .env                           # Environment variables (JANGAN di-commit)
```

---

## 🎨 Design System — Neubrutalism

Neubrutalism adalah gaya desain yang ditandai dengan:
- **Border hitam tebal** (`border-2 border-black` atau `border-4 border-black`)
- **Shadow solid offset** (`shadow: 4px 4px 0px #000` — bukan blur)
- **Warna flat & kontras tinggi** tanpa gradient
- **Tipografi bold dan besar**
- **Interaksi shift on hover/click** (elemen bergeser menggantikan shadow)

---

### 🎨 Palet Warna

Definisikan di `tailwind.config.ts`:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warna primer neubrutalism Synectra
        'neu-black':   '#0D0D0D',
        'neu-white':   '#FAFAFA',
        'neu-primary': '#FFD000',   // Kuning bold (CTA utama)
        'neu-accent':  '#FF5C5C',   // Merah untuk alert / highlight
        'neu-blue':    '#4D61FF',   // Biru untuk link & info
        'neu-green':   '#00C48C',   // Hijau untuk sukses / status aktif
        'neu-purple':  '#A855F7',   // Ungu untuk badge / label
        'neu-bg':      '#F5F0E8',   // Krem — background utama halaman
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],  // Heading
        body:    ['"DM Sans"', 'sans-serif'],         // Body text
        mono:    ['"JetBrains Mono"', 'monospace'],  // Code / label
      },
      boxShadow: {
        'neu-sm': '2px 2px 0px #0D0D0D',
        'neu':    '4px 4px 0px #0D0D0D',
        'neu-md': '6px 6px 0px #0D0D0D',
        'neu-lg': '8px 8px 0px #0D0D0D',
        'neu-xl': '12px 12px 0px #0D0D0D',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 🧩 Komponen UI Dasar

Semua komponen wajib mengikuti anatomi neubrutalism berikut:

#### Button
```tsx
// src/components/ui/Button.tsx
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-neu-primary text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
  secondary: 'bg-neu-white text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
  danger:    'bg-neu-accent text-neu-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
  ghost:     'bg-transparent text-neu-black border-transparent shadow-none hover:bg-neu-bg',
};

export function Button({ variant = 'primary', isLoading, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'px-5 py-2.5 font-display font-bold text-sm',
        'border-2 border-neu-black shadow-neu',
        'transition-all duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none',
        variantStyles[variant],
        isLoading && 'opacity-60 cursor-not-allowed',
        className,
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <span className="animate-spin">⟳</span> : children}
    </button>
  );
}
```

#### Card
```tsx
// src/components/ui/Card.tsx
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean; // tambah strip warna di sisi kiri
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn(
        'bg-neu-white border-2 border-neu-black shadow-neu',
        'p-5 rounded-none',              // Neubrutalism: TIDAK ada border-radius
        accent && 'border-l-4 border-l-neu-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}
```

#### Input
```tsx
// src/components/ui/Input.tsx
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 bg-neu-white',
          'border-2 border-neu-black shadow-neu-sm',
          'font-body text-neu-black placeholder:text-gray-400',
          'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px]',
          'transition-all duration-150',
          error && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-neu-accent font-body font-semibold text-xs">{error}</span>
      )}
    </div>
  );
}
```

---

### 📐 Aturan Desain Wajib

| Aturan                  | Benar ✅                                   | Salah ❌                              |
|-------------------------|--------------------------------------------|---------------------------------------|
| Border                  | `border-2 border-neu-black`                | Border tipis, abu-abu, atau tidak ada |
| Shadow                  | `shadow-neu` (solid offset)                | `shadow-lg` (blur/gaussian)           |
| Border radius           | `rounded-none` (kotak)                     | `rounded-xl`, `rounded-full`          |
| Warna background        | Flat dari palet `neu-*`                    | Gradient apapun                       |
| Tipografi heading       | `font-display font-bold`                   | Font reguler atau light               |
| Hover/active state      | Geser + kurangi shadow (`translate + shadow-none`) | Opacity atau warna saja         |
| Spacing                 | Konsisten menggunakan skala Tailwind       | Nilai arbitrary acak                  |

---

## 🎬 Animasi

### 1. GSAP — Animasi Komponen & Scroll

GSAP digunakan untuk animasi elemen di dalam halaman: entrance, scroll trigger, dan interaksi kompleks.

```ts
// src/animations/gsap.animations.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Animasi entrance dari bawah ke posisi asli */
export function fadeUp(target: string | Element, delay = 0): void {
  gsap.from(target, {
    y: 40,
    opacity: 0,
    duration: 0.6,
    delay,
    ease: 'power3.out',
  });
}

/** Animasi entrance stagger untuk list item */
export function staggerFadeUp(targets: string | Element[], stagger = 0.1): void {
  gsap.from(targets, {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger,
    ease: 'power2.out',
  });
}

/** Scroll-triggered animation */
export function scrollReveal(target: string | Element): void {
  gsap.from(target, {
    scrollTrigger: {
      trigger: target as Element,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 50,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
  });
}

/** Animasi neubrutalism: geser shadow saat hover */
export function neuHoverIn(target: Element): void {
  gsap.to(target, { x: 2, y: 2, boxShadow: '2px 2px 0px #0D0D0D', duration: 0.1 });
}

export function neuHoverOut(target: Element): void {
  gsap.to(target, { x: 0, y: 0, boxShadow: '4px 4px 0px #0D0D0D', duration: 0.1 });
}
```

#### Custom Hook GSAP
```ts
// src/hooks/useGsap.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook untuk menjalankan animasi GSAP di dalam komponen React
 * @param callback - Fungsi animasi GSAP
 * @param deps - Dependencies (seperti useEffect)
 */
export function useGsap(
  callback: (context: gsap.Context) => void,
  deps: React.DependencyList = [],
): void {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {
      callback(ctx.current!);
    });

    return () => {
      // Cleanup otomatis semua animasi dalam context ini
      ctx.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

#### Cara Pakai di Komponen
```tsx
// Contoh penggunaan useGsap di dalam komponen
import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { fadeUp, staggerFadeUp } from '@/animations/gsap.animations';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    fadeUp('.hero-title', 0);
    fadeUp('.hero-subtitle', 0.15);
    staggerFadeUp('.hero-card', 0.1);
  }, []);

  return (
    <div ref={containerRef}>
      <h1 className="hero-title font-display font-bold text-5xl">Synectra</h1>
      <p className="hero-subtitle font-body text-xl">Platform penerimaan client modern</p>
    </div>
  );
}
```

---

### 2. Barba.js — Transisi Antar Halaman

Barba.js mengelola transisi smooth antar halaman tanpa full reload.

```ts
// src/animations/barba.config.ts
import barba from '@barba/core';
import { gsap } from 'gsap';

export function initBarba(): void {
  barba.init({
    // Setiap halaman wajib membungkus konten utama dengan:
    // <div data-barba="wrapper">
    //   <main data-barba="container" data-barba-namespace="nama-halaman">
    //     ...konten halaman...
    //   </main>
    // </div>

    transitions: [
      {
        name: 'neu-slide',
        // Animasi keluar halaman lama
        async leave({ current }) {
          await gsap.to(current.container, {
            x: -40,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
          });
        },
        // Animasi masuk halaman baru
        async enter({ next }) {
          gsap.from(next.container, {
            x: 40,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        },
      },
    ],

    views: [
      {
        namespace: 'home',
        afterEnter() {
          // Jalankan animasi spesifik halaman home setelah transisi selesai
          fadeUpOnEnter();
        },
      },
    ],
  });
}

function fadeUpOnEnter(): void {
  gsap.from('[data-animate="fade-up"]', {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power2.out',
  });
}
```

#### Setup di main.tsx
```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initBarba } from './animations/barba.config';
import './styles/globals.css';

// Inisialisasi Barba setelah DOM siap
initBarba();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### Template Wajib di Setiap Halaman
```tsx
// Setiap page component WAJIB menggunakan struktur data-barba ini
export function HomePage() {
  return (
    <main data-barba="container" data-barba-namespace="home">
      {/* Konten halaman */}
    </main>
  );
}
```

---

### 3. Animate.css — Animasi Deklaratif & Notifikasi

Animate.css digunakan untuk animasi ringan dan cepat: notifikasi toast, badge masuk, alert, dan elemen kecil.

```ts
// src/animations/animate.config.ts

/** Kelas Animate.css yang digunakan di project ini */
export const AnimateClass = {
  // Entrance
  FADE_IN:        'animate__animated animate__fadeIn',
  FADE_IN_UP:     'animate__animated animate__fadeInUp',
  FADE_IN_DOWN:   'animate__animated animate__fadeInDown',
  BOUNCE_IN:      'animate__animated animate__bounceIn',
  ZOOM_IN:        'animate__animated animate__zoomIn',
  SLIDE_IN_RIGHT: 'animate__animated animate__slideInRight',

  // Exit
  FADE_OUT:       'animate__animated animate__fadeOut',
  FADE_OUT_UP:    'animate__animated animate__fadeOutUp',
  SLIDE_OUT_LEFT: 'animate__animated animate__slideOutLeft',

  // Attention
  SHAKE:          'animate__animated animate__shakeX',     // Untuk error / validasi gagal
  PULSE:          'animate__animated animate__pulse',       // Untuk loading state ringan
  BOUNCE:         'animate__animated animate__bounce',      // Untuk CTA / highlight
  FLASH:          'animate__animated animate__flash',       // Untuk notifikasi penting
} as const;

/** Helper: tambah animasi ke elemen, lalu hapus setelah selesai */
export function animateOnce(element: Element, animationClass: string): Promise<void> {
  return new Promise((resolve) => {
    const classes = animationClass.split(' ');
    element.classList.add(...classes);

    element.addEventListener(
      'animationend',
      () => {
        element.classList.remove(...classes);
        resolve();
      },
      { once: true },
    );
  });
}
```

#### Cara Pakai Animate.css
```tsx
import 'animate.css';
import { AnimateClass, animateOnce } from '@/animations/animate.config';

// 1. Deklaratif langsung di className (untuk animasi permanen)
<div className={AnimateClass.FADE_IN_UP}>
  Konten saya
</div>

// 2. Programatik via helper (untuk animasi satu kali, lalu kelas dibersihkan)
const handleError = async () => {
  const el = document.getElementById('form-card');
  if (el) await animateOnce(el, AnimateClass.SHAKE);
};
```

---

## 🔧 Utility Penting

### cn — Class Utility
```ts
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gabungkan class secara kondisional tanpa konflik Tailwind
 * @example cn('px-4', isActive && 'bg-neu-primary', 'border-2')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### globals.css
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Animate.css */
@import 'animate.css';

/* Import font Google */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

@layer base {
  html {
    font-family: 'DM Sans', sans-serif;
    background-color: #F5F0E8; /* neu-bg */
    color: #0D0D0D;            /* neu-black */
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
  }

  /* Animate.css: durasi default dipercepat untuk UI */
  :root {
    --animate-duration: 0.4s;
    --animate-delay: 0.1s;
  }
}

/* Barba.js: sembunyikan container lama saat transisi */
.barba-container {
  min-height: 100vh;
}
```

---

## 🚦 Hal yang BOLEH Dilakukan ✅

- ✅ Membuat komponen baru mengikuti anatomi neubrutalism (border tebal + shadow solid)
- ✅ Menggunakan GSAP untuk animasi entrance, exit, scroll, dan interaksi kompleks
- ✅ Menggunakan Animate.css untuk notifikasi, toast, badge, dan elemen kecil
- ✅ Menggunakan Barba.js untuk transisi antar halaman
- ✅ Menggunakan utility `cn()` untuk semua conditional class
- ✅ Menggunakan hook `useGsap()` untuk animasi di dalam komponen React
- ✅ Menambahkan varian baru pada komponen UI yang sudah ada
- ✅ Menggunakan `data-animate` attribute sebagai selector GSAP (hindari id/class yang ambigu)
- ✅ Menggunakan `data-barba-namespace` yang unik di setiap halaman

---

## 🚫 Hal yang TIDAK BOLEH Dilakukan ❌

- ❌ **DILARANG** menggunakan `border-radius` apapun pada elemen utama — neubrutalism selalu kotak
- ❌ **DILARANG** menggunakan gradient (`bg-gradient-*`) sebagai background utama
- ❌ **DILARANG** menggunakan shadow blur Tailwind (`shadow-lg`, `shadow-md`) — gunakan `shadow-neu-*`
- ❌ **DILARANG** menulis inline style (`style={{}}`) kecuali untuk nilai dinamis yang tidak bisa dilakukan via Tailwind
- ❌ **DILARANG** menggunakan tipe `any` di TypeScript
- ❌ **DILARANG** memanggil API langsung di dalam komponen — semua request lewat `/services/`
- ❌ **DILARANG** menyimpan JWT token di `localStorage` — baca dari cookie httpOnly via service
- ❌ **DILARANG** mencampur logika animasi GSAP, Barba.js, dan Animate.css untuk animasi yang sama
- ❌ **DILARANG** membuat komponen baru tanpa menggunakan utility `cn()` untuk className
- ❌ **DILARANG** membuat halaman tanpa struktur `data-barba` yang benar
- ❌ **DILARANG** menggunakan `console.log` — hapus sebelum push
- ❌ **DILARANG** commit file `.env` atau asset sensitif

---

## 🔄 Alur Kerja Git — WAJIB DIIKUTI

> Setiap perubahan, sekecil apapun, **wajib** di-push ke repository.

### Branching Strategy

```
main          → Branch production (DILARANG push langsung)
develop       → Branch utama pengembangan
feature/*     → Branch untuk fitur baru    (contoh: feature/hero-section)
fix/*         → Branch untuk perbaikan bug (contoh: fix/barba-transition-flicker)
hotfix/*      → Branch untuk perbaikan kritis di production
```

### Alur Setiap Perubahan

```bash
# 1. Selalu mulai dari develop yang terbaru
git checkout develop
git pull origin develop

# 2. Buat branch baru
git checkout -b feature/nama-fitur

# 3. Kerjakan perubahan, lalu stage
git add .

# 4. Commit dengan pesan deskriptif
git commit -m "feat: tambah komponen Card dengan varian accent neubrutalism"

# 5. Push SEGERA setelah commit
git push origin feature/nama-fitur

# 6. Buat Pull Request ke develop
# 7. Tunggu review project leader sebelum merge
```

### Format Pesan Commit

| Prefix      | Digunakan Untuk                                          |
|-------------|----------------------------------------------------------|
| `feat:`     | Komponen, halaman, atau fitur baru                       |
| `fix:`      | Perbaikan bug atau tampilan yang tidak sesuai            |
| `refactor:` | Perubahan struktur tanpa mengubah tampilan/behavior      |
| `style:`    | Perubahan styling murni (warna, spacing, tipografi)      |
| `anim:`     | Perubahan atau penambahan animasi (GSAP, Barba, Animate) |
| `docs:`     | Update CLAUDE.md atau dokumentasi lainnya                |
| `chore:`    | Update dependency atau konfigurasi                       |

**Contoh pesan commit yang baik:**
```
feat: tambah HeroSection dengan animasi GSAP fadeUp
anim: tambah transisi Barba.js untuk halaman ClientPage
fix: perbaiki shadow Card yang hilang saat hover di Safari
style: sesuaikan palet warna neu-primary ke #FFD000
refactor: pisahkan komponen Button ke file tersendiri
```

---

## ⚙️ Environment Variables

```env
# .env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Synectra
```

Akses di kode:
```ts
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 👤 Project Leader

Semua keputusan desain sistem, perubahan design token (warna, shadow, font), dan merge ke `main` harus melalui persetujuan **Project Leader**.

Jika ada pertanyaan terkait konsistensi desain atau pilihan library animasi, **tanyakan dulu sebelum mengimplementasikan**.

---

*Dokumen ini dikelola oleh Project Leader Synectra. Setiap perubahan pada CLAUDE.md harus di-push dengan commit message `docs: update CLAUDE.md`.*
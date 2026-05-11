export const API_BASE_URL = import.meta.env.DEV ? 'https://backend-synectra.vercel.app' : '';

export const API_ENDPOINTS = {
  REGISTER:    `${API_BASE_URL}/api/auth/register`,
  LOGIN:       `${API_BASE_URL}/api/auth/login`,
  LOGOUT:      `${API_BASE_URL}/api/auth/logout`,
  ME:          `${API_BASE_URL}/api/auth/me`,
  GOOGLE:      `${API_BASE_URL}/api/auth/google`,
  PORTFOLIO:   `${API_BASE_URL}/api/portfolio`,
  BANNERS:       `${API_BASE_URL}/api/banners`,
  BANK_ACCOUNTS: `${API_BASE_URL}/api/bank-accounts`,
  SOCIAL_MEDIA:  `${API_BASE_URL}/api/social-media`,
  CONTACTS:          `${API_BASE_URL}/api/contacts`,
  ORDERS:            `${API_BASE_URL}/api/orders`,
  PAYMENTS:          `${API_BASE_URL}/api/payments`,
  PROGRESS_REPORTS:  `${API_BASE_URL}/api/progress-reports`,
};

export const SUPABASE_URL  = 'https://ddgspjgrslhlphhaltkf.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZ3Nwamdyc2xobHBoaGFsdGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE3MjksImV4cCI6MjA5MzgyNzcyOX0.C_4qPQQgNh46PKrjzyd5r0xWjJmT9mcVBFj3vkJMnJI';
export const STORAGE_BUCKET = 'portofolio-images';
export const BANNER_BUCKET     = 'banner-images';
export const BANK_LOGO_BUCKET    = 'bank-logos';
export const SOCIAL_ICON_BUCKET      = 'social-icons';
export const PAYMENT_RECEIPT_BUCKET  = 'payment-receipts';
export const PROGRESS_ATTACH_BUCKET  = 'progress-attachments';

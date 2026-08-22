import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

const BASE = API_BASE_URL || '';

const DEFAULT_TESTIMONIALS = [
  {
    id: 'testi-1',
    name: 'Budi Santoso',
    role: 'Ketua Koperasi Syariah',
    avatarBg: 'bg-neu-green',
    rating: 5,
    message: 'Pengerjaan sistem koperasi sangat cepat dan fiturnya lengkap dari simpan pinjam sampai bagi hasil otomatis. Luar biasa!',
  },
  {
    id: 'testi-2',
    name: 'Sarah Wijaya',
    role: 'Product Manager',
    avatarBg: 'bg-neu-purple',
    rating: 5,
    message: 'UI/UX neubrutalism-nya juara! Aplikasi mobile kami jadi jauh lebih intuitif, modern, dan disukai pengguna.',
  },
  {
    id: 'testi-3',
    name: 'Andi Pratama',
    role: 'Mahasiswa IT',
    avatarBg: 'bg-secondary-container',
    rating: 5,
    message: 'Bantuan bimbingan tugas akhir yang sangat profesional. Kode rapi, arsitektur jelas, dan revisi didampingi sampai ACC.',
  },
  {
    id: 'testi-4',
    name: 'Rian Hidayat',
    role: 'Owner Agro Bisnis',
    avatarBg: 'bg-primary-container',
    rating: 5,
    message: 'Aplikasi POS Agro-Tani mempermudah pencatatan kasir dan stok pupuk. Laporan harian langsung otomatis terbit.',
  },
  {
    id: 'testi-5',
    name: 'Dewi Lestari',
    role: 'Founder Startup Retail',
    avatarBg: 'bg-neu-green',
    rating: 5,
    message: 'Integrasi payment gateway dan WhatsApp webhook berjalan tanpa kendala. Tim Synectra sangat responsif.',
  },
];

export function FeedbackSection({ feedbacks, onSubmitted }) {
  const { t } = useTranslation();
  const sliderRef = useRef(null);

  // Mouse Drag to Scroll State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragged, setIsDragged] = useState(false);

  // Form State
  const [form, setForm] = useState({ name: '', email: '', rating: 5, message: '' });
  const [hovered, setHovered] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const displayList = (feedbacks && feedbacks.length > 0)
    ? feedbacks.map((fb, i) => ({
        id: fb.id,
        name: fb.name,
        role: fb.role || 'Klien Synectra',
        avatarBg: ['bg-neu-green', 'bg-neu-purple', 'bg-secondary-container', 'bg-primary-container'][i % 4],
        rating: fb.rating || 5,
        message: fb.message,
      }))
    : DEFAULT_TESTIMONIALS;

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setIsDragged(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsDragged(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 6) {
      setIsDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/feedbacks`, {
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        message: form.message.trim() || undefined,
      });
      if (onSubmitted) onSubmitted(res.data?.data ?? res.data);
      setSubmitted(true);
      setForm({ name: '', email: '', rating: 5, message: '' });
    } catch {
      setError('Gagal mengirim testimoni. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="ulasan" className="w-full bg-neu-black py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black overflow-hidden select-none">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-neu-white text-neu-black font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#FFD000] transform -rotate-1 uppercase tracking-wide">
            TESTIMONIALS // {t('landing.feedback.title', 'APA KATA MEREKA')}
          </div>
        </div>

        {/* Interactive 1-Row Mouse Drag & Touch Slider without Left/Right Navigation UI */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex flex-nowrap gap-6 md:gap-8 overflow-x-auto py-4 px-2 mb-12 md:mb-16 no-scrollbar scroll-smooth ${
            isDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {displayList.map((item) => (
            <div
              key={item.id}
              className="w-[300px] sm:w-[340px] md:w-[380px] shrink-0 bg-surface-dim border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#FFD000] flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 select-none"
            >
              <div>
                <div className="flex gap-1 mb-4 md:mb-6 text-primary-container">
                  {Array.from({ length: item.rating }).map((_, rIdx) => (
                    <span key={rIdx} className="material-symbols-outlined font-black text-2xl md:text-3xl">
                      star
                    </span>
                  ))}
                </div>
                <p
                  title={item.message}
                  className="font-body font-bold mb-6 md:mb-8 italic text-base md:text-lg leading-relaxed text-neu-black break-words line-clamp-4"
                >
                  "{item.message}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t-2 border-neu-black/10 min-w-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 ${item.avatarBg} border-4 border-neu-black rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-neu-black text-2xl font-bold">
                    person
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 title={item.name} className="font-display text-base md:text-lg font-black uppercase text-neu-black truncate">
                    {item.name}
                  </h5>
                  <p title={item.role} className="font-mono text-xs md:text-sm font-bold text-neu-black/70 truncate">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback submission toggle / card */}
        <div className="max-w-2xl mx-auto bg-neu-white border-4 border-neu-black rounded-xl p-6 md:p-8 shadow-[8px_8px_0px_0px_#FAFAFA]">
          <h4 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-neu-black mb-2 text-center">
            {t('landing.feedback.formTitle', 'BERIKAN ULASAN ANDA')}
          </h4>
          <p className="font-body text-sm text-neu-black/70 text-center mb-6 font-medium">
            Pengalaman Anda sangat berharga bagi kami untuk terus berkembang.
          </p>

          {submitted ? (
            <div className="bg-neu-green/20 border-4 border-neu-green p-6 rounded-lg text-center">
              <span className="material-symbols-outlined text-neu-green text-4xl font-bold mb-2">
                check_circle
              </span>
              <p className="font-display font-black text-lg text-neu-black">
                {t('landing.feedback.success', 'Terima kasih atas ulasan Anda!')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-display font-black text-xs uppercase text-neu-black mb-1 block">
                    Nama <span className="text-secondary-container">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama Anda"
                    className="w-full bg-surface-dim border-2 border-neu-black rounded-lg px-4 py-2.5 font-bold text-neu-black text-sm outline-none focus:bg-neu-white"
                  />
                </div>
                <div>
                  <label className="font-display font-black text-xs uppercase text-neu-black mb-1 block">
                    Email <span className="text-secondary-container">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full bg-surface-dim border-2 border-neu-black rounded-lg px-4 py-2.5 font-bold text-neu-black text-sm outline-none focus:bg-neu-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-display font-black text-xs uppercase text-neu-black mb-1 block">
                  Rating <span className="text-secondary-container">*</span>
                </label>
                <div className="flex gap-2 text-primary-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-3xl font-black">
                        {(hovered || form.rating) >= star ? 'star' : 'star_border'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-display font-black text-xs uppercase text-neu-black mb-1 block">
                  Pesan / Testimoni
                </label>
                <textarea
                  rows="3"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ceritakan pengalaman Anda bekerja sama dengan Synectra..."
                  className="w-full bg-surface-dim border-2 border-neu-black rounded-lg px-4 py-2.5 font-medium text-neu-black text-sm outline-none focus:bg-neu-white resize-none"
                />
              </div>

              {error && (
                <p className="font-mono text-xs text-secondary-container font-bold">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-container text-neu-black font-display font-black text-sm py-3.5 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#0D0D0D] btn-press cursor-pointer uppercase text-center disabled:opacity-60"
              >
                {isSubmitting ? 'MENGIRIM...' : 'KIRIM ULASAN'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

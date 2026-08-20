import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { cn } from '../../utils/cn';
import { API_BASE_URL } from '../../constants/api';
import { fadeLeft } from './animations';

const BASE = API_BASE_URL || '';

function StarDisplay({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={cn(sz, s <= rating ? 'text-neu-primary' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Feedback Section ───────────────────────────────────────────────── */
export function FeedbackSection({ feedbacks, onSubmitted }) {
  const { t } = useTranslation();
  const [form, setForm]         = useState({ name: '', email: '', rating: 0, message: '' });
  const [hovered, setHovered]   = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState('');
  const [formErrors, setFormErrors]     = useState({ name: '', email: '', rating: '' });
  const sliderRef = useRef(null);
  const drag      = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const validate = () => {
    const errs = { name: '', email: '', rating: '' };
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Email tidak valid';
    if (!form.rating) errs.rating = 'Pilih rating terlebih dahulu';
    setFormErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/feedbacks`, {
        name: form.name.trim(), email: form.email.trim(),
        rating: form.rating, message: form.message.trim() || undefined,
      });
      onSubmitted(res.data?.data ?? res.data);
      setSubmitted(true);
      setForm({ name: '', email: '', rating: 0, message: '' });
    } catch {
      setError('Gagal mengirim. Coba lagi.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <section id="ulasan" className="border-b-2 border-neu-black bg-neu-white py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <motion.div {...fadeLeft()} className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-neu-primary" />
            <div>
              <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-neu-black">{t('landing.feedback.sectionTitle')}</h2>
              {avg && (
                <div className="flex items-center gap-2 mt-1">
                  <StarDisplay rating={Math.round(Number(avg))} size="lg" />
                  <span className="font-mono text-sm text-neu-black/60">{avg} — {t('landing.feedback.avgRating', { count: feedbacks.length })}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Review cards — drag slider */}
        {feedbacks.length === 0 ? (
          <p className="font-body text-sm text-neu-black/40 mb-10 border-2 border-dashed border-neu-black rounded-neu px-6 py-8 text-center">{t('landing.feedback.noReviews')}</p>
        ) : (
          <div className="relative mb-10">
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            onMouseDown={e => { const el = sliderRef.current; drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft }; el.style.cursor = 'grabbing'; }}
            onMouseMove={e => { if (!drag.current.active) return; sliderRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX); }}
            onMouseUp={() => { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; }}
            onMouseLeave={() => { if (drag.current.active) { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; } }}
            onTouchStart={e => { const el = sliderRef.current; drag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft }; }}
            onTouchMove={e => { if (!drag.current.active) return; const el = sliderRef.current; el.scrollLeft = drag.current.scrollLeft - (e.touches[0].pageX - drag.current.startX); }}
            onTouchEnd={() => { drag.current.active = false; }}
          >
            {feedbacks.map(fb => (
              <div key={fb.id} className="flex-shrink-0 w-64 border-2 border-neu-black rounded-neu bg-neu-bg p-4 shadow-neu flex flex-col gap-2">
                <StarDisplay rating={fb.rating} />
                {fb.message && <p className="font-body text-sm text-neu-black/80 leading-relaxed line-clamp-4">"{fb.message}"</p>}
                <div className="mt-auto pt-2 border-t border-neu-black/10">
                  <p className="font-display font-bold text-xs text-neu-black">{fb.name}</p>
                  <p className="font-mono text-[10px] text-neu-black/40">{new Date(fb.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Fade overlay kanan — menandakan ada konten lebih */}
          <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-white to-transparent pointer-events-none" />
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-neu-black/20" />
          <span className="font-mono text-xs text-neu-black/40 uppercase tracking-widest">{t('landing.feedback.formTitle')}</span>
          <div className="flex-1 h-px bg-neu-black/20" />
        </div>

        {/* Form */}
        {submitted ? (
          <div className="max-w-lg mx-auto text-center border-2 border-neu-green rounded-neu bg-neu-green/10 px-6 py-8">
            <svg className="w-10 h-10 text-neu-green mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-display font-bold text-lg text-neu-black">{t('landing.feedback.success')}</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 font-mono text-xs text-neu-black/50 hover:text-neu-black underline">
              {t('landing.feedback.submit')} →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                  {t('landing.feedback.nameLabel')} <span className="text-neu-accent">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value})); setFormErrors(p => ({...p, name: ''})); }}
                  placeholder="Nama Anda"
                  required aria-required="true"
                  className={cn('w-full px-4 py-2.5 bg-neu-white border-2 rounded-neu-sm shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150', formErrors.name ? 'border-neu-accent' : 'border-neu-black')} />
                {formErrors.name && <span className="font-body text-xs text-neu-accent">{formErrors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                  {t('landing.feedback.emailLabel')} <span className="text-neu-accent">*</span>
                </label>
                <input type="email" value={form.email} onChange={e => { setForm(p => ({...p, email: e.target.value})); setFormErrors(p => ({...p, email: ''})); }}
                  placeholder="email@contoh.com"
                  required aria-required="true"
                  className={cn('w-full px-4 py-2.5 bg-neu-white border-2 rounded-neu-sm shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150', formErrors.email ? 'border-neu-accent' : 'border-neu-black')} />
                {formErrors.email && <span className="font-body text-xs text-neu-accent">{formErrors.email}</span>}
              </div>
            </div>

            {/* Star selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                {t('landing.feedback.ratingLabel')} <span className="text-neu-accent">*</span>
              </label>
              <div className="flex gap-1 items-center">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    aria-label={`${s} bintang`}
                    onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    onClick={() => { setForm(p => ({...p, rating: s})); setFormErrors(p => ({...p, rating: ''})); }}
                    className="w-11 h-11 flex items-center justify-center transition-transform duration-100 hover:scale-110 active:scale-95">
                    <svg className={cn('w-8 h-8 transition-colors duration-100', (hovered || form.rating) >= s ? 'text-neu-primary' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {form.rating > 0 && <span className="ml-2 font-mono text-sm text-neu-black/50">{form.rating}/5</span>}
              </div>
              {formErrors.rating && <span className="font-body text-xs text-neu-accent">{formErrors.rating}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{t('landing.feedback.messageLabel')}</label>
              <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} rows={3}
                placeholder={t('landing.feedback.messagePlaceholder')}
                className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black rounded-neu-sm shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
            </div>

            {error && <p className="font-body text-xs text-neu-accent">{error}</p>}

            <button type="submit" disabled={isSubmitting}
              className={cn('w-full py-3 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', isSubmitting && 'opacity-60 cursor-not-allowed')}>
              {isSubmitting ? t('landing.feedback.submitting') : t('landing.feedback.submit')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { contactService } from '../services/contact.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { getPlatform } from '../constants/platforms';

const SERVICE_CATEGORY_VALUES = [
  'software_development',
  'mobile_app',
  'web_design',
  'ui_ux',
  'backend',
  'joki',
  'data_science',
  'other',
];

export default function MyOrderFormPage() {
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const alert      = useAlert();

  const [user,      setUser]      = useState(null);
  const [contacts,  setContacts]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form,      setForm]      = useState({ title: '', serviceCategory: '', description: '' });
  const [errors,    setErrors]    = useState({});

  const formRef = useRef(null);

  useEffect(() => {
    Promise.all([authService.getMe(), contactService.getAll()])
      .then(([me, ct]) => {
        setUser(me.data);
        setContacts((ct.data ?? []).filter(c => c.isActive));
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && formRef.current) gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, [isLoading]);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('myOrderForm.titleRequired');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    try {
      const payload = { title: form.title.trim(), serviceCategory: form.serviceCategory || null, description: form.description.trim() || null };
      const res = await orderService.create(payload);
      alert.success(t('myOrderForm.success'));
      setTimeout(() => navigate(`/my-orders/${res.data.id}`), 900);
    } catch (err) {
      const msg = err?.response?.data?.message ?? t('myOrderForm.failed');
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setIsSaving(false); }
  };

  const inputCls = (hasError) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
    hasError && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  const categoryLabels = t('myOrderForm.categories', { returnObjects: true });
  const steps          = t('myOrderForm.steps',      { returnObjects: true });

  return (
    <PageLayout user={user} title={t('myOrderForm.title')} alert={alert}>
      <div ref={formRef} className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-neu-black/50">
          <button type="button" onClick={() => navigate('/my-orders')} className="hover:text-neu-black transition-colors">
            {t('myOrderForm.breadcrumb')}
          </button>
          <span>/</span>
          <span className="text-neu-black">{t('myOrderForm.breadcrumbNew')}</span>
        </div>

        {/* Info card */}
        <div className="bg-neu-primary/10 border-2 border-neu-primary p-4 mb-6">
          <p className="font-display font-bold text-sm text-neu-black">{t('myOrderForm.howItWorks')}</p>
          <ol className="mt-2 space-y-1 font-body text-xs text-neu-black/70 list-decimal list-inside">
            {Array.isArray(steps) && steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Judul */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              {t('myOrderForm.titleLabel')}
            </label>
            <input type="text" value={form.title} onChange={e => setField('title', e.target.value)}
              placeholder={t('myOrderForm.titlePlaceholder')} className={inputCls(errors.title)} />
            {errors.title && <span className="text-neu-accent font-body font-semibold text-xs">{errors.title}</span>}
          </div>

          {/* Kategori */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              {t('myOrderForm.categoryLabel')}
            </label>
            <select value={form.serviceCategory} onChange={e => setField('serviceCategory', e.target.value)}
              className="px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black outline-none focus:shadow-neu transition-all duration-150 cursor-pointer">
              <option value="">{t('myOrderForm.categoryOptional')}</option>
              {SERVICE_CATEGORY_VALUES.map((val, i) => (
                <option key={val} value={val}>
                  {Array.isArray(categoryLabels) ? categoryLabels[i] ?? val : val}
                </option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-bold text-sm text-neu-black uppercase tracking-wide">
              {t('myOrderForm.descLabel')}
            </label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)}
              rows={6} placeholder={t('myOrderForm.descPlaceholder')}
              className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150 resize-none" />
            <p className="font-mono text-xs text-neu-black/40">{t('myOrderForm.descHelper')}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className={cn('px-8 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none', isSaving && 'opacity-60 cursor-not-allowed')}>
              {isSaving ? t('myOrderForm.sending') : t('myOrderForm.submit')}
            </button>
            <button type="button" onClick={() => navigate('/my-orders')} disabled={isSaving}
              className="px-6 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
              {t('common.cancel')}
            </button>
          </div>
        </form>

        {/* Kontak */}
        {contacts.length > 0 && (
          <div className="mt-10 border-t-2 border-neu-black pt-8">
            <p className="font-display font-bold text-base text-neu-black uppercase tracking-wide mb-1">{t('myOrderForm.contactTitle')}</p>
            <p className="font-body text-sm text-neu-black/60 mb-5">{t('myOrderForm.contactSubtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contacts.map(ct => {
                const { Icon, color } = getPlatform(ct.icon);
                return (
                  <a key={ct.id} href={ct.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-neu-white border-2 border-neu-black shadow-neu-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neu transition-all duration-150">
                    <div className="w-11 h-11 border-2 border-neu-black flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                      <Icon style={{ color }} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-neu-black">{ct.nama}</p>
                      <p className="font-mono text-xs text-neu-black/50 truncate">{ct.contactInfo}</p>
                      <p className="font-mono text-[10px] text-neu-black/30 uppercase">{ct.platform}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

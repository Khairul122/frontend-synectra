import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { PageLoader } from '../components/ui/PageLoader';

export default function ProfilePage() {
  const navigate = useNavigate();
  const alert    = useAlert();
  const { t }    = useTranslation();

  const [user,           setUser]           = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [profile,        setProfile]        = useState({ fullName: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors,   setProfileErrors]   = useState({});
  const [pwForm,          setPwForm]          = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPw,      setIsSavingPw]      = useState(false);
  const [pwErrors,        setPwErrors]        = useState({});
  const pageRef = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        setUser(u);
        setProfile({ fullName: u.fullName ?? '', email: u.email ?? '' });
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && pageRef.current) gsap.from(pageRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, [isLoading]);

  const validateProfile = () => {
    const e = {};
    if (!profile.fullName.trim()) e.fullName = t('profile.validation.nameRequired');
    if (!profile.email.trim())    e.email    = t('profile.validation.emailRequired');
    return e;
  };

  const handleSaveProfile = async (ev) => {
    ev.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setIsSavingProfile(true);
    try {
      const res = await authService.updateProfile({ fullName: profile.fullName.trim(), email: profile.email.trim() });
      setUser(prev => ({ ...prev, ...res.data }));
      alert.success(t('profile.success.profile'));
    } catch (err) {
      const msg = err?.response?.data?.message ?? t('profile.failed.profile');
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setIsSavingProfile(false); }
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword)                         e.currentPassword = t('profile.validation.currentPassRequired');
    if (pwForm.newPassword.length < 8)                  e.newPassword     = t('profile.validation.newPassMin');
    if (pwForm.newPassword !== pwForm.confirmPassword)  e.confirmPassword = t('profile.validation.passwordMismatch');
    return e;
  };

  const handleSavePw = async (ev) => {
    ev.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setIsSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword, confirmPassword: pwForm.confirmPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert.success(t('profile.success.password'));
    } catch (err) {
      const msg = err?.response?.data?.message ?? t('profile.failed.password');
      alert.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setIsSavingPw(false); }
  };

  const inputCls = (hasError) => cn(
    'w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm',
    'font-body text-neu-black placeholder:text-gray-400',
    'outline-none focus:shadow-neu focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-150',
    hasError && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
  );

  const ROLE_LABEL = { admin: 'Administrator', staff: 'Staff', client: 'Client' };
  const ROLE_COLOR = { admin: 'bg-neu-accent text-neu-white', staff: 'bg-neu-blue text-neu-white', client: 'bg-neu-green text-neu-white' };
  const initial    = (user?.fullName ?? user?.email ?? '?').charAt(0).toUpperCase();

  if (isLoading) return <PageLoader />;

  const pwFields = [
    { key: 'currentPassword', label: t('profile.currentPass'), placeholder: '••••••••' },
    { key: 'newPassword',     label: t('profile.newPass'),     placeholder: '••••••••' },
    { key: 'confirmPassword', label: t('profile.confirmPass'), placeholder: '••••••••' },
  ];

  return (
    <PageLayout user={user} title={t('profile.title')} alert={alert}>
      <div ref={pageRef} className="max-w-2xl mx-auto space-y-6">

        {/* Avatar + Info */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu p-6 flex items-center gap-5">
          <div className="w-16 h-16 border-2 border-neu-black overflow-hidden flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neu-primary flex items-center justify-center font-display font-bold text-2xl text-neu-black">{initial}</div>
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-neu-black">{user?.fullName}</h2>
            <p className="font-mono text-sm text-neu-black/50">{user?.email}</p>
            <span className={cn('inline-block mt-1.5 px-2 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', ROLE_COLOR[user?.role] ?? 'bg-neu-black/10 text-neu-black')}>
              {ROLE_LABEL[user?.role] ?? user?.role}
            </span>
          </div>
        </div>

        {/* Edit Profil */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="px-6 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide">{t('profile.editSection')}</h3>
          </div>
          <form onSubmit={handleSaveProfile} className="px-6 py-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                {t('profile.nameLabel')}
              </label>
              <input type="text" value={profile.fullName}
                onChange={e => { setProfile(p => ({ ...p, fullName: e.target.value })); setProfileErrors(p => ({ ...p, fullName: '' })); }}
                placeholder={t('profile.namePlaceholder')} className={inputCls(profileErrors.fullName)} />
              {profileErrors.fullName && <span className="text-neu-accent font-body font-semibold text-xs">{profileErrors.fullName}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                {t('profile.emailLabel')}
              </label>
              <input type="email" value={profile.email}
                onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); setProfileErrors(p => ({ ...p, email: '' })); }}
                placeholder={t('profile.emailPlaceholder')} className={inputCls(profileErrors.email)} />
              {profileErrors.email && <span className="text-neu-accent font-body font-semibold text-xs">{profileErrors.email}</span>}
            </div>
            <button type="submit" disabled={isSavingProfile} className={cn(
              'px-6 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
              isSavingProfile && 'opacity-60 cursor-not-allowed',
            )}>
              {isSavingProfile ? t('common.saving') : t('profile.saveProfile')}
            </button>
          </form>
        </div>

        {/* Ganti Password */}
        <div className="bg-neu-white border-2 border-neu-black shadow-neu">
          <div className="px-6 py-4 border-b-2 border-neu-black">
            <h3 className="font-display font-bold text-base text-neu-black uppercase tracking-wide">{t('profile.changePass')}</h3>
          </div>
          {user?.hasPassword === false ? (
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 p-4 bg-neu-blue/10 border-2 border-neu-blue">
                <svg className="w-5 h-5 text-neu-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="font-display font-bold text-sm text-neu-blue">{t('profile.googleAccount')}</p>
                  <p className="font-body text-sm text-neu-black/70 mt-0.5">{t('profile.googleInfo')}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePw} className="px-6 py-5 space-y-4">
              {pwFields.map(({ key, label, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                    {label} <span className="text-neu-accent">*</span>
                  </label>
                  <input type="password" value={pwForm[key]}
                    onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwErrors(p => ({ ...p, [key]: '' })); }}
                    placeholder={placeholder} className={inputCls(pwErrors[key])} />
                  {pwErrors[key] && <span className="text-neu-accent font-body font-semibold text-xs">{pwErrors[key]}</span>}
                </div>
              ))}
              <button type="submit" disabled={isSavingPw} className={cn(
                'px-6 py-2.5 bg-neu-black border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-white',
                'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none',
                isSavingPw && 'opacity-60 cursor-not-allowed',
              )}>
                {isSavingPw ? t('common.saving') : t('profile.changePassBtn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

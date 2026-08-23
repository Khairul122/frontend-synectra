import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Mail, Lock, User, ArrowRight, Link as LinkIcon, X, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { AuthVisual3D } from '../components/3d/AuthVisual3D';
import { AlertContainer } from '../components/ui/Alert';
import { useAlert } from '../hooks/useAlert';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const alert = useAlert();
  const { t } = useTranslation();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const cardRef = useRef(null);

  // Sync mode with route path
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState({ email: '', password: '' });

  // Register Form state
  const [regForm, setRegForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState({});

  const shakeCard = () => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    }
  };

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    const targetPath = newMode === 'register' ? '/register' : '/login';
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = { email: '', password: '' };
    if (!loginEmail) errs.email = t('login.validation.emailRequired', 'Email wajib diisi');
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errs.email = t('login.validation.emailInvalid', 'Format email tidak valid');
    if (!loginPassword) errs.password = t('login.validation.passwordRequired', 'Password wajib diisi');

    setLoginError(errs);
    if (errs.email || errs.password) {
      shakeCard();
      return;
    }

    setLoginLoading(true);
    try {
      await authService.login(loginEmail, loginPassword);
      alert.success(t('login.success', 'Login berhasil! Selamat datang kembali.'));
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const message = err?.response?.data?.message || t('login.failed', 'Gagal login. Periksa email dan password.');
      alert.error(Array.isArray(message) ? message.join(', ') : message);
      shakeCard();
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!regForm.fullName.trim()) errs.fullName = t('register.validation.nameRequired', 'Nama lengkap wajib diisi');
    if (!regForm.email) errs.email = t('register.validation.emailRequired', 'Email wajib diisi');
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errs.email = t('register.validation.emailInvalid', 'Format email tidak valid');
    if (!regForm.password) errs.password = t('register.validation.passwordRequired', 'Password wajib diisi');
    else if (regForm.password.length < 8) errs.password = t('register.validation.passwordMinLength', 'Password minimal 8 karakter');

    setRegError(errs);
    if (Object.keys(errs).length > 0) {
      shakeCard();
      return;
    }

    setRegLoading(true);
    try {
      await authService.register(regForm.email, regForm.fullName, regForm.password);
      alert.success(t('register.success', 'Registrasi berhasil! Silakan login.'));
      setMode('login');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || t('register.failed', 'Gagal registrasi.');
      alert.error(Array.isArray(message) ? message.join(', ') : message);
      shakeCard();
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg flex flex-col font-body text-neu-black overflow-hidden relative selection:bg-primary-container selection:text-neu-black">
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 md:right-8 z-30">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Top Header - Mobile view */}
      <header className="w-full flex justify-between items-center px-4 py-4 z-40 bg-neu-bg border-b-2 border-neu-black absolute top-0 left-0 md:hidden">
        <div
          className="font-display font-black text-2xl text-neu-primary tracking-tighter cursor-pointer"
          onClick={() => navigate('/')}
        >
          Synectra
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-neu-white border-2 border-neu-black rounded-lg shadow-neu-sm flex items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 text-neu-black" />
        </button>
      </header>

      {/* Main Container: Split-Screen on Desktop (auth.html), Top Visual + Overlay Card on Mobile (auth-mobile.html) */}
      <main className="flex-1 flex flex-col md:flex-row w-full h-screen">
        {/* Left Side: Desktop 3D Visual & Branding */}
        <section className="hidden md:flex flex-col md:w-1/2 relative border-r-3 border-neu-black bg-surface-container-high overflow-hidden items-center justify-center">
          <AuthVisual3D isDesktop={true} />
        </section>

        {/* Right Side / Mobile Layout: Interactive 3D Flip Card */}
        <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 relative bg-neu-bg overflow-y-auto pt-20 md:pt-8">
          {/* Mobile Top Visual Canvas */}
          <div className="w-full md:hidden mb-4 rounded-xl overflow-hidden shadow-neu-md">
            <AuthVisual3D isDesktop={false} />
          </div>



          {/* Flip Card Container */}
          <div className="w-full max-w-md perspective-1000 min-h-[580px] md:h-[640px] flex flex-col">
            <div
              ref={cardRef}
              style={{ transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              className={cn(
                'relative w-full flex-1 transform-style-3d flip-card-inner',
                mode === 'register' && 'flip-active'
              )}
            >
              {/* FRONT: LOGIN FORM */}
              <div className="absolute w-full h-full backface-hidden bg-neu-white border-3 border-neu-black rounded-xl shadow-neu-lg p-6 md:p-8 flex flex-col">
                {/* Segmented Control Tabs */}
                <div className="flex mb-6 gap-2 bg-neu-black/5 p-1 rounded-lg border-2 border-neu-black">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="flex-1 py-2 font-display text-xs md:text-sm font-bold bg-neu-primary text-neu-black border-2 border-neu-black rounded-md shadow-neu-sm transition-all"
                  >
                    LOGIN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className="flex-1 py-2 font-display text-xs md:text-sm font-bold bg-white/20 text-neu-black/60 border-2 border-transparent rounded-md hover:bg-white/40 transition-all"
                  >
                    REGISTER
                  </button>
                </div>

                <div className="mb-5">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-neu-black leading-tight">
                    Welcome<br />Back.
                  </h2>
                  <p className="font-body text-xs md:text-sm text-on-surface-variant mt-1">
                    Enter your details to access Synectra.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 flex-1">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-neu-black font-bold uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative w-full">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setLoginError((p) => ({ ...p, email: '' }));
                        }}
                        placeholder="john@example.com"
                        className={cn(
                          'w-full h-[48px] pl-10 pr-4 bg-neu-white border-2 border-neu-black rounded-md font-body text-sm text-neu-black',
                          'outline-none focus:border-neu-primary focus:shadow-neu-solid transition-all',
                          loginError.email && 'border-neu-accent shadow-[3px_3px_0px_#FF5C5C]'
                        )}
                      />
                    </div>
                    {loginError.email && (
                      <span className="font-body text-xs font-semibold text-neu-accent">{loginError.email}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-neu-black font-bold uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative w-full">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError((p) => ({ ...p, password: '' }));
                        }}
                        placeholder="••••••••"
                        className={cn(
                          'w-full h-[48px] pl-10 pr-10 bg-neu-white border-2 border-neu-black rounded-md font-body text-sm text-neu-black',
                          'outline-none focus:border-neu-primary focus:shadow-neu-solid transition-all',
                          loginError.password && 'border-neu-accent shadow-[3px_3px_0px_#FF5C5C]'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-neu-black"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginError.password && (
                      <span className="font-body text-xs font-semibold text-neu-accent">{loginError.password}</span>
                    )}
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer appearance-none w-4 h-4 border-2 border-neu-black rounded bg-neu-white checked:bg-neu-primary focus:outline-none transition-all"
                        />
                        <Check className="w-3 h-3 absolute text-neu-black opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                      </div>
                      <span className="font-mono text-xs text-neu-black font-bold">Remember me</span>
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert.info('Silakan hubungi administrator untuk reset password.');
                      }}
                      className="font-mono text-xs text-neu-black font-bold underline decoration-2 underline-offset-4 hover:text-neu-primary transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Initiate Sequence / Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full h-[52px] bg-neu-primary border-3 border-neu-black rounded-md shadow-neu-md font-display text-lg font-bold text-neu-black uppercase tracking-wider hover:bg-inverse-primary active:translate-y-1 active:shadow-neu-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loginLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin">⟳</span> Initiating...
                      </span>
                    ) : (
                      <>
                      LOGIN
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Google OAuth Login Button */}
                  <div className="mt-2 pt-2 border-t-2 border-neu-black/10">
                    <button
                      type="button"
                      onClick={() => authService.loginWithGoogle()}
                      className="w-full h-[46px] bg-neu-white border-2 border-neu-black rounded-md shadow-[2px_2px_0px_0px_rgba(13,13,13,1)] font-display text-xs md:text-sm font-bold text-neu-black flex items-center justify-center gap-2.5 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full border border-neu-black flex items-center justify-center bg-secondary-container">
                        <span className="text-[10px] font-bold text-neu-white">G</span>
                      </div>
                      {t('login.withGoogle', 'Continue with Google')}
                    </button>
                  </div>
                </form>
              </div>

              {/* BACK: REGISTER FORM */}
              <div className="absolute w-full h-full backface-hidden bg-neu-white border-3 border-neu-black rounded-xl shadow-neu-lg p-6 md:p-8 flex flex-col rotate-y-180">
                {/* Segmented Control Tabs */}
                <div className="flex mb-6 gap-2 bg-neu-black/5 p-1 rounded-lg border-2 border-neu-black">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="flex-1 py-2 font-display text-xs md:text-sm font-bold bg-white/20 text-neu-black/60 border-2 border-transparent rounded-md hover:bg-white/40 transition-all"
                  >
                    LOGIN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className="flex-1 py-2 font-display text-xs md:text-sm font-bold bg-neu-primary text-neu-black border-2 border-neu-black rounded-md shadow-neu-sm transition-all"
                  >
                    REGISTER
                  </button>
                </div>

                <div className="mb-4">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-neu-black leading-tight">
                    Join<br />Network.
                  </h2>
                  <p className="font-body text-xs md:text-sm text-on-surface-variant mt-1">
                    Create your account to start building.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 flex-1">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs text-neu-black font-bold uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative w-full">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
                      <input
                        type="text"
                        value={regForm.fullName}
                        onChange={(e) => {
                          setRegForm((p) => ({ ...p, fullName: e.target.value }));
                          setRegError((p) => ({ ...p, fullName: '' }));
                        }}
                        placeholder="John Doe"
                        className={cn(
                          'w-full h-[44px] pl-10 pr-4 bg-neu-white border-2 border-neu-black rounded-md font-body text-sm text-neu-black',
                          'outline-none focus:border-neu-primary focus:shadow-neu-solid transition-all',
                          regError.fullName && 'border-neu-accent shadow-[3px_3px_0px_#FF5C5C]'
                        )}
                      />
                    </div>
                    {regError.fullName && (
                      <span className="font-body text-xs font-semibold text-neu-accent">{regError.fullName}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs text-neu-black font-bold uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative w-full">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => {
                          setRegForm((p) => ({ ...p, email: e.target.value }));
                          setRegError((p) => ({ ...p, email: '' }));
                        }}
                        placeholder="john@example.com"
                        className={cn(
                          'w-full h-[44px] pl-10 pr-4 bg-neu-white border-2 border-neu-black rounded-md font-body text-sm text-neu-black',
                          'outline-none focus:border-neu-primary focus:shadow-neu-solid transition-all',
                          regError.email && 'border-neu-accent shadow-[3px_3px_0px_#FF5C5C]'
                        )}
                      />
                    </div>
                    {regError.email && (
                      <span className="font-body text-xs font-semibold text-neu-accent">{regError.email}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs text-neu-black font-bold uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative w-full">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        value={regForm.password}
                        onChange={(e) => {
                          setRegForm((p) => ({ ...p, password: e.target.value }));
                          setRegError((p) => ({ ...p, password: '' }));
                        }}
                        placeholder="••••••••"
                        className={cn(
                          'w-full h-[44px] pl-10 pr-10 bg-neu-white border-2 border-neu-black rounded-md font-body text-sm text-neu-black',
                          'outline-none focus:border-neu-primary focus:shadow-neu-solid transition-all',
                          regError.password && 'border-neu-accent shadow-[3px_3px_0px_#FF5C5C]'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-neu-black"
                      >
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regError.password && (
                      <span className="font-body text-xs font-semibold text-neu-accent">{regError.password}</span>
                    )}
                  </div>

                  {/* Establish Link / Submit Button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full h-[50px] bg-neu-black border-3 border-neu-black rounded-md shadow-neu-md font-display text-lg font-bold text-neu-white uppercase tracking-wider hover:bg-neu-black/90 active:translate-y-1 active:shadow-neu-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                  >
                    {regLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin">⟳</span> Establishing...
                      </span>
                    ) : (
                      <>
                     REGISTER
                        <LinkIcon className="w-5 h-5 text-neu-primary" />
                      </>
                    )}
                  </button>

                  {/* Google OAuth Register Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => authService.loginWithGoogle()}
                      className="w-full h-[44px] bg-neu-white border-2 border-neu-black rounded-md shadow-[2px_2px_0px_0px_rgba(13,13,13,1)] font-display text-xs md:text-sm font-bold text-neu-black flex items-center justify-center gap-2.5 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full border border-neu-black flex items-center justify-center bg-secondary-container">
                        <span className="text-[10px] font-bold text-neu-white">G</span>
                      </div>
                      {t('register.withGoogle', 'Continue with Google')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';
import { authService } from '../services/auth.service';
import { Scene3D } from '../components/3d/Scene3D';
import { AlertContainer } from '../components/ui/Alert';
import { useAlert } from '../hooks/useAlert';

export default function LoginPage() {
  const navigate  = useNavigate();
  const alert     = useAlert();
  const cardRef   = useRef(null);
  const titleRef  = useRef(null);
  const formRef   = useRef(null);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [fieldError, setFieldError] = useState({ email: '', password: '' });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(cardRef.current,  { y: 70, opacity: 0, duration: 0.7, ease: 'power3.out' })
        .from(titleRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
        .from(formRef.current,  { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    });
    return () => ctx.revert();
  }, []);

  const shakeCard = () => {
    gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  };

  const validate = () => {
    const errs = { email: '', password: '' };
    if (!email)              errs.email    = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
    if (!password)           errs.password = 'Password wajib diisi';
    setFieldError(errs);
    return !errs.email && !errs.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { shakeCard(); return; }

    setIsLoading(true);
    try {
      await authService.login(email, password);
      alert.success('Login berhasil! Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const message = err?.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
      alert.error(message);
      shakeCard();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />
      <Scene3D />

      <div className="min-h-screen flex items-center justify-center p-4 pointer-events-none relative z-10">
        <div ref={cardRef} className="w-full max-w-md bg-neu-white border-2 border-neu-black shadow-neu-xl p-8 pointer-events-auto">

          {/* Header */}
          <div ref={titleRef} className="mb-8">
            <div className="inline-block bg-neu-primary border-2 border-neu-black px-3 py-1 mb-4 shadow-neu-sm">
              <span className="font-mono font-semibold text-xs text-neu-black uppercase tracking-widest">
                Synectra
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl text-neu-black leading-tight">
              Selamat<br />Datang
            </h1>
            <p className="font-body text-sm text-neu-black/60 mt-2">
              Masuk untuk mengakses platform penerimaan client.
            </p>
          </div>

          {/* Google OAuth — di atas form */}
          <button
            type="button"
            onClick={() => authService.loginWithGoogle()}
            className={cn(
              'w-full py-3 mb-6 font-display font-bold text-sm uppercase tracking-wide',
              'bg-neu-white text-neu-black',
              'border-2 border-neu-black shadow-neu',
              'flex items-center justify-center gap-3',
              'transition-all duration-150',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5 bg-neu-black" />
            <span className="font-mono text-xs text-neu-black/50 uppercase">atau masuk manual</span>
            <div className="flex-1 h-0.5 bg-neu-black" />
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError((p) => ({ ...p, email: '' })); }}
                placeholder="email@perusahaan.com"
                autoComplete="email"
                className={cn(
                  'w-full px-4 py-3 bg-neu-white',
                  'border-2 border-neu-black shadow-neu-sm',
                  'font-body text-neu-black placeholder:text-neu-black/30',
                  'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5',
                  'transition-all duration-150',
                  fieldError.email && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
                )}
              />
              {fieldError.email && (
                <span className="font-body font-semibold text-xs text-neu-accent">{fieldError.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldError((p) => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full px-4 py-3 pr-12 bg-neu-white',
                    'border-2 border-neu-black shadow-neu-sm',
                    'font-body text-neu-black placeholder:text-neu-black/30',
                    'outline-none focus:shadow-neu focus:-translate-x-0.5 focus:-translate-y-0.5',
                    'transition-all duration-150',
                    fieldError.password && 'border-neu-accent shadow-[4px_4px_0px_#FF5C5C]',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-black/50 hover:text-neu-black transition-colors"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldError.password && (
                <span className="font-body font-semibold text-xs text-neu-accent">{fieldError.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 font-display font-bold text-sm uppercase tracking-wide',
                'bg-neu-primary text-neu-black',
                'border-2 border-neu-black shadow-neu',
                'transition-all duration-150',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
                isLoading && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <span className="animate-spin inline-block">⟳</span>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center font-body text-sm text-neu-black/60">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-neu-black underline hover:text-neu-blue transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

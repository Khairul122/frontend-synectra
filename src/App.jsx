import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { tokenStorage } from './services/auth.service';

const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const PortfolioPage      = lazy(() => import('./pages/PortfolioPage'));
const PortfolioFormPage  = lazy(() => import('./pages/PortfolioFormPage'));
const BannerPage         = lazy(() => import('./pages/BannerPage'));
const BannerFormPage     = lazy(() => import('./pages/BannerFormPage'));
const BankAccountPage    = lazy(() => import('./pages/BankAccountPage'));
const BankAccountFormPage = lazy(() => import('./pages/BankAccountFormPage'));
const SocialMediaPage    = lazy(() => import('./pages/SocialMediaPage'));
const SocialMediaFormPage = lazy(() => import('./pages/SocialMediaFormPage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const ContactFormPage    = lazy(() => import('./pages/ContactFormPage'));
const ClientPage         = lazy(() => import('./pages/ClientPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const OrderPage          = lazy(() => import('./pages/OrderPage'));
const OrderFormPage      = lazy(() => import('./pages/OrderFormPage'));
const OrderDetailPage    = lazy(() => import('./pages/OrderDetailPage'));
const MyOrderPage        = lazy(() => import('./pages/MyOrderPage'));
const MyOrderDetailPage  = lazy(() => import('./pages/MyOrderDetailPage'));
const MyOrderFormPage    = lazy(() => import('./pages/MyOrderFormPage'));
const ServicePackagePage     = lazy(() => import('./pages/ServicePackagePage'));
const ServicePackageFormPage = lazy(() => import('./pages/ServicePackageFormPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage    = lazy(() => import('./pages/ServerErrorPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <div className="border-2 border-neu-black shadow-neu px-8 py-6 bg-neu-white">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-neu-black border-t-neu-primary animate-spin" />
          <span className="font-mono text-sm font-bold text-neu-black uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    </div>
  );
}

// Tangkap ?_token= dari Google OAuth redirect dan simpan ke localStorage
function OAuthTokenCapture() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('_token');
    if (token) {
      tokenStorage.set(token);
      // Hapus token dari URL agar tidak terekspos di history
      params.delete('_token');
      const newSearch = params.toString();
      navigate(location.pathname + (newSearch ? `?${newSearch}` : ''), { replace: true });
    }
  }, [location.search]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <OAuthTokenCapture />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/register"           element={<RegisterPage />} />
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/portfolio"          element={<PortfolioPage />} />
        <Route path="/portfolio/new"      element={<PortfolioFormPage />} />
        <Route path="/portfolio/:id/edit" element={<PortfolioFormPage />} />
        <Route path="/banners"            element={<BannerPage />} />
        <Route path="/banners/new"        element={<BannerFormPage />} />
        <Route path="/banners/:id/edit"          element={<BannerFormPage />} />
        <Route path="/bank-accounts"             element={<BankAccountPage />} />
        <Route path="/bank-accounts/new"         element={<BankAccountFormPage />} />
        <Route path="/bank-accounts/:id/edit"    element={<BankAccountFormPage />} />
        <Route path="/social-media"              element={<SocialMediaPage />} />
        <Route path="/social-media/new"          element={<SocialMediaFormPage />} />
        <Route path="/social-media/:id/edit"     element={<SocialMediaFormPage />} />
        <Route path="/contacts"                  element={<ContactPage />} />
        <Route path="/contacts/new"              element={<ContactFormPage />} />
        <Route path="/contacts/:id/edit"         element={<ContactFormPage />} />
        <Route path="/profile"                   element={<ProfilePage />} />
        <Route path="/clients"                   element={<ClientPage />} />
        <Route path="/orders"                    element={<OrderPage />} />
        <Route path="/orders/new"                element={<OrderFormPage />} />
        <Route path="/orders/:id"                element={<OrderDetailPage />} />
        <Route path="/my-orders"                 element={<MyOrderPage />} />
        <Route path="/my-orders/new"             element={<MyOrderFormPage />} />
        <Route path="/my-orders/:id"             element={<MyOrderDetailPage />} />
        <Route path="/service-packages"          element={<ServicePackagePage />} />
        <Route path="/service-packages/new"      element={<ServicePackageFormPage />} />
        <Route path="/service-packages/:id/edit" element={<ServicePackageFormPage />} />
        <Route path="/500"                element={<ServerErrorPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

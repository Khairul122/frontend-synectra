import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import { tokenStorage } from './services/auth.service';
import DashboardPage     from './pages/DashboardPage';
import PortfolioPage     from './pages/PortfolioPage';
import PortfolioFormPage from './pages/PortfolioFormPage';
import BannerPage           from './pages/BannerPage';
import BannerFormPage       from './pages/BannerFormPage';
import BankAccountPage      from './pages/BankAccountPage';
import BankAccountFormPage  from './pages/BankAccountFormPage';
import SocialMediaPage      from './pages/SocialMediaPage';
import SocialMediaFormPage  from './pages/SocialMediaFormPage';
import ContactPage          from './pages/ContactPage';
import ContactFormPage      from './pages/ContactFormPage';
import OrderPage            from './pages/OrderPage';
import OrderFormPage        from './pages/OrderFormPage';
import OrderDetailPage      from './pages/OrderDetailPage';
import MyOrderPage          from './pages/MyOrderPage';
import MyOrderDetailPage    from './pages/MyOrderDetailPage';
import NotFoundPage      from './pages/NotFoundPage';
import ServerErrorPage   from './pages/ServerErrorPage';

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
      <Routes>
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
        <Route path="/orders"                    element={<OrderPage />} />
        <Route path="/orders/new"                element={<OrderFormPage />} />
        <Route path="/orders/:id"                element={<OrderDetailPage />} />
        <Route path="/my-orders"                 element={<MyOrderPage />} />
        <Route path="/my-orders/:id"             element={<MyOrderDetailPage />} />
        <Route path="/500"                element={<ServerErrorPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

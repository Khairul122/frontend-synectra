import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import { tokenStorage } from './services/auth.service';
import DashboardPage     from './pages/DashboardPage';
import PortfolioPage     from './pages/PortfolioPage';
import PortfolioFormPage from './pages/PortfolioFormPage';
import BannerPage        from './pages/BannerPage';
import BannerFormPage    from './pages/BannerFormPage';
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
        <Route path="/banners/:id/edit"   element={<BannerFormPage />} />
        <Route path="/500"                element={<ServerErrorPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
